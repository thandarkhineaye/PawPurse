import pytest
from fastapi.testclient import TestClient
from backend.triage_engine import format_prompt, parse_response
from backend.main import app, engine
import json

client = TestClient(app)

def test_format_prompt():
    symptoms = "My dog is bleeding"
    prompt = format_prompt(symptoms)
    assert "RED" in prompt
    assert "YELLOW" in prompt
    assert "GREEN" in prompt
    assert "My dog is bleeding" in prompt

def test_parse_response_valid_json():
    json_str = '{"urgency": "RED", "action_directive": "Go to vet.", "key_instructions": ["Do not wait"]}'
    res = parse_response(json_str)
    assert res["urgency"] == "RED"
    assert res["action_directive"] == "Go to vet."
    assert len(res["key_instructions"]) == 1

def test_parse_response_markdown_json():
    json_str = '```json\n{"urgency": "YELLOW", "action_directive": "Call vet.", "key_instructions": ["Watch closely"]}\n```'
    res = parse_response(json_str)
    assert res["urgency"] == "YELLOW"

def test_parse_response_fallback_on_invalid():
    # Missing fields or invalid json should trigger fallback
    invalid_json = '{"urgency": "RED"}'
    res = parse_response(invalid_json)
    assert res["urgency"] == "RED"
    assert "Unable to parse" in res["action_directive"]

def test_triage_flow_happy_path(monkeypatch):
    # Mock the classify_symptoms function to not call Gemini
    def mock_classify(symptoms, language=None):
        return {
            "urgency": "RED",
            "action_directive": "Mocked directive",
            "key_instructions": ["Mocked instruction"]
        }
    monkeypatch.setattr(engine, "classify_symptoms", mock_classify)
    
    response = client.post("/api/triage", json={"symptoms": "my dog is bleeding"})
    assert response.status_code == 200
    data = response.json()
    assert data["urgency"] == "RED"
    assert data["action_directive"] == "Mocked directive"

def test_triage_flow_validation_error():
    # Empty symptoms should be 400
    response = client.post("/api/triage", json={"symptoms": "   "})
    assert response.status_code == 400

def test_triage_flow_api_down(monkeypatch):
    # Mock classify to raise an exception
    def mock_classify_fail(symptoms):
        raise RuntimeError("API timeout")
    monkeypatch.setattr(engine, "classify_symptoms", mock_classify_fail)
    
    response = client.post("/api/triage", json={"symptoms": "dog is fine"})
    assert response.status_code == 503
    assert "unavailable" in response.json()["detail"]

def test_local_triage_heat_shock(monkeypatch):
    # Temporarily force engine.client to None to ensure it uses the local classifier list
    monkeypatch.setattr(engine, "client", None)
    res = engine.classify_symptoms("my dog suffered a heat shock")
    assert res["urgency"] == "RED"
    
    res_ja = engine.classify_symptoms("犬がヒートショックを起こした")
    assert res_ja["urgency"] == "RED"

