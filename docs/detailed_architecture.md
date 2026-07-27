# PawPurse - Detailed Architecture Documentation

This document explains the inner workings, data structures, and styling guidelines of the PawPurse emergency triage engine.

---

## 🧠 Multi-Agent AI Orchestration

PawPurse implements a structured multi-agent orchestration pipeline to classify pet symptoms. By breaking down classification into discrete roles, each agent operates with narrow context and strict instructions, resulting in high triage precision.

```
 s  +---------------+
 y  | Symptoms Text |
 m  +-------+-------+
 p          |
 t          v
 o  +---------------+      Dog Verifier    -> score
 m  | Router Agent  | ---> Cat Verifier    -> score  ===> Select Highest Score
 s  | (Orchestrator)|      Rabbit Verifier -> score       (e.g., DOG)
    +-------+-------+      Bird Verifier   -> score
            |
            v
    +---------------+
    |  Dog Agent    | ---> Species-Specific Context Assessment
    | (Specialist)  |
    +-------+-------+
            |
            v
    +---------------+
    | Synthesis/    | ---> Final Urgency Rating (RED / YELLOW / GREEN)
    | Triage Agent  |      Localized Directive & Critical First-Aid List
    +---------------+
```

### 1. Router Agent (Orchestrator) & Verifier Sub-Agents
When symptoms are submitted, the main Router Orchestrator invokes five specialized verifier sub-agents in parallel to check if the symptoms match their target species:
*   **Dog Verifier Sub-Agent**: Analyzes symptoms for canine indicators (e.g. bark, puppy, GDV, chocolate, specific breed names).
*   **Cat Verifier Sub-Agent**: Analyzes symptoms for feline indicators (e.g. meow, purr, kitten, lily exposure, urinary blockages).
*   **Rabbit Verifier Sub-Agent**: Analyzes symptoms for lagomorph indicators (e.g. bunny, GI stasis, head tilt).
*   **Bird Verifier Sub-Agent**: Analyzes symptoms for avian indicators (e.g. beak, cage, tail bobbing, feathers, blood feather).
*   **Other Verifier Sub-Agent**: Serves as a general species verifier catch-all.

Each sub-agent returns a confidence score (from `0` to `10`) and its reasoning:
```json
{
  "confidence": 9,
  "reason": "Mention of GDV/bloat and puppy strongly implies a dog."
}
```
The Router Orchestrator aggregates these scores and selects the species with the highest rating. If all scores are below `3`, the system defaults to `"other"`.

### 2. Specialist Agent
The routed species string is sent to a species-specific Specialist Agent prompt. Each specialist analyzes the symptoms under the lens of that species' vulnerabilities:
*   **Canine Specialist**: GDV/bloat, chocolate/xylitol poisoning, heatstroke, or trauma from dog fights.
*   **Feline Specialist**: Urethral blockages (blocked cats), lily toxicity, and rapid open-mouth breathing (feline dyspnea).
*   **Lagomorph Specialist**: GI stasis, head tilt (e.cuniculi), complete limpness, or lack of appetite for 12+ hours.
*   **Avian Specialist**: Tail bobbing, open-mouth breathing (respiratory distress), broken blood feathers, or egg binding.
*   **General Specialist**: General small animal emergency symptoms.

The specialist returns its medical assessment and list of critical variables:
```json
{
  "assessment": "High probability of canine chocolate toxicity.",
  "critical_factors": ["Ate dark chocolate", "Vomiting onset within 2 hours"]
}
```

### 3. Triage & Synthesis Agent
The synthesis agent combines the raw symptoms, routed species, specialist assessment, and critical factors. It evaluates the parameters against strict urgency categories:
*   **RED**: Life-threatening crisis requiring immediate vet intervention.
*   **YELLOW**: Urgent care required; vet visit recommended within 24 hours.
*   **GREEN**: Safe to monitor closely at home.

It outputs the final structured JSON returned to the client:
```json
{
  "urgency": "RED",
  "action_directive": "Go to the nearest emergency clinic immediately. Do not wait.",
  "key_instructions": ["Keep the dog calm", "Transport immediately"]
}
```

---

## 🌐 Localization & Translation Engine

The system supports English, Japanese (日本語), and Burmese (မြန်မာ).
*   **Automatic Detection**: The backend analyzes input characters to detect the language. It checks for Burmese Unicode ranges (`U+1000` to `U+109F`) and Japanese Kanji/Hiragana ranges.
*   **Prompt Localization**: The Synthesis Agent is instructed to translate the final `action_directive` and `key_instructions` to the detected language while keeping the `urgency` value (`RED`, `YELLOW`, `GREEN`) in English so the frontend CSS styles bind correctly.

---

## 🎨 Ambient Design & Styling Guidelines

PawPurse implements a stress-reducing, highly legible **Healthy and Fresh** visual layout:
*   **Mint Green Palette**: Uses botanical green variables (`#f4fcf7` base background, `#12281a` text) representing wellness, care, and growth.
*   **Translucent Containers**: Uses glassmorphic container cards with high backdrop blur (`20px`) and thin borders (`rgba(18, 40, 26, 0.08)`).
*   **Double-Step Font Scaling**: Font sizes are scaled up two notches compared to standard scales (ranging from `14px` detail tags up to `48px` urgency badges) to ensure legibility for anxious users.
*   **Mobile Fluidity**: Implements a unified mobile media breakpoint (`max-width: 600px`) where container margins contract, navigation headers stack vertically, map containers compress, and form actions stack into full-width thumb touch targets.
