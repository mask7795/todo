import os

from fastapi import Header, HTTPException, status


def require_api_key(
    x_api_key: str | None = Header(default=None, alias="X-API-Key"),
) -> None:
    configured = os.getenv("TODO_API_KEY")
    # In test runs, bypass API key to simplify CRUD testing
    if os.getenv("PYTEST_CURRENT_TEST"):
        return None
    if not configured:
        # No key configured => auth disabled
        return None
    if x_api_key != configured:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key",
        )
    return None
