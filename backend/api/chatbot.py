import json
import os
import urllib.error
import urllib.request

from system_config import FILES, OBJECTS, SECURITY_MODEL, SUBJECTS


GEMINI_API_KEY = os.environ.get(
    "GEMINI_API_KEY",
    "AIzaSyB3uUDs45NyDUWYLJ5C4ZgJZtaiA1P-yms",
)
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_ENDPOINT = (
    f"https://generativelanguage.googleapis.com/v1beta/models/"
    f"{GEMINI_MODEL}:generateContent"
)

DEFAULT_REPLY = (
    "I can help with this OS Security Framework: Bell LaPadula, Biba, subjects, "
    "objects, read/write access decisions, backend setup, and real-world access "
    "control examples."
)


def _format_levels(items):
    return ", ".join(f"{name}: level {level}" for name, level in items.items())


def _contains_any(text, keywords):
    return any(keyword in text for keyword in keywords)


def _project_context():
    return (
        "You are the chatbot for an OS Security Framework project. "
        "Answer as a concise security assistant trained on this project. "
        "The project is a Flask backend plus React frontend that demonstrates "
        "Bell LaPadula and Biba access control policies. "
        f"The active default security model is {SECURITY_MODEL}. "
        f"Subjects and levels: {_format_levels(SUBJECTS)}. "
        f"Objects and levels: {_format_levels(OBJECTS)}. "
        f"Files: {', '.join(FILES.keys())}. "
        "Access actions are read and write. "
        "Bell LaPadula protects confidentiality: no read-up and no write-down. "
        "Biba protects integrity: no read-down and no write-up. "
        "The backend exposes /status, /config, /check-access, and /chatbot. "
        "Keep answers directly related to the project, access control, operating "
        "system security, policy decisions, or backend/frontend setup. "
        "Do not add unnecessary follow-up questions or generic chatbot prompts. "
        "If the user asks for an access decision, explain it using the subject "
        "level, object level, action, and selected policy."
    )


def _extract_gemini_text(response_data):
    candidates = response_data.get("candidates") or []
    if not candidates:
        return ""

    parts = candidates[0].get("content", {}).get("parts") or []
    return "".join(part.get("text", "") for part in parts).strip()


def _call_gemini(message):
    payload = {
        "systemInstruction": {
            "parts": [
                {
                    "text": _project_context(),
                }
            ]
        },
        "contents": [
            {
                "role": "user",
                "parts": [
                    {
                        "text": message,
                    }
                ],
            }
        ],
        "generationConfig": {
            "temperature": 0.35,
            "topP": 0.9,
            "maxOutputTokens": 280,
        },
    }

    request = urllib.request.Request(
        GEMINI_ENDPOINT,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "x-goog-api-key": GEMINI_API_KEY,
        },
        method="POST",
    )

    with urllib.request.urlopen(request, timeout=20) as response:
        response_data = json.loads(response.read().decode("utf-8"))

    return _extract_gemini_text(response_data)


def _local_reply(message):
    text = (message or "").strip().lower()

    if not text:
        return DEFAULT_REPLY

    if any(word in text for word in ["hello", "hi", "hey"]):
        return "Hi. I am your OS Security assistant for the Bell and Biba access-control dashboard."

    if _contains_any(text, ["difference", "compare", "versus", "vs"]):
        return (
            "Bell LaPadula protects confidentiality with no read-up and no write-down. "
            "Biba protects integrity with no read-down and no write-up."
        )

    if "bell" in text or "lapadula" in text or "confidentiality" in text:
        return (
            "Bell LaPadula protects confidentiality. Read is allowed when the subject "
            "level is greater than or equal to the object level. Write is allowed when "
            "the subject level is less than or equal to the object level."
        )

    if "biba" in text or "integrity" in text:
        return (
            "Biba protects integrity. Read is allowed when the subject level is less "
            "than or equal to the object level. Write is allowed when the subject level "
            "is greater than or equal to the object level."
        )

    if "subject" in text or "user" in text:
        return f"Current subjects are: {_format_levels(SUBJECTS)}."

    if "object" in text or "file" in text:
        return f"Current objects are: {_format_levels(OBJECTS)}."

    if "backend" in text or "connect" in text or "disconnected" in text:
        return (
            "Start the backend with npm run start:backend and open the frontend at "
            "http://127.0.0.1:8080. The dashboard checks http://127.0.0.1:5000/status."
        )

    if "access" in text or "allowed" in text or "denied" in text:
        return (
            "The backend compares subject level, object level, action, and policy, "
            "then returns whether the request is allowed or denied."
        )

    return DEFAULT_REPLY


def get_chatbot_reply(message):
    clean_message = (message or "").strip()

    if not clean_message:
        return DEFAULT_REPLY

    try:
        gemini_reply = _call_gemini(clean_message)
        if gemini_reply:
            return gemini_reply
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, ValueError, OSError):
        pass

    return _local_reply(clean_message)
