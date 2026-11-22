from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from backend.app.core.config import settings

is_sqlite = settings.DATABASE_URL.startswith("sqlite")
connect_args = {"check_same_thread": False} if is_sqlite else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
    pool_recycle=300,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

_db_initialized = False


def init_db_if_needed():
    global _db_initialized
    if not _db_initialized:
        try:
            from backend.app.db.base import Base
            from backend.app.db.seed import seed_database
            Base.metadata.create_all(bind=engine)
            if settings.AUTO_SEED:
                seed_db = SessionLocal()
                try:
                    seed_database(seed_db)
                finally:
                    seed_db.close()
            _db_initialized = True
        except Exception as e:
            print(f"[CampusLoop] DB auto-initialization error: {e}")


# Initialize once at import time
init_db_if_needed()


def get_db() -> Generator[Session, None, None]:
    init_db_if_needed()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
