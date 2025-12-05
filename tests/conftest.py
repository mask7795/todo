import pytest


@pytest.fixture(autouse=True)
def clear_todo_api_key_env(monkeypatch: pytest.MonkeyPatch):
    """Ensure tests run with auth disabled by default.

    Auth-specific tests can enable it explicitly via monkeypatch.setenv.
    """
    monkeypatch.delenv("TODO_API_KEY", raising=False)
