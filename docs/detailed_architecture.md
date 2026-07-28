# PawPurse - Detailed Architecture Documentation

This document explains the inner workings, data structures, and styling guidelines of the PawPurse emergency triage engine.

---

## 🧠 Multi-Agent AI Orchestration (Google ADK)

PawPurse implements a multi-agent orchestration pipeline using the **Google Agent Development Kit (ADK)** framework. By defining specialized Agent roles, the engine benefits from structured prompt logic and robust session management.

```
 s  +---------------+
 y  | Symptoms Text |
 m  +-------+-------+
 p          |
 t          v
 o  +---------------------+
 m  | pawpurse_router     | ---> Identifies targeted species agent name
 s  | _agent              |      (dog_triage_agent, cat_triage_agent, etc.)
    +-------+-------------+
            |
            v
    +---------------------+      Dog Specialist 🐶  -> triage JSON
    | Selected Specialist | ---> Cat Specialist 🐱  -> triage JSON
    | Agent (via Runner)  |      Rabbit Specialist 🐰 -> triage JSON
    +---------------------+      Bird Specialist 🦜  -> triage JSON
            |                    Other Specialist 🐾  -> triage JSON
            v
    +---------------------+
    | Output Parsing &    | ---> Map to PawPurse UI contract:
    | Mapping Layer       |      - urgency (RED/YELLOW/GREEN)
    +---------------------+      - action_directive (next_step)
                                 - key_instructions (summary + call_clinic alert)
```

### 1. Router Agent (`pawpurse_router_agent`)
When symptoms are submitted, the query is routed first to the ADK Router Agent. It analyzes the symptom text to select the appropriate specialist agent name. If the query does not match any specific pet or is ambiguous, it routes to `other_triage_agent`.

### 2. Specialist Worker Agents
The selected specialist agent is invoked via the ADK `Runner` running on an `InMemorySessionService`:
*   **Dog Specialist (`dog_triage_agent`)**: Applies rules for GDV/bloat in deep-chested breeds, ingestion toxicities, parvovirus, limping, and seizures.
*   **Cat Specialist (`cat_triage_agent`)**: Applies rules for male urinary blockages, feline dyspnea, lily toxicity, pale/blue gums, and hepatic lipidosis.
*   **Rabbit Specialist (`rabbit_triage_agent`)**: Applies rules for GI stasis timing, E. cuniculi head tilts, bruxism pain, flystrike, and cecotropes.
*   **Bird Specialist (`bird_triage_agent`)**: Applies rules for cage floor fluffing, tail bobbing, non-stick PTFE toxicosis, egg binding, and mate regurgitation.
*   **Other Specialist (`other_triage_agent`)**: Handles generic or non-standard pet urgency assessments.

### 3. Triage Output Contract & Synthesis
Each specialist agent conforms to the same structural contract, outputting a JSON block at the end of its response:
```json
{
  "urgency": "RED" | "YELLOW" | "GREEN",
  "summary": "One-sentence plain-English summary of the situation.",
  "next_step": "Single concrete action the owner should take right now.",
  "call_clinic": true | false
}
```
The translation and localization module instructs the worker agent via dynamic prompt query-steering to write the `summary` and `next_step` fields in the target language (English, Japanese, or Burmese) while keeping the `urgency` value in English for frontend CSS binding. The parsed JSON maps to `action_directive` and `key_instructions`.

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
