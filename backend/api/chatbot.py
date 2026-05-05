import json
import os
import urllib.error
import urllib.request

from system_config import FILES, OBJECTS, SECURITY_MODEL, SUBJECTS


def _load_env_file():
    env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
    if not os.path.exists(env_path):
        return

    with open(env_path, "r", encoding="utf-8") as env_file:
        for raw_line in env_file:
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue

            name, value = line.split("=", 1)
            name = name.strip()
            value = value.strip().strip('"').strip("'")
            if name and name not in os.environ:
                os.environ[name] = value


_load_env_file()

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_ENDPOINT = (
    f"https://generativelanguage.googleapis.com/v1beta/models/"
    f"{GEMINI_MODEL}:generateContent"
)

DEFAULT_REPLY = (
    "I am ready to help with your OS Security Framework. Ask me about Bell "
    "LaPadula, Biba, subjects, objects, read/write access, or how this project works."
)


def _format_levels(items):
    return ", ".join(f"{name}: level {level}" for name, level in items.items())


def _contains_any(text, keywords):
    return any(keyword in text for keyword in keywords)


def _decision_reply(text):
    subject_name = next((name for name in SUBJECTS if name.lower() in text), None)
    object_name = next((name for name in OBJECTS if name.lower() in text), None)
    action = next((item for item in ["read", "write"] if item in text), None)
    policy = "biba" if "biba" in text else "bell" if "bell" in text or "lapadula" in text else SECURITY_MODEL

    if not all([subject_name, object_name, action, policy]):
        return ""

    subject_level = SUBJECTS[subject_name]
    object_level = OBJECTS[object_name]

    if policy == "bell":
        allowed = subject_level >= object_level if action == "read" else subject_level <= object_level
        rule = "no read-up" if action == "read" else "no write-down"
    else:
        allowed = subject_level <= object_level if action == "read" else subject_level >= object_level
        rule = "no read-down" if action == "read" else "no write-up"

    decision = "Allowed" if allowed else "Denied"
    return (
        f"{decision}. {subject_name} has level {subject_level}, {object_name} has "
        f"level {object_level}, action is {action}, and policy is {policy}. "
        f"The {policy} {rule} rule {'passes' if allowed else 'blocks this request'}."
    )


def _project_context():
    return (
        "You are the chatbot for an OS Security Framework project. "
        "Act like a real assistant: be conversational, understand short or informal "
        "questions, remember that the user is interacting with this specific project, "
        "and answer naturally instead of sounding like a fixed FAQ. "
        "The project is a Flask backend plus React frontend that demonstrates "
        "Bell LaPadula and Biba access control policies. "
        f"The active default security model is {SECURITY_MODEL}. "
        f"Subjects and levels: {_format_levels(SUBJECTS)}. "
        f"Objects and levels: {_format_levels(OBJECTS)}. "
        f"Files and contents: {FILES}. "
        "Access actions are read and write. "
        "Use only these project rules when explaining decisions. "
        "Bell LaPadula protects confidentiality. For Bell LaPadula: read is allowed "
        "when subject level >= object level, and write is allowed when subject level "
        "<= object level. This is no read-up and no write-down. "
        "Biba protects integrity. For Biba: read is allowed when subject level <= "
        "object level, and write is allowed when subject level >= object level. "
        "This is no read-down and no write-up. "
        "When the user names a subject, object, action, or policy, compute the "
        "decision step by step using the configured levels and conclude clearly "
        "with Allowed or Denied. "
        "The backend exposes /status, /config, /check-access, and /chatbot. "
        "For normal conversational questions like greetings, identity, and status, "
        "reply naturally as a helpful assistant for this project. "
        "For live Google Assistant style tasks such as weather, alarms, phone actions, "
        "device control, maps, or real-time web facts, explain that this web chatbot "
        "does not have those live tools unless the project adds them. "
        "Do not add unnecessary follow-up questions or generic chatbot prompts. "
        "Keep replies short enough for voice output."
    )


def _extract_gemini_text(response_data):
    candidates = response_data.get("candidates") or []
    if not candidates:
        return ""

    parts = candidates[0].get("content", {}).get("parts") or []
    return "".join(part.get("text", "") for part in parts).strip()


def _call_gemini(message):
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not configured.")

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
            "temperature": 0.45,
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

    if _contains_any(text, ["who are you", "what are you", "your name", "introduce yourself"]):
        return (
            "I am the OS Security Framework assistant. I help explain your Bell "
            "LaPadula and Biba access-control model, subjects, objects, and access decisions."
        )

    if _contains_any(text, ["how are you", "how r you", "how are u", "kaise ho"]):
        return (
            "I am running well and ready to help with your OS Security Framework, "
            "including Bell LaPadula, Biba, and access-control decisions."
        )

    if _contains_any(text, ["what can you do", "help me", "help"]):
        return (
            "I can explain Bell LaPadula and Biba, list subjects and object levels, "
            "check read/write access decisions, and help troubleshoot backend or frontend connection issues."
        )

    if _contains_any(text, ["weather", "alarm", "timer", "call", "message", "map", "directions", "open app", "google assistant"]):
        return (
            "I am not Google Assistant. I am this project's web chatbot, so I do not "
            "have live tools for weather, alarms, calls, maps, or device control. "
            "I can help with your OS security model and access-control decisions."
        )

    decision_reply = _decision_reply(text)
    if decision_reply:
        return decision_reply

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

    decision_reply = _decision_reply(clean_message.lower())
    if decision_reply:
        return decision_reply

    try:
        gemini_reply = _call_gemini(clean_message)
        if gemini_reply:
            return gemini_reply
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, ValueError, OSError):
        pass

    return _local_reply(clean_message)
