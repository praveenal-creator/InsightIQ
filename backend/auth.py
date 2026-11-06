import os
from pathlib import Path

import httpx
from dotenv import load_dotenv
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

load_dotenv(Path(__file__).resolve().parent / ".env")

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_PUBLISHABLE_KEY = os.getenv("SUPABASE_PUBLISHABLE_KEY", "")

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
):
    if not SUPABASE_URL or not SUPABASE_PUBLISHABLE_KEY:
        raise HTTPException(
            status_code=503,
            detail="Authentication service is not configured.",
        )

    if credentials is None:
        raise HTTPException(
            status_code=401,
            detail="Authentication required.",
        )

    if credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication scheme.",
        )

    access_token = credentials.credentials

    headers = {
        "apikey": SUPABASE_PUBLISHABLE_KEY,
        "Authorization": f"Bearer {access_token}",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{SUPABASE_URL}/auth/v1/user",
                headers=headers,
            )

        if response.status_code in (401, 403):
            raise HTTPException(
                status_code=401,
                detail="Invalid or expired access token.",
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=503,
                detail="Authentication service temporarily unavailable.",
            )

        user = response.json()

        if not isinstance(user, dict) or not user.get("id"):
            raise HTTPException(
                status_code=401,
                detail="Unable to verify user identity.",
            )

        return {
            "id": user["id"],
            "email": user.get("email"),
            "_access_token": access_token,
        }

    except httpx.RequestError:
        raise HTTPException(
            status_code=503,
            detail="Unable to reach authentication service.",
        )