# PawPurse - Testing Guide

This document explains the testing architecture of PawPurse, covers the assertions checked in the test suite, and provides guidelines for running unit and visual regression tests.

---

## 🧪 Testing Architecture

PawPurse organizes its testing suite within the `tests/` directory:
*   `tests/conftest.py`: Manages test fixtures and environment setups.
*   `tests/test_triage.py`: Main backend test suite verifying symptom parsing, prompt configurations, local fallback classifications, and agentic species routing.

---

## 🛠️ Running the Test Suite

The project uses `pytest` for backend testing and `uv` for dependency sandboxing.

### Running Backend Tests
To run the full suite of unit and integration tests, run the following command from the project root:
```bash
uv run pytest
```

---

## 📋 Test Suite Coverage

The test suite in [`tests/test_triage.py`](file:///c:/Users/Thandar_Khine_Aye/Projects/PawPurse/tests/test_triage.py) verifies the following key areas:

### 1. Prompt Formatting
*   `test_format_prompt()`: Asserts that the prompts generated for the synthesis stage include all critical urgency labels (`RED`, `YELLOW`, `GREEN`) and accurately interpolate the user's input symptom string.

### 2. JSON Parsing & Fallbacks
*   `test_parse_response_valid_json()`: Confirms that valid JSON responses from the Gemini API are correctly loaded into structured Python dictionaries.
*   `test_parse_response_markdown_json()`: Verifies that markdown JSON code blocks (` ```json ... ``` `) are successfully stripped and parsed.
*   `test_parse_response_fallback_on_invalid()`: Asserts that invalid or incomplete JSON strings trigger a graceful, RED-urgency veterinary fallback.

### 3. API Integration & Error Boundaries
*   `test_triage_flow_happy_path()`: Mocks the classification engine to test that the `/api/triage` API endpoint returns a standard `200` response containing urgency details.
*   `test_triage_flow_validation_error()`: Asserts that submitting empty or blank symptoms immediately returns a `400` validation error, preventing empty API queries.
*   `test_triage_flow_api_down()`: Verifies that if Gemini encounters a timeout or connection issue, the backend catches the error and returns a clean `503` status.

### 4. Local Rule-Engine Fallbacks
*   `test_local_triage_heat_shock()`: Forces the Gemini client to `None` to test local classification. It asserts that entering "heat shock" in English or "ヒートショック" in Japanese returns a `RED` rating.

### 5. Multi-Agent Routing Verifiers
*   `test_agentic_router_detection()`: Verifies that the verifier sub-agents fallback router correctly maps test strings to their categories (e.g. "puppy" -> `"dog"`, "猫" -> `"cat"`, "bunny" -> `"rabbit"`, "avian" -> `"bird"`, and "turtle" -> `"other"`).
*   `test_mock_score_route()`: Asserts that the keyword scoring algorithm correctly assigns higher weights to matching species (e.g. confirming that "cat ate lily leaf" rates higher for `"cat"` than `"dog"`, `"rabbit"`, or `"bird"`).

---

## 👁️ Visual & Responsive Verification

Visual verification checks that layouts, sizing, map tiles, and button states scale beautifully on all desktop and mobile devices:
1.  **Start Localhost**: `uv run uvicorn backend.main:app`
2.  **Verify Layout Boundaries**:
    *   **Desktop (1440px)**: Centered app card, maximum width bounded at `840px` (landing) and `760px` (results).
    *   **Mobile (< 600px)**: Unified mobile breakpoints active. Header elements stacked vertically and center-aligned. Selectors, textareas, and map tiles scale down.
    *   **Pill Stack Actions**: Form actions stack vertically, creating full-width touch buttons.
