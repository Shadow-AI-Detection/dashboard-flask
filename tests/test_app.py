import pytest
from app import create_app


@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

"""
test "/health" route
"""
def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "ok"
    assert data["model_loaded"] is True


"""
test get "/results/" route
"""
def test_results_returns_list(client):
    response = client.get("/results/")
    assert response.status_code == 200
    assert isinstance(response.get_json(), list)


"""
test "/predict/" route with incomplete flow
"""
def test_predict_missing_columns(client):
    response = client.post("/predict/", json=[{"FlowDuration": 1.0}])
    assert response.status_code == 422

"""
test "/predict/" route with empty payload
"""
def test_predict_empty_payload(client):
    response = client.post("/predict/", json=[])
    assert response.status_code == 422

"""
test "/predict/" route with valid input
"""
def test_predict_valid_input(client):
    sample_flow = {
        "FlowDuration": 0.5,
        "DestinationPort": 443,
        "TotalPackets": 10,
        "TotalBytes": 5000,
        "FlowBytesPerSec": 10000.0,
        "FlowPacketsPerSec": 20.0,
        "AveragePacketSize": 500.0,
        "SourcePort": 56789,
        "ProtocolEncoded": 0,
        "DirectionEncoded": 0,
        "StateEncoded": 0,
    }
    response = client.post("/predict/", json=[sample_flow])
    assert response.status_code == 200
    data = response.get_json()
    assert "ai_flows" in data
    assert "count" in data


"""
test get "/users/" route
"""
def test_get_users_returns_list(client):
    response = client.get("/users/")
    assert response.status_code == 200
    assert isinstance(response.get_json(), list)

"""
test post "/users/" route
"""
def test_create_user(client):
    new_user = {
        "name": "Boss Lady",
        "email": "theodora@gmail.com",
        "ip_address": "10.99.99.99",
        "device": "MacBook Pro"
    }
    response = client.post("/users/", json=new_user)
    assert response.status_code == 200
    assert response.get_json()["status"] == "ok"

"""
test delete "/users/" route
"""
def test_delete_user(client):
    # Create a user first to get an id
    new_user = {
        "name": "Boss Lady",
        "email": "theodora@gmail.com",
        "ip_address": "10.99.99.98",
        "device": "MacBook Pro"
    }
    client.post("/users/", json=new_user)

    users = client.get("/users/").get_json()
    user_id = next(u["id"] for u in users if u["ip_address"] == "10.99.99.98")

    response = client.delete(f"/users/{user_id}")
    assert response.status_code == 200
    assert response.get_json()["status"] == "ok"