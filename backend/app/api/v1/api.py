from fastapi import APIRouter
from backend.app.api.v1 import (
    auth,
    users,
    explore,
    requests,
    listings,
    services,
    transactions,
    moderation,
    messages,
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(explore.router)
api_router.include_router(requests.router)
api_router.include_router(listings.router)
api_router.include_router(services.router)
api_router.include_router(transactions.router)
api_router.include_router(moderation.router)
api_router.include_router(messages.router)
