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
            self.client = None

    def classify_symptoms(self, symptoms: str, language: str | None = None) -> dict:
        if not language:
            language = detect_language(symptoms)

        # -----------------
        # STEP 1: ROUTER AGENT (ORCHESTRATOR) WITH SUB-MULTI-AGENTS
        # -----------------
        species = "other"
        
        if self.client:
            try:
                candidates = ["dog", "cat", "rabbit", "bird", "other"]
                scores = {}
                reasonings = {}
                
                for candidate in candidates:
                    verifier_prompt = self._get_verifier_prompt(candidate, symptoms)
                    response = self.client.interactions.create(
                        model="gemini-3.5-flash",
                        config={
                            "response_mime_type": "application/json",
                            "response_schema": {
                                "type": "object",
                                "properties": {
                                    "confidence": {"type": "integer"},
                                    "reason": {"type": "string"}
                                },
                                "required": ["confidence", "reason"]
                            },
                            "thinking_level": "minimal"
                        },
                        prompt=verifier_prompt
                    )
                    text_out = self._extract_text(response)
                    data = json.loads(text_out)
                    confidence = max(0, min(10, int(data.get("confidence", 0))))
                    reason = data.get("reason", "")
                    scores[candidate] = confidence
                    reasonings[candidate] = reason
                    print(f"[Sub-Agent Verifier: {candidate.upper()}] Confidence: {confidence}/10 (Reason: {reason})")
                
                best_candidate = max(scores, key=scores.get)
                if scores[best_candidate] >= 3:
                    species = best_candidate
                else:
                    species = "other"
                print(f"[Router Agent Orchestrator] Final Routed Species: {species.upper()} (Highest Score: {scores.get(species, 0)}/10)")
            except Exception as e:
                print(f"[Router Agent Orchestrator] Error during sub-agent routing: {e}. Falling back.")
                species = self._fallback_route(symptoms)
        else:
            species_scores = self._mock_score_route(symptoms)
            species = max(species_scores, key=species_scores.get)
            print(f"[Router Agent Mock Orchestrator] Scores: {species_scores} -> Selected: {species.upper()}")

        # -----------------
        # STEP 2: SPECIALIST AGENT
        # -----------------
        assessment = ""
        critical_factors = []
        
        if self.client:
            try:
                specialist_prompt = self._get_specialist_prompt(species, symptoms)
                specialist_response = self.client.interactions.create(
                    model="gemini-3.5-flash",
                    config={
                        "response_mime_type": "application/json",
                        "response_schema": {
                            "type": "object",
                            "properties": {
                                "assessment": {"type": "string"},
                                "critical_factors": {
                                    "type": "array",
                                    "items": {"type": "string"}
                                }
                            },
                            "required": ["assessment", "critical_factors"]
                        },
                        "thinking_level": "minimal"
                    },
                    prompt=specialist_prompt
                )
                spec_text = self._extract_text(specialist_response)
                spec_data = json.loads(spec_text)
                assessment = spec_data.get("assessment", "")
                critical_factors = spec_data.get("critical_factors", [])
                print(f"[Specialist Agent: {species.upper()}] Completed analysis.")
            except Exception as e:
                print(f"[Specialist Agent: {species.upper()}] Error: {e}. Using safe fallback.")
                assessment = f"General analysis for {species} symptoms."
                critical_factors = ["Observe physical state", "Ensure breathing is unhindered"]
        else:
            # Mock Specialist
            assessment = f"Mocked {species.upper()} specialist analysis of symptoms."
            critical_factors = ["Symptom onset tracking", "Vital sign checks"]
            print(f"[Specialist Agent Mock] Completed.")

        # -----------------
        # STEP 3: URGENCY TRIAGE & SYNTHESIS AGENT
        # -----------------
        if self.client:
            try:
                # Build localized prompt with Specialist context
                lang_instruction = self._get_language_instruction(language)
                synthesis_prompt = (
                    "You are a veterinary urgency triage synthesis agent. Synthesize a final urgency level "
                    "and instructions using the raw symptoms, the routed species, and the Specialist Agent's assessment.\n\n"
                    f"Species: {species.upper()}\n"
                    f"Symptoms: \"{symptoms}\"\n"
                    f"Specialist Assessment: {assessment}\n"
                    f"Specialist Critical Factors: {json.dumps(critical_factors)}\n\n"
                    "Categorize into exactly one of three urgency levels:\n"
                    "- RED: Extreme Urgency - Life-Threatening Crisis\n"
                    "- YELLOW: Urgent Attention - Vet Visit Required\n"
                    "- GREEN: Monitor - Non-Urgent\n\n"
                    f"{lang_instruction}"
                )
                
                triage_response = self.client.interactions.create(
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
                    prompt=synthesis_prompt
                )
                triage_text = self._extract_text(triage_response)
                triage_data = parse_response(triage_text, language)
                print(f"[Triage Agent] Final Triage: {triage_data.get('urgency')}")
                return triage_data
            except Exception as e:
                print(f"[Triage Agent] Error: {e}. Falling back to keyword triage.")
                return self._fallback_triage(symptoms, language)
        else:
            # Mock Triage Synthesis
            triage_data = self._fallback_triage(symptoms, language)
            print(f"[Triage Agent Mock] Final Triage: {triage_data.get('urgency')}")
            return triage_data

    def _extract_text(self, response) -> str:
        if hasattr(response, "steps") and response.steps:
            last_step = response.steps[-1]
            if hasattr(last_step, "content") and last_step.content:
                return last_step.content[0].text
        return "{}"

    def _fallback_route(self, symptoms: str) -> str:
        lower_symptoms = symptoms.lower()
        if any(w in lower_symptoms for w in ["dog", "canine", "puppy", "ခွေး", "犬"]):
            return "dog"
        if any(w in lower_symptoms for w in ["cat", "feline", "kitten", "ကြောင်", "猫"]):
            return "cat"
        if any(w in lower_symptoms for w in ["rabbit", "bunny", "lagomorph", "ယုန်", "うさぎ", "兎"]):
            return "rabbit"
        if any(w in lower_symptoms for w in ["bird", "parrot", "avian", "ငှက်", "鳥"]):
            return "bird"
        return "other"

    def _get_specialist_prompt(self, species: str, symptoms: str) -> str:
        prompts = {
            "dog": (
                "You are a canine veterinary specialist. Dogs are susceptible to bloat, chocolate toxicity, "
                "xylitol poisoning, heatstroke, or trauma from vehicle hits. Analyze these symptoms and provide "
                f"an assessment.\nSymptoms: \"{symptoms}\""
            ),
            "cat": (
                "You are a feline veterinary specialist. Cats hide pain well and are prone to urethral obstructions "
                "(blocked cats), lily toxicity, and rapid open-mouth breathing. Analyze these symptoms and provide "
                f"an assessment.\nSymptoms: \"{symptoms}\""
            ),
            "rabbit": (
                "You are a lagomorph (rabbit) veterinary specialist. Rabbits are prey animals and hide illness. "
                "GI stasis, lack of appetite for 12+ hours, limpness, and head tilt are severe emergencies. Analyze "
                f"these symptoms and provide an assessment.\nSymptoms: \"{symptoms}\""
            ),
            "bird": (
                "You are an avian veterinary specialist. Birds are fragile and hide illness. Respiratory distress "
                "(open-mouth breathing, tail bobbing), egg binding, or bleeding from a broken feather are critical. "
                f"Analyze these symptoms and provide an assessment.\nSymptoms: \"{symptoms}\""
            ),
            "other": (
                "You are a general small animal veterinary specialist. Analyze these symptoms for this pet and "
                f"provide a diagnostic urgency assessment.\nSymptoms: \"{symptoms}\""
            )
        }
        return prompts.get(species, prompts["other"])

    def _get_language_instruction(self, language: str) -> str:
        if language == "ja":
            return (
                "You must respond in Japanese. The fields 'action_directive' and 'key_instructions' "
                "in the JSON response must be translated and written in Japanese. "
                "However, the value of the 'urgency' field must remain in English as 'RED', 'YELLOW', or 'GREEN'."
            )
        elif language == "my":
            return (
                "You must respond in Burmese. The fields 'action_directive' and 'key_instructions' "
                "in the JSON response must be translated and written in Burmese. "
                "However, the value of the 'urgency' field must remain in English as 'RED', 'YELLOW', or 'GREEN'."
            )
        return (
            "You must respond in English. The fields 'action_directive' and 'key_instructions' "
            "in the JSON response must be in English. The 'urgency' field value must be 'RED', 'YELLOW', or 'GREEN'."
        )

    def _fallback_triage(self, symptoms: str, language: str) -> dict:
        lower_symptoms = symptoms.lower()
        is_red = False
        is_yellow = False

        # English keywords
        red_en = [
            "bleed", "blood", "chok", "breath", "unconscious", "collapse", "seizure", "convulsion", "paralyz", 
            "poison", "toxic", "chocolate", "lily", "lilies", "teflon", "smoke", "heatstroke", "heat shock", "stasis", "limp", 
            "fracture", "broken", "unresponsive", "gasp", "pant", "blue", "pale", "bloat", "fit",
            "accident", "hit by car", "run over", "fell from", "dog attack", "animal attack", "trauma", "crash", "collision", "hit by", "struck by",
            "eye bleed", "bleeding eye", "eye bleeding", "proptosis", "eye pop", "eyeball pop", "eye puncture", "blindness",
            "ear torn", "torn ear", "ear bleeding", "bleeding ear", "ear cut off",
            "nosebleed", "nose bleed", "bleeding nose", "epistaxis",
            "severe burn", "chemical burn", "deep wound", "skin torn", "torn skin", "deep puncture", "laceration"
        ]
        yellow_en = [
            "vomit", "diarrhea", "pain",
            "eye scratch", "scratched eye", "swollen eye", "eye discharge", "eye squint", "squinting eye", "eye red", "red eye", "cloudy eye", "watery eye", "eye shut", "closed eye",
            "ear discharge", "head shaking", "shaking head", "scratching ear", "ear scratch", "ear hematoma", "smelly ear", "ear smell", "ear red", "red ear", "swollen ear", "ear infection",
            "nasal discharge", "nose discharge", "sneezing blood", "bloody sneeze", "nose swelling", "swollen nose", "yellow snot", "green snot",
            "skin cut", "wound", "hot spot", "rash", "hives", "minor burn", "skin burn", "abscess", "skin swelling", "swollen skin", "severe itch", "skin red", "red skin", "dermatitis"
        ]

        # Japanese keywords
        red_ja = [
            "出血", "のどにつまる", "窒息", "息", "呼吸", "意識不明", "ぐったり", "血", "吐血", "呼吸困難", 
            "息苦しい", "気絶", "倒れる", "反応がない", "けいれん", "痙攣", "発作", "麻痺", "まひ", "動けない", 
            "中毒", "毒", "チョコレート", "ユリ", "ゆり", "化学物質", "テフロン", "煙", "熱中症", "ヒートショック", "うっ滞", 
            "骨折", "折れる", "ハアハア", "あえぎ呼吸", "蒼白", "胃拡張",
            "事故", "車にひかれた", "ひかれた", "転落", "犬に噛まれた", "噛まれた", "動物に襲われた", "外傷", "衝突", "はねられた",
            "眼球突出", "目が飛び出る", "目が飛び出た", "眼の出血", "目の出血", "失明", "眼に刺さる",
            "耳がちぎれた", "耳の出血", "耳から血",
            "鼻血", "鼻の出血",
            "重度の火傷", "大やけど", "深い創傷", "深い傷", "皮膚が裂けた", "裂傷", "化学やけど"
        ]
        yellow_ja = [
            "嘔吐", "吐く", "下痢", "痛み", "痛い",
            "眼の傷", "目の傷", "目の腫れ", "目やに", "目をこする", "目を気にする", "結膜炎", "目が赤い", "白濁", "涙目", "目が開かない", "閉じた目",
            "耳だれ", "耳垢", "耳アカ", "頭を振る", "耳をかく", "耳の腫れ", "耳血腫", "耳が臭い", "耳が赤い", "外耳炎",
            "鼻水", "鼻汁", "くしゃみと血", "血混じりの鼻水", "鼻の腫れ", "黄色い鼻水",
            "切り傷", "創傷", "ホットスポット", "湿疹", "じんましん", "軽度のやけど", "膿瘍", "皮膚の腫れ", "激しい痒み", "皮膚の赤み", "皮膚炎"
        ]

        # Burmese keywords
        red_my = [
            "သွေးထွက်", "နင်", "အသက်ရှူ", "သတိလစ်", "သွေး", "သီး", "လည်ပင်းနင်", "အသက်ရှူကျပ်", "မေ့မြော", 
            "တက်", "အတက်ရောဂါ", "ဆွဲတက်", "လေဖြတ်", "လှုပ်မရ", "အဆိပ်", "အဆိပ်သင့်", "ချောကလက်", "လီလီ", 
            "လီလီပန်း", "တက်ဖလွန်", "မီးခိုး", "အပူလျှပ်", "အစာအိမ်လှုပ်ရှားမှုရပ်", "လေပွ", "အရိုးကျိုး", "ကျိုး", 
            "ဟောဟဲ", "အသက်ရှူပြင်း", "ဖြူဖျော့", "ပြာနှမ်း", "ဗိုက်ပွ", "လေထိုး",
            "မတော်တဆ", "ကားတိုက်", "ပြုတ်ကျ", "ခွေးကိုက်", "အခြားတိရစ္ဆာန်ကိုက်", "ဒဏ်ရာရ", "တိုက်မိ", "ဆောင့်မိ",
            "မျက်လုံးပြူးထွက်", "မျက်လုံးပြူး", "မျက်လုံးမှသွေးထွက်", "မျက်စိကွယ်", "မျက်လုံးစူး", "မျက်စိပေါက်",
            "နားရွက်ပြတ်", "နားရွက်ပြဲ", "နားမှသွေးထွက်",
            "နှာခေါင်းသွေးယို", "နှာခေါင်းသွေးကျ", "နှာခေါင်းမှသွေးထွက်",
            "မီးလောင်ဒဏ်ရာပြင်းထန်", "ဒဏ်ရာအနက်ကြီး", "အရေပြားပြဲထွက်", "ဓာတုမီးလောင်"
        ]
        yellow_my = [
            "အော့အန်", "အန်", "ဝမ်းလျှော", "ဝမ်းပျက်", "နာကျင်", "ကိုက်",
            "မျက်လုံးခြစ်မိ", "မျက်လုံးနာ", "မျက်လုံးရောင်", "မျက်စိနာ", "မျက်စိအချွဲထွက်", "မျက်လုံးမှိတ်ထား", "မျက်လုံးနီ", "မျက်စိမှုံ", "မျက်ရည်အဆက်မပြတ်ထွက်",
            "နားပြည်ထွက်", "နားကုတ်", "နားယား", "ခေါင်းခါ", "နားရောင်", "နားရွက်သွေးစု", "နားနံ", "နားနီ", "နားပိုးဝင်",
            "နှာရည်ယို", "နှာစေး", "နှာချေပြီးသွေးပါ", "နှာခေါင်းရောင်", "နှာရည်ဝါ", "နှာရည်စိမ်း",
            "ရှနာ", "အရေပြားအနာ", "အင်ပြင်", "မီးလောင်ဖု", "ပြည်တည်နာ", "အရေပြားရောင်", "အရေပြားယားယံ", "အရေပြားနီ", "အရေပြားပိုးဝင်"
        ]

        if any(w in lower_symptoms for w in red_en) or \
           any(w in symptoms for w in red_ja) or \
           any(w in symptoms for w in red_my):
            is_red = True
        elif any(w in lower_symptoms for w in yellow_en) or \
             any(w in symptoms for w in yellow_ja) or \
             any(w in symptoms for w in yellow_my):
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
                    "key_instructions": ["Pet ကို တည်ငြိမ်အောင်ထားပါ", "ချက်ချင်း သယ်ယူပို့ဆောင်ပါ"]
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

    def _get_verifier_prompt(self, species: str, symptoms: str) -> str:
        instructions = {
            "dog": (
                "You are a canine symptom verifier sub-agent. Your only task is to evaluate the likelihood that "
                "the symptoms refer to a dog, puppy, or canine-specific issue.\n"
                "Look for canine keywords (dog, puppy, canine, bark, fetch, breed names like Golden Retriever) "
                "or canine-specific issues (e.g. chocolate toxicity, bloat/GDV).\n"
                "Output a confidence score from 0 (completely unrelated to dogs) to 10 (definitely a dog) "
                "and a brief reason.\n\n"
                f"Symptoms: \"{symptoms}\""
            ),
            "cat": (
                "You are a feline symptom verifier sub-agent. Your only task is to evaluate the likelihood that "
                "the symptoms refer to a cat, kitten, or feline-specific issue.\n"
                "Look for feline keywords (cat, kitten, feline, purr, meow, scratch post, claws) "
                "or feline-specific issues (e.g. lily exposure, urinary blockages/blocked cat).\n"
                "Output a confidence score from 0 (completely unrelated to cats) to 10 (definitely a cat) "
                "and a brief reason.\n\n"
                f"Symptoms: \"{symptoms}\""
            ),
            "rabbit": (
                "You are a lagomorph (rabbit) symptom verifier sub-agent. Your only task is to evaluate the likelihood that "
                "the symptoms refer to a rabbit, bunny, or lagomorph-specific issue.\n"
                "Look for rabbit keywords (rabbit, bunny, lagomorph, floppy ears, thumping, hay) "
                "or rabbit-specific issues (e.g. GI stasis, head tilt, lack of appetite for 12+ hours).\n"
                "Output a confidence score from 0 (completely unrelated to rabbits) to 10 (definitely a rabbit) "
                "and a brief reason.\n\n"
                f"Symptoms: \"{symptoms}\""
            ),
            "bird": (
                "You are an avian (bird) symptom verifier sub-agent. Your only task is to evaluate the likelihood that "
                "the symptoms refer to a bird, parrot, or avian-specific issue.\n"
                "Look for avian keywords (bird, parrot, budgie, wings, feathers, cage, beak, bobbing) "
                "or avian-specific issues (e.g. broken blood feather, open-mouth breathing, egg binding).\n"
                "Output a confidence score from 0 (completely unrelated to birds) to 10 (definitely a bird) "
                "and a brief reason.\n\n"
                f"Symptoms: \"{symptoms}\""
            ),
            "other": (
                "You are a general animal symptom verifier sub-agent. Your task is to evaluate if the symptoms "
                "refer to a general animal or a species other than dogs, cats, rabbits, or birds.\n"
                "Output a confidence score from 0 to 10 and a brief reason.\n\n"
                f"Symptoms: \"{symptoms}\""
            )
        }
        return instructions.get(species, instructions["other"])

    def _mock_score_route(self, symptoms: str) -> dict:
        lower_symptoms = symptoms.lower()
        scores = {"dog": 0, "cat": 0, "rabbit": 0, "bird": 0, "other": 1}
        
        if any(w in lower_symptoms for w in ["dog", "canine", "puppy", "ခွေး", "犬"]):
            scores["dog"] += 8
        if any(w in lower_symptoms for w in ["chocolate", "bloat", "gdv", "bark"]):
            scores["dog"] += 5
            
        if any(w in lower_symptoms for w in ["cat", "feline", "kitten", "ကြောင်", "猫"]):
            scores["cat"] += 8
        if any(w in lower_symptoms for w in ["lily", "lilies", "meow", "purr", "blocked"]):
            scores["cat"] += 5
            
        if any(w in lower_symptoms for w in ["rabbit", "bunny", "lagomorph", "ယုန်", "うさぎ", "兎"]):
            scores["rabbit"] += 8
        if any(w in lower_symptoms for w in ["stasis", "head tilt", "thump"]):
            scores["rabbit"] += 5
            
        if any(w in lower_symptoms for w in ["bird", "parrot", "avian", "ငှက်", "鳥"]):
            scores["bird"] += 8
        if any(w in lower_symptoms for w in ["feather", "cage", "beak", "bobbing"]):
            scores["bird"] += 5
            
        return scores
