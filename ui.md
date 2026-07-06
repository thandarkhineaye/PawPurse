# PawPurse — UX Design Doc

**Designer:** Antigravity
**Status:** Draft v0.1
**Last updated:** 2026-06-28

---

## 1. The design bet

We are betting that a sensory, distraction-free "crisis design" with full-screen, breathing color feedback will immediately cut through an owner's panic. By focusing 90% of the design effort on the visual hierarchy and high-contrast styling of the result screen—and keeping the entry screen bare-minimal—we ensure the user gets cognitive clarity in seconds, rather than getting lost in navigation or small-text details.

## 2. The defining interaction

User types a symptom (e.g., "My dog is choking") into the input box and clicks the primary button. The button presses down, the input disables, and a clean, centered loading spinner appears. After 1.5 seconds, the entire screen background smoothly transitions (fades over 400ms) from neutral dark gray to a solid, pulsing ambient color (e.g., alert red for extreme urgency). The triage text and the "Next Step" instruction slide up 20px with a crisp settle animation. Total time: under 2 seconds. Feels like: a sudden, authoritative hand taking over the crisis.

## 3. Screen inventory

v1 consists of a single-page application with two primary states that act as screens:

- **Triage Input Screen** — The landing state where the user enters the pet's current symptoms.
- **Triage Result Screen** — The results state showing the urgency level and next step instructions.

## 4. Screen-by-screen specs

### Triage Input Screen

**Purpose:** Provide a zero-distraction entry point for the user to describe their pet's emergency.

**Layout (top to bottom):**
1. Brand header — Small, quiet logo text "PawPurse" at the top left in a muted gray.
2. Prompt header — Bold text: "What is happening with your pet?"
3. Symptom description input — A large, multi-line text input area. Placeholder text: "Describe symptoms or behavior (e.g., my dog ate chocolate, my cat is breathing heavily)..."
4. Submit button — A full-width, high-contrast primary button labeled "Check Urgency".
5. Disclaimer text — Small, muted footnote at the bottom: "This tool does not diagnose diseases. It helps you evaluate the urgency of a vet visit."

**Key interactions:**
- User types in the description box → Check Urgency button becomes active.
- User clicks "Check Urgency" → Initiates classification, disables inputs, transitions to loading state.

**States:**
- **Default:** Solid deep charcoal background, empty text area, active text cursor.
- **Empty / first-time:** Screen loads immediately with focus on the input box.
- **Loading:** Input area disabled, primary button turns into a centered, rotating spinner, background remains neutral charcoal.
- **Error:** If API fails, a clear banner at the top of the input area states: "Unable to reach triage service. If this is a life-threatening emergency, please visit a clinic immediately."
- **Edge / "too much":** If the user pastes a massive wall of text (>1000 characters), the input scrolls internally, and the character count shows a warning badge.

---

### Triage Result Screen

**Purpose:** Display the triage classification and immediate directive with maximum visual weight.

**Layout (top to bottom):**
1. Urgency status badge — Large, high-contrast pill badge at the top (e.g., "RED: EXTREME URGENCY").
2. Core action directive — Massive, bold headline (e.g., "Go to the nearest emergency clinic immediately. Do not wait.")
3. Guidance details — 2-3 bullet points of immediate home-care or transport instructions (e.g., "Keep the pet warm," "Do not induce vomiting").
4. "Start New Check" button — A secondary, outlined button at the bottom to reset the app.

**Key interactions:**
- User clicks "Start New Check" → Resets the text input, clears previous results, and transitions back to the Triage Input Screen.

**States:**
- **Default (Urgency States):**
  - **Red State:** Screen background turns solid red with a slow, pulsing opacity animation (opacity oscillates between 85% and 100% every 3s). High-contrast white text.
  - **Yellow State:** Screen background turns warm amber. High-contrast dark charcoal text.
  - **Green State:** Screen background turns calm forest green. High-contrast white text.
- **Loading:** Handled by the transition from the Triage Input Screen.
- **Error:** Handled on the input screen.
- **Edge / "too much":** Long directives wrap cleanly in a scrollable, centered container to keep the action button visible above the fold.

## 5. The user journey

User opens the PawPurse web app. They are greeted immediately by a clean, distraction-free input box. Panicked, they type: "My dog is breathing extremely fast and drooling." They click "Check Urgency."

The screen remains calm for a brief moment while showing a loading spinner. Within 1.5 seconds, the screen transitions to a pulsing amber background. The bold title reads "YELLOW: URGENT ATTENTION - Vet Visit Required." The instruction states: "Contact your vet or visit an urgent clinic today. Do not wait for normal hours if symptoms worsen."

Seeing the warm color and clear directive, the owner's panic shifts to focused action. They tap "Start New Check" to run a check for their neighbor's dog later, or close the app to head to the vet.

## 6. Component & visual notes

- **Typography:** Heavy, geometric sans-serif (e.g., Outfit or Inter). Headlines are bold and sized at least 32px to ensure high legibility under stress.
- **Color:**
  - Base: Deep charcoal (`#121212`) for the neutral landing state.
  - Red: Urgency Red (`#E53E3E`) with a slow, smooth pulsing keyframe animation.
  - Yellow: Warning Amber (`#DD6B20`).
  - Green: Safe Green (`#38A169`).
- **Motion:** Fade transitions between screen states (400ms duration). The triage result elements slide up into place with a subtle spring transition (`cubic-bezier(0.175, 0.885, 0.32, 1.275)`).
- **The signature visual:** The full-screen pulsing ambient color background on the result screen, which expands outwards from the input card upon submission to represent the weight of the result.
- **Microcopy voice:** Direct, authoritative, and compassionate. "Checking urgency..." instead of "Running model analysis..."; "Go to the nearest clinic" instead of "Classification indicates immediate attention."

## 7. Accessibility & inclusion

- **Visual:** High-contrast text on solid color backgrounds (minimum WCAG AAA contrast ratio). Large target fonts. Clear aria-live notifications for screen readers.
- **Motor:** Large, touch-friendly primary button targets (at least 60px height) that require no precise gestures.
- **Low Bandwidth:** Extremely small payload size. No heavy media or images; CSS colors and fonts drive the entire layout.
- **Non-English:** While English is the default, standard browser translations are supported through semantic markup.

## 8. What we are NOT designing

- **No Settings or Customization Views** — The styling, fonts, and dark mode are hardcoded for high performance and readability.
- **No History or Logs Screen** — No side panels showing past searches; this keeps the screen clear and fast.
- **No Maps or Clinic Locator Popups** — We do not render maps, clinic cards, or location lists.

## 9. Open design questions

- [ ] How does the visual breathing animation on the Red State affect users who have light sensitivity or motion sickness?
- [ ] Should we display a character counter to prevent users from typing excessively long paragraphs that might time out the backend?

## 10. Handoff to engineering

The full-screen background color transition must be animated via CSS transforms or opacity to keep the frame rate at 60fps on mobile browsers. Any stutter in the transition destroys the feeling of a polished, reliable application.
