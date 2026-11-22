from datetime import datetime, timezone, timedelta
from typing import Optional
from backend.app.models.request import Request
from backend.app.models.user import User


DEPARTMENT_KEYWORDS = {
    "computer": ["python", "code", "coding", "algorithm", "dsa", "programming", "software", "linux", "debug", "git", "web"],
    "design": ["design", "slide", "slides", "presentation", "deck", "figma", "poster", "graphics", "illustrator", "ui", "ux"],
    "math": ["math", "calculus", "statistics", "algebra", "discrete", "probability", "latex"],
    "mechanical": ["cycle", "bike", "mechanics", "cad", "thermo", "workshop"],
    "electrical": ["circuit", "multimeter", "electronics", "breadboard", "iot", "arduino"],
}


def score_request_for_user(request: Request, user: Optional[User]) -> tuple[int, list[str]]:
    """
    Deterministic explainable matching score (0 to 100) and human-readable reasons.
    Strictly rule-based with zero external AI/LLM dependencies.
    """
    score = 40  # Base score for any open request
    reasons: list[str] = []

    now = datetime.now(timezone.utc)
    # Ensure timezone aware comparison
    created_at = request.created_at
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)

    # 1. Freshness bonus
    hours_ago = (now - created_at).total_seconds() / 3600
    if hours_ago <= 12:
        score += 15
        reasons.append("Just posted (<12h ago)")
    elif hours_ago <= 48:
        score += 10
        reasons.append("Recent request")

    # 2. Opportunity state (requests with 0 or 1 offer need help most)
    offer_count = len(request.offers) if request.offers else 0
    if offer_count == 0:
        score += 10
        reasons.append("Be the first to help (0 offers)")

    # 3. Budget / Arrangement transparency
    if request.preferred_arrangement == "paid" and request.budget and request.budget > 0:
        score += 10
        reasons.append(f"Paid gig (₹{int(request.budget)})")
    elif request.preferred_arrangement == "free":
        score += 10
        reasons.append("Peer favor / Free exchange")
    elif request.preferred_arrangement == "exchange":
        score += 10
        reasons.append("Skill/Resource exchange")

    # 4. User profile / skill matching (if user is authenticated)
    if user:
        user_dept = (user.department or "").lower()
        user_bio = (user.bio or "").lower()
        req_text = f"{request.title} {request.description} {request.category}".lower()

        # Check department keyword alignment
        for key, keywords in DEPARTMENT_KEYWORDS.items():
            if key in user_dept or key in user_bio:
                matched_words = [kw for kw in keywords if kw in req_text]
                if matched_words:
                    score += 25
                    reasons.append(f"Matches your background in {user.department}")
                    break

        # Check if user has offered services in this category
        if user.services:
            for srv in user.services:
                if srv.category.lower() == request.category.lower() and srv.status == "active":
                    score += 20
                    reasons.append(f"Matches your service: {srv.title[:25]}...")
                    break

    # Cap score at 99 max
    final_score = min(max(score, 10), 99)
    if not reasons:
        reasons.append("Active campus request")

    return final_score, reasons[:3]
