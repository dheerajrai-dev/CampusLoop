"""
Root entrypoint for CampusLoop backend ASGI application.
Enables direct zero-config discovery by Vercel Services, Uvicorn, and Gunicorn.
"""
import sys
import os

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from backend.app.main import app

__all__ = ["app"]
