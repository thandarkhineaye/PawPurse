import os
import json
from google import genai
from pydantic import BaseModel

class TriageResult(BaseModel):
    urgency: str
    action_directive: str
    key_instructions: list[str]

def detect_language(text: str) -> str:
    """Detect the language of the symptom text based on CJK and Burmese Unicode ranges."""
    # Check for Burmese characters (Myanmar Unicode block: U+1000 to U+109F)
    if any('\u1000' <= char <= '\u109f' for char in text):
        return "my"
    # Check for Japanese characters (Hiragana, Katakana, Kanji)
    if any(('\u3040' <= char <= '\u30ff') or ('\u4e00' <= char <= '\u9faf') for char in text):
        return "ja"
    return "en"

def format_prompt(symptoms: str, language: str | None = None) -> str:
    """Format the symptoms into a strict prompt for the triage engine, specifying language output constraints."""
    if not language:
        language = detect_language(symptoms)

    if language == "ja":
        lang_instruction = (
            "You must respond in Japanese. The fields 'action_directive' and 'key_instructions' "
            "in the JSON response must be translated and written in Japanese. "
            "However, the value of the 'urgency' field must remain in English as 'RED', 'YELLOW', or 'GREEN'."
        )
    elif language == "my":
        lang_instruction = (
            "You must respond in Burmese. The fields 'action_directive' and 'key_instructions' "
            "in the JSON response must be translated and written in Burmese. "
            "However, the value of the 'urgency' field must remain in English as 'RED', 'YELLOW', or 'GREEN'."
        )
    else:
        lang_instruction = (
            "You must respond in English. The fields 'action_directive' and 'key_instructions' "
            "in the JSON response must be in English. The 'urgency' field value must be 'RED', 'YELLOW', or 'GREEN'."
        )

    return (
        "You are an emergency veterinary triage assistant. Your ONLY job is to evaluate "
        "the following symptoms and categorize the urgency.\n"
        "DO NOT attempt to diagnose any specific disease or suggest any medication.\n"
        "Categorize into exactly one of three urgency levels:\n"
        "- RED: Extreme Urgency - Life-Threatening Crisis\n"
        "- YELLOW: Urgent Attention - Vet Visit Required\n"
        "- GREEN: Monitor - Non-Urgent\n\n"
        f"{lang_instruction}\n\n"
        f"Symptoms: \"{symptoms}\""
    )

def parse_response(response_text: str, language: str | None = None) -> dict:
    """Parse the JSON response from Gemini, with a safe localized fallback."""
    try:
        # Some LLMs return markdown json blocks, strip them
        clean_text = response_text.strip()
        if clean_text.startswith("```json"):
            clean_text = clean_text[7:]
        if clean_text.startswith("```"):
            clean_text = clean_text[3:]
        if clean_text.endswith("```"):
            clean_text = clean_text[:-3]
            
        data = json.loads(clean_text)
        
        # Validate structure roughly
        if "urgency" not in data or "action_directive" not in data or "key_instructions" not in data:
            raise ValueError("Missing fields")
            
        return data
    except Exception:
        # Safe fallback in case of parsing error
        if language == "ja":
            return {
                "urgency": "RED",
                "action_directive": "判定結果を解析できませんでした。ただちに最寄りの動物病院を受診してください。",
                "key_instructions": ["確信が持てない場合は、最寄りのクリニックに向かってください。"]
            }
        elif language == "my":
            return {
                "urgency": "RED",
                "action_directive": "တုံ့ပြန်မှုကို ခွဲခြမ်းစိတ်ဖြာ၍မရပါ။ တိရစ္ဆာန်ဆေးကုဆရာဝန်နှင့် ချက်ချင်းဆက်သွယ်ပါ။",
                "key_instructions": ["သေချာမသိပါက အနီးဆုံး ဆေးခန်းသို့ သွားပါ။"]
            }
        else:
            return {
                "urgency": "RED",
                "action_directive": "Unable to parse triage response. Please contact a veterinary professional immediately.",
                "key_instructions": ["Proceed to the nearest clinic if you are unsure."]
            }

