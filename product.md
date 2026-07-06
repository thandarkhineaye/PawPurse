# PawPurse — Product Design Doc

**Author:** Antigravity
**Status:** Draft v0.1
**Last updated:** 2026-06-28
**One-liner:** Instant, color-coded urgency triage for anxious pet owners facing sudden medical crises.

---

## 1. The user & the moment

- **Who:** An anxious pet owner facing a sudden, terrifying symptom or behavior in their pet. They are stressed, panic-stricken, and looking for immediate, clear guidance.
- **When:** A sudden medical event (e.g., pet falls, is bleeding, choking, or struggling to breathe) often late at night when regular veterinary clinics are closed.
- **Why now:** Generic internet searches yield clinical, contradictory, or slow-loading information that heightens panic. Pet owners need an instant, non-diagnostic urgency score to guide their immediate next move.

## 2. The contract (I/O)

- **Input:** A single free-text text box where the owner types a description of their pet's current symptom or behavior.
- **Output:** An instantaneous, authoritative, color-coded Urgency Rating (Red, Yellow, Green) paired with a clear, direct "Next Step" action instruction.
- **The loop:** One-shot check. Open the app, type the symptom, receive the color-coded action directive, and act on it.

## 3. The magical moment

> "I typed that my cat fell and was bleeding from the nose, and the screen instantly went solid red telling me: 'Go to the nearest emergency clinic immediately. Do not wait.' It cut through my panic and told me exactly what to do."

## 4. Scope: what we ARE building (v1)

- A single-screen web application containing a minimalist, high-contrast, free-text symptom input field.
- Instant, non-diagnostic triage classification (Red: Extreme Urgency, Yellow: Urgent Attention, Green: Monitor/Non-Urgent) using the Gemini API.
- An authoritative, clear, and action-oriented "Next Step" directive displayed alongside the rating.
- A "Start New Check" button to reset the input and run another triage query.
- Simple, high-performance UI transitions that feel responsive and reassuring.

## 5. Scope: what we are NOT building

- **No Medical Diagnoses or Telehealth Prescriptions** — We will not name diseases or suggest medications, keeping the focus entirely on triage level to avoid diagnostic risk.
- **No Complex Live Maps or In-App Navigation** — No GPS location mapping, route planning, or real-time vet schedule integrations for this phase.
- **No Profile Creation or Onboarding Flows** — No pet registration, profile pictures, or account setup. The app opens directly to the triage input screen.
- **No In-Transit Data Handoffs** — No clinic intake syncing, email summaries, or sharing data with hospital management software.
- **No Chat History or Analytics Dashboards** — The interaction is private and ephemeral; no long-term symptom logging.

## 6. The signature detail

The interface features a distraction-free "crisis design." When the user lands, the interface is a soothing, neutral dark mode. Upon submission, the background transitions to a full-screen, pulsing ambient color block corresponding to the triage rating (soft pulsing red, warning yellow, or steady green). The text is rendered in bold, ultra-legible typography designed to be readable even through tears or shaking hands.

## 7. Success: how we know it worked

- **Primary:** 80% or more of test users report that the triage urgency category matches their expectations and provides immediate decision clarity.
- **What we're NOT measuring:** User signups, session duration (shorter sessions are better), or return rates.

## 8. Open questions

- [ ] What is the optimal prompt structure for the Gemini API to guarantee it performs triage accurately without attempting to diagnose the illness or recommend medication?
- [ ] How should the application handle very short or ambiguous inputs (e.g., "dog bad" or "help") to guide the user to input enough symptom details?

## 9. Handoff

- **For UX:** The visual transition from the input screen to the pulsing triage result screen must feel solid, authoritative, and fast, immediately shifting the user's emotional state.
- **For Eng:** Gemini API latency for triage classification must be under 2.0 seconds; we need a reliable local fallback if the API times out or fails.
