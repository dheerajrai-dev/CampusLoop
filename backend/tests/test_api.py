import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_campuses():
    response = client.get("/api/v1/auth/campuses")
    assert response.status_code == 200
    campuses = response.json()
    assert len(campuses) >= 1
    assert any("Apex Institute" in c["name"] for c in campuses)


def test_login_demo_user():
    # Aarav is seeded
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "aarav@campus.edu", "password": "campus123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "aarav@campus.edu"
    assert data["user"]["is_verified"] is True


def test_login_invalid_password():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "aarav@campus.edu", "password": "wrongpassword"}
    )
    assert response.status_code == 401


def test_register_new_student():
    # Get campus id
    campuses = client.get("/api/v1/auth/campuses").json()
    campus_id = campuses[0]["id"]

    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "priya.new@campus.edu",
            "password": "strongpassword123",
            "full_name": "Priya Sharma",
            "campus_id": campus_id,
            "department": "Biotechnology",
            "course": "B.Tech",
            "year_or_semester": "Year 1 / Sem 1",
            "bio": "First year student interested in biology and robotics."
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["full_name"] == "Priya Sharma"
    assert data["user"]["is_verified"] is True  # Matches campus.edu domain


def test_request_and_offer_workflow():
    # 1. Login as Aarav (Requester)
    res_aarav = client.post(
        "/api/v1/auth/login",
        json={"email": "aarav@campus.edu", "password": "campus123"}
    )
    token_aarav = res_aarav.json()["access_token"]
    headers_aarav = {"Authorization": f"Bearer {token_aarav}"}

    # 2. Login as Meera (Provider)
    res_meera = client.post(
        "/api/v1/auth/login",
        json={"email": "meera@campus.edu", "password": "campus123"}
    )
    token_meera = res_meera.json()["access_token"]
    headers_meera = {"Authorization": f"Bearer {token_meera}"}

    # 3. Aarav posts a request
    create_req = client.post(
        "/api/v1/requests",
        headers=headers_aarav,
        json={
            "title": "Need help debugging Python graph algorithm",
            "description": "Getting an infinite loop in Dijkstra implementation for assignment 3.",
            "category": "Academic Help & Tutoring",
            "request_type": "academic_help",
            "budget": 250.0,
            "preferred_arrangement": "paid",
            "deadline": "Today midnight"
        }
    )
    assert create_req.status_code == 201
    req_data = create_req.json()
    request_id = req_data["id"]
    assert req_data["status"] == "open"

    # 4. Requester CANNOT submit an offer to their own request (Rule Check)
    own_offer = client.post(
        f"/api/v1/requests/{request_id}/offers",
        headers=headers_aarav,
        json={"message": "I will do my own task", "proposed_price": 100.0}
    )
    assert own_offer.status_code == 400

    # 5. Meera submits an offer
    meera_offer = client.post(
        f"/api/v1/requests/{request_id}/offers",
        headers=headers_meera,
        json={
            "message": "I took this course last year. Can hop on a 20-min meet and debug your code.",
            "proposed_price": 200.0,
            "availability_note": "Available right now"
        }
    )
    assert meera_offer.status_code == 201
    offer_id = meera_offer.json()["id"]

    # 6. Duplicate offer prevention (Rule Check)
    dup_offer = client.post(
        f"/api/v1/requests/{request_id}/offers",
        headers=headers_meera,
        json={"message": "Second offer", "proposed_price": 180.0}
    )
    assert dup_offer.status_code == 400

    # 7. Aarav accepts Meera's offer
    accept_res = client.patch(
        f"/api/v1/requests/offers/{offer_id}/accept",
        headers=headers_aarav
    )
    assert accept_res.status_code == 200
    assert accept_res.json()["status"] == "accepted"

    # Verify request is now assigned
    req_check = client.get(f"/api/v1/requests/{request_id}", headers=headers_aarav)
    assert req_check.json()["status"] == "assigned"

    # 8. Check transaction was created and appears in activity
    txn_res = client.get("/api/v1/transactions/me", headers=headers_aarav)
    assert txn_res.status_code == 200
    txns = txn_res.json()
    matching_txn = next(t for t in txns if t["request_id"] == request_id)
    assert matching_txn["status"] == "accepted"
    txn_id = matching_txn["id"]

    # 9. Two-sided completion confirmation
    # Requester confirms
    conf1 = client.post(f"/api/v1/transactions/{txn_id}/confirm-completion", headers=headers_aarav)
    assert conf1.status_code == 200
    assert conf1.json()["completion_confirmed_by_requester"] is True
    assert conf1.json()["status"] == "accepted"  # Still accepted until both confirm

    # Provider confirms
    conf2 = client.post(f"/api/v1/transactions/{txn_id}/confirm-completion", headers=headers_meera)
    assert conf2.status_code == 200
    assert conf2.json()["completion_confirmed_by_provider"] is True
    assert conf2.json()["status"] == "completed"  # Fully completed!

    # 10. Reviews workflow
    review_res = client.post(
        f"/api/v1/transactions/{txn_id}/reviews",
        headers=headers_aarav,
        json={"rating": 5, "comment": "Great debugging help, solved the issue quickly!"}
    )
    assert review_res.status_code == 201
    assert review_res.json()["rating"] == 5

    # Duplicate review rejection
    dup_review = client.post(
        f"/api/v1/transactions/{txn_id}/reviews",
        headers=headers_aarav,
        json={"rating": 4, "comment": "Another review"}
    )
    assert dup_review.status_code == 400


def test_explore_feed():
    res = client.get("/api/v1/explore?type=all")
    assert res.status_code == 200
    items = res.json()
    assert len(items) > 0
    # Must have both requests and listings
    types = {item["item_type"] for item in items}
    assert "request" in types
    assert "listing" in types
