import os
import json
import google.generativeai as genai
from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai.types import Content, Part
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
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        if self.api_key:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            os.environ["GOOGLE_API_KEY"] = self.api_key
            self.client = True
        else:
            self.client = None

        self.session_service = InMemorySessionService()
        self.MY_USER_ID = "pawpurse_user_001"

        self.TRIAGE_OUTPUT_CONTRACT = """
IMPORTANT — always end your response with a JSON block wrapped in triple-backtick
json fences, shaped exactly like this (no extra keys):

```json
{
  "urgency": "RED",
  "summary": "One-sentence plain-English summary of the situation.",
  "next_step": "Single concrete action the owner should take right now.",
  "call_clinic": true
}
```

Urgency rules:
  RED    → life-threatening; owner must act within minutes (go to ER now / call immediately)
  YELLOW → concerning but not immediately life-threatening; see a vet today
  GREEN  → low risk; monitor at home, routine vet visit if no improvement in 48 h

Never diagnose. Never prescribe. Score urgency only.
"""

        self.dog_agent = Agent(
            name="dog_triage_agent",
            model="gemini-2.5-flash",
            description="Emergency urgency triage specialist for dogs.",
            instruction=f"""
You are PawPurse's Dog Emergency Triage Specialist 🐶.

Your ONLY job is to score the urgency of a dog owner's described emergency
(RED / YELLOW / GREEN) and tell them the single next step. You do NOT diagnose,
prescribe medication, or provide treatment plans.

Dog-specific knowledge to apply:
- Bloat (GDV) in deep-chested breeds (Great Dane, Boxer, Weimaraner) → always RED
- Chocolate, xylitol, grapes/raisins, macadamia nuts ingestion → RED
- Parvovirus signs (bloody vomit + diarrhea in unvaccinated puppy) → RED
- Limping without weight-bearing → YELLOW
- Single vomit with normal behaviour → GREEN
- Seizure lasting > 5 min or cluster seizures → RED

{self.TRIAGE_OUTPUT_CONTRACT}
""",
        )

        self.cat_agent = Agent(
            name="cat_triage_agent",
            model="gemini-2.5-flash",
            description="Emergency urgency triage specialist for cats.",
            instruction=f"""
You are PawPurse's Cat Emergency Triage Specialist 🐱.

Your ONLY job is to score the urgency of a cat owner's described emergency
(RED / YELLOW / GREEN) and tell them the single next step. You do NOT diagnose,
prescribe medication, or provide treatment plans.

Cat-specific knowledge to apply:
- Urinary blockage in male cats (straining, crying, no urine output) → RED
- Open-mouth breathing / laboured breathing in cat → RED (cats are obligate nasal breathers)
- Lily ingestion (any part of plant) → RED (acute kidney failure)
- Pale or blue gums → RED
- Not eating for > 48 h → YELLOW (hepatic lipidosis risk)
- Hiding + lethargy without other signs → YELLOW
- Single hairball episode with normal behaviour → GREEN

{self.TRIAGE_OUTPUT_CONTRACT}
""",
        )

        self.rabbit_agent = Agent(
            name="rabbit_triage_agent",
            model="gemini-2.5-flash",
            description="Emergency urgency triage specialist for rabbits.",
            instruction=f"""
You are PawPurse's Rabbit Emergency Triage Specialist 🐰.

Your ONLY job is to score the urgency of a rabbit owner's described emergency
(RED / YELLOW / GREEN) and tell them the single next step. You do NOT diagnose,
prescribe medication, or provide treatment plans.

Rabbit-specific knowledge to apply:
- GI stasis (no droppings > 4–6 h, not eating) → RED (rabbits can deteriorate in hours)
- Head tilt (E. cuniculi suspect) → YELLOW-to-RED depending on progression
- Teeth grinding loudly (bruxism) → YELLOW (pain signal)
- Flystrike (maggots on skin) → RED
- Soft cecotropes left uneaten → YELLOW
- Normal cecotrope eating behaviour mistaken for "eating poop" → GREEN

{self.TRIAGE_OUTPUT_CONTRACT}
""",
        )

        self.bird_agent = Agent(
            name="bird_triage_agent",
            model="gemini-2.5-flash",
            description="Emergency urgency triage specialist for pet birds (parrots, budgies, cockatiels, finches).",
            instruction=f"""
You are PawPurse's Bird Emergency Triage Specialist 🦜.

Your ONLY job is to score the urgency of a bird owner's described emergency
(RED / YELLOW / GREEN) and tell them the single next step. You do NOT diagnose,
prescribe medication, or provide treatment plans.

Bird-specific knowledge to apply:
- Fluffed feathers + sitting on cage floor → RED (birds hide illness; floor-sitting = critical)
- Open-mouth breathing / tail-bobbing → RED
- Avocado, chocolate, caffeine, xylitol ingestion → RED
- Teflon/non-stick fumes (PTFE toxicosis) → RED (can kill within minutes)
- Egg binding in hen (straining, fluffed, on floor) → RED
- Regurgitation to a mirror or toy (mate-feeding behaviour) → GREEN
- Single loose dropping, otherwise normal → GREEN

{self.TRIAGE_OUTPUT_CONTRACT}
""",
        )

        self.other_agent = Agent(
            name="other_triage_agent",
            model="gemini-2.5-flash",
            description="Emergency urgency triage specialist for other animals.",
            instruction=f"""
You are PawPurse's General Pet Emergency Triage Specialist 🐾.

Your ONLY job is to score the urgency of a pet owner's described emergency
(RED / YELLOW / GREEN) and tell them the single next step. You do NOT diagnose,
prescribe medication, or provide treatment plans.

General pet knowledge to apply:
- Severe bleeding, gasping, or unconsciousness -> always RED urgency.
- Extreme lethargy, limpness, not moving -> RED urgency.
- Minor cuts, scratching, slight swelling -> YELLOW urgency.
- Mild symptoms, scratching, normal eating and alertness -> GREEN urgency.

{self.TRIAGE_OUTPUT_CONTRACT}
""",
        )

        self.router_agent = Agent(
            name="pawpurse_router_agent",
            model="gemini-2.5-flash",
            description="Routes a pet emergency query to the correct species specialist.",
            instruction="""
You are PawPurse's triage router.

Read the owner's message and decide which specialist should handle it.
Return ONLY the exact agent name — nothing else, no punctuation, no explanation.

Available specialists:
  dog_triage_agent    → for dogs
  cat_triage_agent    → for cats
  rabbit_triage_agent → for rabbits (and guinea pigs as fallback)
  bird_triage_agent   → for birds (parrots, budgies, cockatiels, canaries, finches)
  other_triage_agent  → for other animals (reptiles, fish, turtles, general animals)

If the species is ambiguous or not in the list above, return: other_triage_agent
""",
        )

        self.worker_agents = {
            "dog_triage_agent":    self.dog_agent,
            "cat_triage_agent":    self.cat_agent,
            "rabbit_triage_agent": self.rabbit_agent,
            "bird_triage_agent":   self.bird_agent,
            "other_triage_agent":  self.other_agent,
        }

    def classify_symptoms(self, symptoms: str, language: str | None = None) -> dict:
        if not language:
            language = detect_language(symptoms)

        if self.client:
            try:
                import asyncio
                # Run the async ADK pipeline in a synchronous wrapper
                triage = asyncio.run(self._run_adk_pipeline(symptoms, language))
                return triage
            except Exception as e:
                print(f"[TriageEngine ADK Error] {e}. Falling back to keyword triage.")
                return self._fallback_triage(symptoms, language)
        else:
            return self._fallback_triage(symptoms, language)

    async def _run_adk_pipeline(self, query: str, language: str) -> dict:
        import json, re

        # Step 1: Route
        router_session = await self.session_service.create_session(
            app_name=self.router_agent.name, user_id=self.MY_USER_ID
        )
        chosen_route = await self._run_agent_async(self.router_agent, query, router_session)
        chosen_route = chosen_route.strip().strip("'\"")

        if chosen_route not in self.worker_agents:
            chosen_route = "other_triage_agent"

        print(f"🚦 Router Agent → Selected specialist: {chosen_route.upper()}")

        # Step 2: Triage with Specialist
        specialist = self.worker_agents[chosen_route]
        specialist_session = await self.session_service.create_session(
            app_name=specialist.name, user_id=self.MY_USER_ID
        )

        # Dynamic query steering for localization translation mapping
        lang_map = {"ja": "Japanese", "my": "Burmese", "en": "English"}
        target_lang = lang_map.get(language, "English")

        steered_query = (
            f"Symptom description: \"{query}\"\n\n"
            f"Generate the 'summary' and 'next_step' fields in the final JSON response in: {target_lang}. "
            f"The 'urgency' field must remain in English ('RED', 'YELLOW', or 'GREEN')."
        )

        raw_response = await self._run_agent_async(specialist, steered_query, specialist_session)
        print(f"[Specialist Agent: {chosen_route.upper()}] Completed analysis.")

        # Step 3: Parse response JSON
        triage = {"urgency": "YELLOW", "summary": raw_response, "next_step": "Please consult a vet.", "call_clinic": True}
        match = re.search(r"```json\s*(\{.*?\})\s*```", raw_response, re.DOTALL)
        if not match:
            match = re.search(r"(\{.*?\})", raw_response, re.DOTALL)

        if match:
            try:
                triage = json.loads(match.group(1))
            except json.JSONDecodeError:
                pass

        action_directive = triage.get("next_step", "Please consult a vet.")
        key_instructions = [triage.get("summary", "Symptom check completed.")]
        if triage.get("call_clinic"):
            if language == "ja":
                key_instructions.append("ただちに近くの救急動物病院に連絡してください。")
            elif language == "my":
                key_instructions.append("အနီးဆုံး အရေးပေါ် တိရစ္ဆာန်ဆေးကုခန်းသို့ ချက်ချင်း ဖုန်းခေါ်ဆိုပါ။")
            else:
                key_instructions.append("Contact your nearest emergency veterinary clinic immediately.")

        return {
            "urgency": triage.get("urgency", "YELLOW"),
            "action_directive": action_directive,
            "key_instructions": key_instructions
        }

    async def _run_agent_async(self, agent: Agent, query: str, session) -> str:
        runner = Runner(
            agent=agent,
            session_service=self.session_service,
            app_name=agent.name,
        )
        final = ""
        async for event in runner.run_async(
            user_id=self.MY_USER_ID,
            session_id=session.id,
            new_message=Content(parts=[Part(text=query)], role="user"),
        ):
            if event.is_final_response():
                final = event.content.parts[0].text
        return final

    def _fallback_triage(self, symptoms: str, language: str) -> dict:
        lower_symptoms = symptoms.lower()
        is_red = False
        is_yellow = False

        # English keywords
        red_en = [
            "bleed", "blood", "chok", "breath", "unconscious", "collapse", "seizure", "convulsion", "paralyz", 
            "poison", "toxic", "chocolate", "lily", "lilies", "teflon", "smoke", "heatstroke", "heat shock", "stasis", "limp", 
            "fracture", "broken", "unresponsive", "gasp", "pant", "blue", "pale", "bloat", "fit",
            "xylitol", "grapes", "raisins", "macadamia", "parvovirus", "blockage", "straining", "crying",
            "fluffed", "cage floor", "tail-bobbing", "avocado", "egg binding", "flystrike", "maggots",
            "accident", "hit by car", "run over", "fell from", "dog attack", "animal attack", "trauma", "crash", "collision", "hit by", "struck by",
            "eye bleed", "bleeding eye", "eye bleeding", "proptosis", "eye pop", "eyeball pop", "eye puncture", "blindness",
            "ear torn", "torn ear", "ear bleeding", "bleeding ear", "ear cut off",
            "nosebleed", "nose bleed", "bleeding nose", "epistaxis",
            "severe burn", "chemical burn", "deep wound", "skin torn", "torn skin", "deep puncture", "laceration"
        ]
        yellow_en = [
            "vomit", "diarrhea", "pain", "not eating", "hiding", "lethargy", "head tilt", "teeth grinding", "bruxism", "cecotropes",
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

    def _fallback_route(self, symptoms: str) -> str:
        lower_symptoms = symptoms.lower()
        if any(w in lower_symptoms for w in ["dog", "canine", "puppy", "ခွေး", "犬"]):
            return "dog_triage_agent"
        if any(w in lower_symptoms for w in ["cat", "feline", "kitten", "ကြောင်", "猫"]):
            return "cat_triage_agent"
        if any(w in lower_symptoms for w in ["rabbit", "bunny", "lagomorph", "ယုန်", "うさぎ", "兎"]):
            return "rabbit_triage_agent"
        if any(w in lower_symptoms for w in ["bird", "parrot", "avian", "ငှက်", "鳥"]):
            return "bird_triage_agent"
        return "other_triage_agent"

    def _mock_score_route(self, symptoms: str) -> dict:
        lower_symptoms = symptoms.lower()
        scores = {"dog_triage_agent": 0, "cat_triage_agent": 0, "rabbit_triage_agent": 0, "bird_triage_agent": 0, "other_triage_agent": 1}
        
        if any(w in lower_symptoms for w in ["dog", "canine", "puppy", "ခွေး", "犬"]):
            scores["dog_triage_agent"] += 8
        if any(w in lower_symptoms for w in ["chocolate", "bloat", "gdv", "bark"]):
            scores["dog_triage_agent"] += 5
            
        if any(w in lower_symptoms for w in ["cat", "feline", "kitten", "ကြောင်", "猫"]):
            scores["cat_triage_agent"] += 8
        if any(w in lower_symptoms for w in ["lily", "lilies", "meow", "purr", "blocked"]):
            scores["cat_triage_agent"] += 5
            
        if any(w in lower_symptoms for w in ["rabbit", "bunny", "lagomorph", "ယုန်", "うさぎ", "兎"]):
            scores["rabbit_triage_agent"] += 8
        if any(w in lower_symptoms for w in ["stasis", "head tilt", "thump"]):
            scores["rabbit_triage_agent"] += 5
            
        if any(w in lower_symptoms for w in ["bird", "parrot", "avian", "ငှက်", "鳥"]):
            scores["bird_triage_agent"] += 8
        if any(w in lower_symptoms for w in ["feather", "cage", "beak", "bobbing"]):
            scores["bird_triage_agent"] += 5
            
        return scores
