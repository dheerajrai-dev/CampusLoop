import time
from collections import defaultdict
from fastapi import HTTPException, status

# In-memory sliding window rate limiter
_request_records = defaultdict(list)


def check_rate_limit(key: str, max_requests: int = 15, window_seconds: int = 60) -> None:
    """
    Enforces a simple sliding window rate limit per key (user_id or client IP).
    Rejects with HTTP 429 if threshold is exceeded.
    """
    now = time.time()
    records = _request_records[key]

    # Purge timestamps outside current window
    _request_records[key] = [t for t in records if now - t < window_seconds]

    if len(_request_records[key]) >= max_requests:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please wait a moment before trying again.",
            headers={"Retry-After": str(window_seconds)},
        )

    _request_records[key].append(now)
