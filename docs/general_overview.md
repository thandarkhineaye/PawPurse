# PawPurse - General Overview

Welcome to the **PawPurse** general documentation. This document provides a high-level overview of the application's purpose, design features, high-level architecture, and core technology stack.

---

## 🌟 Overview

When a pet experiences sudden distress or acute symptoms, owners often experience panic and overwhelm. Traditional internet searches usually return highly speculative, conflicting, or overly detailed medical information that delays critical action.

**PawPurse** is designed as a focused, distraction-free emergency triage tool. Its primary goal is to help pet owners determine the immediate next steps in a medical crisis. Users type a pet's current symptoms and select the animal type (Dog, Cat, Rabbit, or Bird). The system instantly evaluates the symptoms and returns one of three color-coded urgency states:
*   **🔴 RED (Extreme Urgency)**: Life-threatening crisis requiring immediate emergency vet intervention.
*   **🟡 YELLOW (Urgent Attention)**: Serious symptom requiring prompt veterinary care within 24 hours.
*   **🟢 GREEN (Monitor / Non-Urgent)**: Non-critical symptom; safe to monitor closely at home.

---

## ✨ Key Features

1.  **Three-Tier Urgency Triage**: Instant, color-coded ambient display mapping symptoms to clear, actionable directives.
2.  **Orchestrated Multi-Agent AI**: Chained Gemini 3.5 Flash agents that categorize species, analyze symptoms contextually, and synthesize the final triage report.
3.  **Local Rule-Engine Fallback**: In the absence of an API key or during network disruptions, a robust keyword classifier runs locally, guaranteeing system availability.
4.  **Multi-lingual Localizations**: Automatic language detection and localized responses for English, Japanese (日本語), and Burmese (မြန်မာ).
5.  **Interactive Vet Map**: Displays the nearest veterinary clinics dynamically using browser geolocation and OpenStreetMap.
6.  **Pet Library & Registry**: Localized library containing detailed breed information, pros/cons, and a secure local registry to save pet info and emergency contacts.
7.  **Privacy-First Design**: Symptom input data is handled strictly in-memory and is never stored on external databases.

---

## 🏗️ High-Level Architecture

PawPurse separates presentation, API routing, and AI categorization into a lightweight three-tier model:

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
+-------------------------------+             +-----------------------------+
|  Orchestrated Multi-Agent AI  |             |  Local Rule Engine Fallback |
|  - Router Orchestrator        |             |  (Keyword Triage Pattern)   |
|    └─ Parallel Verifiers      |             +-----------------------------+
|  - Specialist Agent           |
|  - Urgency Triage Synthesis   |
+-------------------------------+
```

---

## 💻 Tech Stack

*   **Frontend**: HTML5, ES6 Vanilla JavaScript, and Custom CSS3 variables (Zero build dependencies).
*   **Backend Server**: FastAPI (Python 3.10+) running over a high-performance Uvicorn ASGI server.
*   **AI SDK**: Google GenAI Python SDK (`google-genai`) targeting `gemini-3.5-flash` with JSON output schemas and latency optimization.
*   **Maps Engine**: Leaflet.js library using OpenStreetMap tile servers for dynamic local vet maps.
*   **Deployment Blueprint**: Render blueprint spec (`render.yaml`) using a lightweight multi-stage Docker container built with the `uv` package compiler.
