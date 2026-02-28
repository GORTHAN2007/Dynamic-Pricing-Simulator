from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_simulate_success():
    payload = {
        "initial_price": 50.0,
        "cost_price": 30.0,
        "total_inventory": 1000,
        "base_demand": 100,
        "sensitivity": 2.0
    }
    response = client.post("/api/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "history" in data
    assert "summary" in data
    assert len(data["history"]) == 30
    assert "insight" in data["history"][0]
    assert "total_profit" in data["summary"]

def test_simulate_invalid_params():
    # Missing required field
    payload = {
        "initial_price": 50.0,
        "cost_price": 30.0
    }
    response = client.post("/api/simulate", json=payload)
    assert response.status_code == 422

def test_simulate_zero_inventory():
    payload = {
        "initial_price": 50.0,
        "cost_price": 30.0,
        "total_inventory": 0,
        "base_demand": 100,
        "sensitivity": 2.0
    }
    response = client.post("/api/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    # If inventory is 0, total_units_sold should be 0
    assert data["summary"]["total_units_sold"] == 0
