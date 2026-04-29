from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import text
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://cvagent:cvagent_secret@localhost:5432/cvagent")

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session


async def init_db():
    from models import Base
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
