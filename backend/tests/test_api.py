import uuid
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.db.base import Base
from backend.app.db.session import engine, SessionLocal
from backend.app.db.seed import seed_database


@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()


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
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "demo@campus.edu", "password": "campusloop123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "demo@campus.edu"
    assert data["user"]["is_verified"] is True
    assert data["user"]["phone"] == "+91 98765 43210"


def test_demo_login_endpoint():
    response = client.post("/api/v1/auth/demo-login")
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "demo@campus.edu"
    assert data["user"]["is_verified"] is True


def test_register_with_custom_typed_university():
    unique_email = f"student.{uuid.uuid4().hex[:6]}@stanford.edu"
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": unique_email,
            "password": "strongpassword123",
            "full_name": "Jordan Smith",
            "campus_name": "Stanford University",
            "department": "Symbolic Systems",
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == unique_email
    assert data["user"]["campus"]["name"] == "Stanford University"


def test_login_invalid_password():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "demo@campus.edu", "password": "wrongpassword"}
    )
    assert response.status_code == 401


def test_password_recovery_flow():
    # 1. Request forgot password code
    res = client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "demo@campus.edu"}
    )
    assert res.status_code == 200
    code = res.json().get("demo_reset_code")
    assert code == "123456"

    # 2. Reset password
    res_reset = client.post(
        "/api/v1/auth/reset-password",
        json={
            "email": "demo@campus.edu",
            "reset_code": code,
            "new_password": "campusloop123"  # reset back to standard
        }
    )
    assert res_reset.status_code == 200


def test_register_new_student_and_contact():
    campuses = client.get("/api/v1/auth/campuses").json()
    campus_id = campuses[0]["id"]
    unique_email = f"student.{uuid.uuid4().hex[:6]}@campus.edu"

    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": unique_email,
            "password": "strongpassword123",
            "full_name": "Rohan Verma",
            "campus_id": campus_id,
            "department": "Biotechnology",
            "course": "B.Tech",
            "year_or_semester": "Year 1 / Sem 1",
            "bio": "First year student interested in biology and robotics.",
            "phone": "+91 99999 88888",
            "show_phone": True,
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["full_name"] == "Rohan Verma"
    assert data["user"]["is_verified"] is True


def test_request_and_offer_workflow_with_concurrency_guard():
    # 1. Login as Demo user (Requester)
    res_demo = client.post(
        "/api/v1/auth/login",
        json={"email": "demo@campus.edu", "password": "campusloop123"}
    )
    token_demo = res_demo.json()["access_token"]
    headers_demo = {"Authorization": f"Bearer {token_demo}"}

    # 2. Login as Priya (Provider)
    res_priya = client.post(
        "/api/v1/auth/login",
        json={"email": "priya.sharma@campus.edu", "password": "campusloop123"}
    )
    token_priya = res_priya.json()["access_token"]
    headers_priya = {"Authorization": f"Bearer {token_priya}"}

    # 3. Demo user posts a request with HTML to test sanitization
    create_req = client.post(
        "/api/v1/requests",
        headers=headers_demo,
        json={
            "title": "Need TI-84 Plus Calculator <script>alert(1)</script>",
            "category": "Electronics & Gadgets",
            "request_type": "item",
            "preferred_arrangement": "paid",
            "budget": 300,
            "deadline": "Friday 5 PM",
            "description": "Preparing for Calculus final. Need calculator in working condition."
        }
    )
    assert create_req.status_code == 201
    req_data = create_req.json()
    req_id = req_data["id"]
    assert "&lt;script&gt;" in req_data["title"]

    # 4. Priya submits an offer
    submit_offer = client.post(
        f"/api/v1/requests/{req_id}/offers",
        headers=headers_priya,
        json={
            "message": "I have a TI-84 in good condition. Can lend it on Thursday.",
            "proposed_price": 250,
            "availability_note": "Meet at central library"
        }
    )
    assert submit_offer.status_code == 201
    offer_id = submit_offer.json()["id"]

    # 5. Demo user accepts the offer
    accept_offer = client.patch(
        f"/api/v1/requests/offers/{offer_id}/accept",
        headers=headers_demo
    )
    assert accept_offer.status_code == 200
    assert accept_offer.json()["status"] == "accepted"

    # 6. Verify atomic guard: Second accept attempt rejects with 400 or 409
    repeat_accept = client.patch(
        f"/api/v1/requests/offers/{offer_id}/accept",
        headers=headers_demo
    )
    assert repeat_accept.status_code in [400, 409]

    # 7. Check request is now assigned
    get_req = client.get(f"/api/v1/requests/{req_id}")
    assert get_req.json()["status"] == "assigned"
    assert get_req.json()["assigned_provider_id"] is not None


