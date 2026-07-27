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
 o  +---------------+      Dog Verifier/Specialist    -> score + assessment
 m  | Router Agent  | ---> Cat Verifier/Specialist    -> score + assessment  ===> Select Highest Score
 s  | (Orchestrator)|      Rabbit Verifier/Specialist -> score + assessment       (e.g., DOG)
    +-------+-------+      Bird Verifier/Specialist   -> score + assessment
            |
            v
    +---------------+
    | Synthesis/    | ---> Final Urgency Rating (RED / YELLOW / GREEN)
    | Triage Agent  |      Localized Directive & Critical First-Aid List
    +---------------+
```

### 1. Router Agent (Orchestrator) & Verifier/Specialist Sub-Agents
When symptoms are submitted, the main Router Orchestrator invokes five parallel sub-agents to evaluate both species applicability (for routing) and diagnostic assessment:
*   **Dog Verifier & Specialist**: Verifies canine indicators and assesses canine emergencies (GDV/bloat, chocolate poisoning, heatstroke).
*   **Cat Verifier & Specialist**: Verifies feline indicators and assesses feline emergencies (urethral blockages, lily toxicity, feline dyspnea).
*   **Rabbit Verifier & Specialist**: Verifies rabbit indicators and assesses rabbit emergencies (GI stasis, head tilt, limpness).
*   **Bird Verifier & Specialist**: Verifies avian indicators and assesses avian emergencies (respiratory distress, broken blood feathers, egg binding).
*   **Other Verifier & Specialist**: Handles general/non-standard pet emergency assessments.

Each sub-agent returns both confidence scores and specialist diagnostic assessment details in a unified JSON output:
```json
{
  "confidence": 9,
  "reason": "Mention of GDV/bloat and puppy strongly implies a dog.",
  "assessment": "High probability of canine chocolate toxicity.",
  "critical_factors": ["Ate dark chocolate", "Vomiting onset within 2 hours"]
}
```
The Router Orchestrator aggregates the confidence scores and selects the species with the highest rating. If all scores are below `3`, the system defaults to `"other"`.

### 2. Merged Execution
By combining the verification and specialist diagnostics into a single parallel call, the engine retrieves the pre-calculated specialist `assessment` and `critical_factors` directly from the selected species sub-agent's response. This eliminates a separate API call roundtrip, dropping latency from three sequential hops down to two.

### 3. Triage & Synthesis Agent
The synthesis agent combines the raw symptoms, routed species, and the pre-calculated specialist assessment and critical factors from the winning verifier. It evaluates the parameters against strict urgency categories:
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
