# PawPurse 🐾

**Instant, color-coded emergency triage for anxious pet owners in a crisis.**

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.138+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Gemini 3.5](https://img.shields.io/badge/AI-Gemini%203.5%20Flash-8E44AD?style=flat&logo=google&logoColor=white)](https://ai.google.dev/)
[![Tests](https://img.shields.io/badge/Tests-Pytest%20Passing-brightgreen?style=flat&logo=pytest&logoColor=white)](#running-tests)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🌟 Overview

When a pet experiences sudden symptoms—such as bleeding, choking, or lethargy—pet owners panic. Searching the internet often yields conflicting, terrifying medical details that freeze decision-making. 

**PawPurse** cuts through the noise. It provides a single-purpose, distraction-free interface where users type a pet's current symptoms and immediately receive a non-diagnostic, color-coded urgency assessment (**RED**, **YELLOW**, or **GREEN**) paired with clear, immediate action steps.

> *"I typed 'my cat fell and is bleeding' and the screen instantly went red with the instruction: 'Go to the nearest emergency clinic immediately. Do not wait.'—it gave me the exact clarity I needed to stop freezing and start driving."*

---

## ✨ Key Features

- **🔴🟡🟢 Three-Tier Urgency Triage**:
  - **RED (Extreme Urgency)**: Life-threatening crisis requiring immediate emergency vet intervention.
  - **YELLOW (Urgent Attention)**: Serious symptom requiring prompt veterinary care within 24 hours.
  - **GREEN (Monitor / Non-Urgent)**: Non-critical symptom; safe to monitor closely at home.
- **⚡ Crisis Design System**: High-contrast, ambient color transitions (pulsing red, warning yellow, steady green) and ultra-legible typography designed for stressful situations.
- **🤖 Powered by Gemini 3.5 Flash**: Fast response time (p95 < 2s) using Google's `google-genai` SDK with strict JSON response constraints.
- **🌐 Multi-Language Support**: Automatic detection and localized responses for **English**, **Japanese (日本語)**, and **Burmese (မြန်မာ)**.
- **🛡️ Safe Local Fallback**: Rule-based keyword matching fallback ensures the triage app functions reliably even if network connectivity or Gemini API availability is compromised.
- **🔒 Privacy-First & Ephemeral**: Zero database storage. Symptom inputs are processed in-memory and never persisted.

---

## 🏗️ Architecture & Tech Stack

PawPurse is built as a mobile-first web application with a high-performance, lightweight footprint.

```
                      +-----------------------------+
                      |   Vanilla JS/CSS Frontend   |
                      |   (Single Page App / UI)    |
                      +--------------+--------------+
                                     |
                             POST /api/triage
                                     v
                      +-----------------------------+
                      |       FastAPI Backend       |
                      |  (Security Proxy & Routing) |
                      +--------------+--------------+
                                     |
               +---------------------+---------------------+
               |                                           |
    Gemini API Key Available                       API Missing / Offline
               v                                           v
+-----------------------------+             +-----------------------------+
|    Gemini 3.5 Flash API     |             |  Local Rule Engine Fallback |
| (client.interactions.create)|             |  (Keyword Triage Pattern)   |
+-----------------------------+             +-----------------------------+
```

- **Frontend**: HTML5, ES6 Vanilla JavaScript, Custom CSS3 Design Tokens (Zero build-step dependency).
- **Backend API**: Python FastAPI + Uvicorn ASGI Server.
- **AI Engine**: `google-genai` SDK targeting `gemini-3.5-flash`.
- **Environment & Package Management**: [`uv`](https://github.com/astral-sh/uv) for fast dependency locking and execution.

---

## 🧠 LLM Architecture Details

PawPurse leverages state-of-the-art Large Language Model (LLM) capabilities for real-time symptom classification:

- **Model Selection**: Uses **`gemini-3.5-flash`** via the official Google GenAI SDK (`google-genai` >= 2.10.0) calling `client.interactions.create`.
- **Structured JSON Outputs**: Enforces strict schema constraints (`response_mime_type: "application/json"`) matching the `TriageResult` schema (`urgency`, `action_directive`, `key_instructions`).
- **Latency-Optimized Configuration**: Utilizes `thinking_level: "minimal"` to minimize inference time, consistently keeping API response latencies **under 2 seconds**.
- **Non-Diagnostic Safety Guardrails**: Structured system prompts instruct the LLM to classify urgency level (*RED*, *YELLOW*, or *GREEN*) while explicitly prohibiting disease diagnoses or medication suggestions.
- **Zero-Shot Multi-lingual Intelligence**: Supports native language understanding and localized responses for **English**, **Japanese**, and **Burmese** without requiring separate fine-tuned models.

---


## 📂 Project Structure

```
PawPurse/
├── backend/
│   ├── main.py            # FastAPI endpoints, static file server & CORS configuration
│   └── triage_engine.py   # Gemini API integration, prompt formatting & fallback rules
├── tests/
│   ├── conftest.py        # Test setup
│   └── test_triage.py     # Comprehensive unit and integration tests
├── index.html             # Triage application single-page structure
├── style.css              # Crisis design system, color modes & animations
├── script.js              # Frontend UI state management & API client
├── Dockerfile             # Multi-stage container build with uv
├── render.yaml            # Render deployment blueprint
├── pyproject.toml         # Python dependencies and project settings
├── share_prototype.bat    # Windows script for local tunnel prototype sharing
├── prd.md                 # Product Requirements Document
├── engineering.md         # Engineering Architecture Spec
└── ui.md                  # UI & UX Design System Specification
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.10 or higher
- [`uv`](https://docs.astral.sh/uv/) package manager installed (`pip install uv` or `curl -LsSf https://astral.sh/uv/install.sh | sh`)
- *(Optional)* A Google Gemini API Key. (If no API key is provided, PawPurse automatically operates in local fallback mode).

### 1. Clone & Set Up Environment

```bash
git clone https://github.com/thandarkhineaye/PawPurse.git
cd PawPurse
uv sync
```

### 2. Set Up Environment Variables (Optional)

Set your Gemini API Key in your terminal environment:

**On Linux / macOS:**
```bash
export GEMINI_API_KEY="your-gemini-api-key"
```

**On Windows (PowerShell):**
```powershell
$env:GEMINI_API_KEY="your-gemini-api-key"
```

### 3. Run the Development Server

Start the backend server with Uvicorn:

```bash
uv run uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

Open your browser and navigate to **`http://127.0.0.1:8000`**.

---

## 🧪 Running Tests

The test suite validates prompt formatting, response parsing, happy-path API endpoints, validation logic, offline fallback, and multi-language handling.

Run all tests using `pytest`:

```bash
uv run pytest
```

---

## 🌐 Prototype Tunnel Sharing (Windows)

To quickly share a live running prototype on your local machine with remote testers over a temporary public URL, execute the included batch script:

```cmd
.\share_prototype.bat
```

This launches the local FastAPI server and establishes a secure public tunnel via `localtunnel`.

---

## 🐳 Docker & Cloud Deployment

### Run with Docker

```bash
# Build Docker image
docker build -t pawpurse .

# Run container
docker run -p 8000:8000 -e GEMINI_API_KEY="your-gemini-api-key" pawpurse
```

### Deploy to Render

PawPurse includes a ready-to-use `render.yaml` deployment blueprint:
1. Connect your repository to [Render](https://render.com).
2. Create a new Web Service using `render.yaml`.
3. Set the `GEMINI_API_KEY` environment variable in your service settings.

---

## ⚠️ Medical & Legal Disclaimer

> **IMPORTANT**: PawPurse is designed solely as an emergency decision-support and triage clarity tool. **PawPurse does NOT provide veterinary medical diagnoses, treatments, or prescriptions.** In any life-threatening situation or severe pet emergency, always contact or visit a licensed veterinary professional or emergency animal hospital immediately.

---

## 📜 License

This project is open-source under the [MIT License](LICENSE).