def test_inquire_listing_and_messages():
    # Login as demo user
    res_demo = client.post(
        "/api/v1/auth/login",
        json={"email": "demo@campus.edu", "password": "campusloop123"}
    )
    headers_demo = {"Authorization": f"Bearer {res_demo.json()['access_token']}"}

    # Fetch listings
    listings = client.get("/api/v1/listings").json()
    assert len(listings) >= 1
    target_listing = listings[0]

    # Inquire about the listing
    inquiry_res = client.post(
        f"/api/v1/listings/{target_listing['id']}/inquire",
        headers=headers_demo,
        json={
            "message": "Hi Priya, is this calculator still available to borrow for Thursday?",
            "proposed_meeting_spot": "Central Library entrance"
        }
    )
    assert inquiry_res.status_code == 201
    txn = inquiry_res.json()
    assert txn["status"] == "in_progress"

    # Verify message recorded
    msgs = client.get(
        f"/api/v1/messages?related_id={target_listing['id']}&related_type=listing",
        headers=headers_demo
    ).json()
    assert len(msgs) >= 1
    assert "calculator still available" in msgs[0]["content"]


def test_transaction_cancellation_and_review_guard():
    # Login as demo user
    res_demo = client.post(
        "/api/v1/auth/login",
        json={"email": "demo@campus.edu", "password": "campusloop123"}
    )
    headers_demo = {"Authorization": f"Bearer {res_demo.json()['access_token']}"}

    # Get my transactions
    txns = client.get("/api/v1/transactions/me", headers=headers_demo).json()
    assert len(txns) >= 1
    txn_id = txns[0]["id"]

    # Cancel transaction
    cancel_res = client.post(
        f"/api/v1/transactions/{txn_id}/cancel",
        headers=headers_demo,
        json={"reason": "No longer needed, friend provided one."}
    )
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "cancelled"
    assert cancel_res.json()["cancellation_reason"] == "No longer needed, friend provided one."

    # Verify review guard: Cancelled transaction CANNOT receive review
    review_res = client.post(
        f"/api/v1/transactions/{txn_id}/reviews",
        headers=headers_demo,
        json={"rating": 5, "comment": "Great interaction"}
    )
    assert review_res.status_code == 400
    assert "completed" in review_res.json()["detail"].lower()


def test_service_booking_and_two_sided_completion_review():
    # 1. Login as demo user (client)
    res_demo = client.post(
        "/api/v1/auth/login",
        json={"email": "demo@campus.edu", "password": "campusloop123"}
    )
    headers_demo = {"Authorization": f"Bearer {res_demo.json()['access_token']}"}

    # 2. Login as Priya (service provider)
    res_priya = client.post(
        "/api/v1/auth/login",
        json={"email": "priya.sharma@campus.edu", "password": "campusloop123"}
    )
    headers_priya = {"Authorization": f"Bearer {res_priya.json()['access_token']}"}

    # 3. Get services
    services = client.get("/api/v1/services").json()
    assert len(services) >= 1
    srv = services[0]

    # 4. Demo books service
    book_res = client.post(
        f"/api/v1/services/{srv['id']}/book",
        headers=headers_demo,
        json={
            "message": "Need help reviewing Python list comprehensions and dictionaries.",
            "desired_timeline": "Friday 4 PM"
        }
    )
    assert book_res.status_code == 201
    txn_id = book_res.json()["id"]

    # 5. Confirm completion side A (demo)
    conf_a = client.post(f"/api/v1/transactions/{txn_id}/confirm-completion", headers=headers_demo)
    assert conf_a.status_code == 200
    assert conf_a.json()["completion_confirmed_by_requester"] is True
    assert conf_a.json()["status"] == "in_progress"  # still in progress until provider confirms

    # 6. Confirm completion side B (priya)
    conf_b = client.post(f"/api/v1/transactions/{txn_id}/confirm-completion", headers=headers_priya)
    assert conf_b.status_code == 200
    assert conf_b.json()["completion_confirmed_by_provider"] is True
    assert conf_b.json()["status"] == "completed"

    # 7. Now review unlocks! Demo reviews Priya
    rev = client.post(
        f"/api/v1/transactions/{txn_id}/reviews",
        headers=headers_demo,
        json={"rating": 5, "comment": "Excellent tutor, explained concepts clearly!"}
    )
    assert rev.status_code == 201
    assert rev.json()["rating"] == 5

    # 8. Duplicate review rejected
    dup_rev = client.post(
        f"/api/v1/transactions/{txn_id}/reviews",
        headers=headers_demo,
        json={"rating": 5, "comment": "Second review attempt"}
    )
    assert dup_rev.status_code == 400


def test_unified_activity():
    res_demo = client.post(
        "/api/v1/auth/login",
        json={"email": "demo@campus.edu", "password": "campusloop123"}
    )
    headers_demo = {"Authorization": f"Bearer {res_demo.json()['access_token']}"}

    res = client.get("/api/v1/users/me/activity", headers=headers_demo)
    assert res.status_code == 200
    data = res.json()
    assert "posted_requests" in data
    assert "active_tasks" in data
    assert "completed_tasks" in data
    assert "cancelled_tasks" in data
    assert "stats" in data