class TriageEngine:
    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY")
        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
        else:
            # We allow client to be None for testing/mocking
            self.client = None
            
    def classify_symptoms(self, symptoms: str, language: str | None = None) -> dict:
        if not language:
            language = detect_language(symptoms)

        prompt = format_prompt(symptoms, language)
        
        if not self.client:
            # MOCK MODE: If no API key is provided, use basic keyword matching to allow UI testing
            lower_symptoms = symptoms.lower()
            is_red = False
            is_yellow = False

            # English keywords
            if any(w in lower_symptoms for w in ["bleed", "chok", "breath", "unconscious"]):
                is_red = True
            elif any(w in lower_symptoms for w in ["vomit", "diarrhea", "pain"]):
                is_yellow = True

            # Japanese keywords
            if any(w in symptoms for w in ["出血", "のどにつまる", "窒息", "息", "呼吸", "意識不明", "ぐったり"]):
                is_red = True
            elif any(w in symptoms for w in ["嘔吐", "吐く", "下痢", "痛み", "痛い"]):
                is_yellow = True

            # Burmese keywords
            if any(w in symptoms for w in ["သွေးထွက်", "နင်", "အသက်ရှူ", "သတိလစ်"]):
                is_red = True
            elif any(w in symptoms for w in ["အော့အန်", "အန်", "ဝမ်းလျှော", "ဝမ်းပျက်", "နာကျင်", "ကိုက်"]):
                is_yellow = True

            if is_red:
                if language == "ja":
                    return {
                        "urgency": "RED",
                        "action_directive": "ただちに最寄りの夜間・救急動物病院を受診してください。待たずにすぐ行動してください。",
                        "key_instructions": ["ペットを落ち着かせる", "ただちに搬送する"]
                    }
                elif language == "my":
                    return {
                        "urgency": "RED",
                        "action_directive": "နီးစပ်ရာ အရေးပေါ် တိရစ္ဆာန်ဆေးကုခန်းသို့ ချက်ချင်း သွားပါ။ မစောင့်ဆိုင်းပါနှင့်။",
                        "key_instructions": ["အိမ်မွေးတိရစ္ဆာန်ကို တည်ငြိမ်အောင်ထားပါ", "ချက်ချင်း သယ်ယူပို့ဆောင်ပါ"]
                    }
                else:
                    return {
                        "urgency": "RED", 
                        "action_directive": "Go to the nearest emergency clinic immediately. Do not wait.", 
                        "key_instructions": ["Keep the pet calm", "Transport immediately"]
                    }
            elif is_yellow:
                if language == "ja":
                    return {
                        "urgency": "YELLOW",
                        "action_directive": "かかりつけの獣医師に連絡するか、今日中に救急対応の動物病院を受診してください。",
                        "key_instructions": ["状態を注意深く観察する", "食事を与えない"]
                    }
                elif language == "my":
                    return {
                        "urgency": "YELLOW",
                        "action_directive": "သင့်တိရစ္ဆာန်ဆရာဝန်ထံ ဆက်သွယ်ပါ သို့မဟုတ် ယနေ့အတွင်း အရေးပေါ်ဆေးခန်းသို့ သွားရောက်ပါ။",
                        "key_instructions": ["အနီးကပ် စောင့်ကြည့်ပါ", "အစာမကျွေးပါနှင့်"]
                    }
                else:
                    return {
                        "urgency": "YELLOW", 
                        "action_directive": "Contact your vet or visit an urgent clinic today.", 
                        "key_instructions": ["Monitor closely", "Do not feed"]
                    }
            else:
                if language == "ja":
                    return {
                        "urgency": "GREEN",
                        "action_directive": "自宅で様子を見てください。緊急の受診は不要です。",
                        "key_instructions": ["快適に過ごせるようにする", "変化がないか観察する"]
                    }
                elif language == "my":
                    return {
                        "urgency": "GREEN",
                        "action_directive": "အိမ်တွင် စောင့်ကြည့်ပါ။ အရေးပေါ်သွားရောက်ရန် မလိုအပ်ပါ။",
                        "key_instructions": ["သက်တောင့်သက်သာဖြစ်အောင် ထားပါ", "အပြောင်းအလဲများကို စောင့်ကြည့်ပါ"]
                    }
                else:
                    return {
                        "urgency": "GREEN", 
                        "action_directive": "Monitor your pet at home. No urgent visit required.", 
                        "key_instructions": ["Keep comfortable", "Observe for changes"]
                    }
            
        # Using Gemini 3.5 Interactions API with minimal thinking level
        response = self.client.interactions.create(
            model="gemini-3.5-flash",
            config={
                "response_mime_type": "application/json",
                "response_schema": {
                    "type": "object",
                    "properties": {
                        "urgency": {"type": "string", "enum": ["RED", "YELLOW", "GREEN"]},
                        "action_directive": {"type": "string"},
                        "key_instructions": {
                            "type": "array",
                            "items": {"type": "string"}
                        }
                    },
                    "required": ["urgency", "action_directive", "key_instructions"]
                },
                "thinking_level": "minimal"
            },
            prompt=prompt
        )
        
        # Interactions API structure: response.steps[-1].content[0].text
        # Fallback if structure is unexpected
        text_output = "{}"
        if hasattr(response, "steps") and response.steps:
            last_step = response.steps[-1]
            if hasattr(last_step, "content") and last_step.content:
                text_output = last_step.content[0].text
        
        return parse_response(text_output, language)
