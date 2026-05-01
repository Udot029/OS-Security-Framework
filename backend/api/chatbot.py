from system_config import OBJECTS, SUBJECTS


DEFAULT_REPLY = (
    "I can help with Bell LaPadula, Biba, subjects, objects, access decisions, "
    "and backend connection steps. Try asking why a read or write request is allowed."
)


def _format_levels(items):
    return ", ".join(f"{name}: level {level}" for name, level in items.items())


def get_chatbot_reply(message):
    text = (message or "").strip().lower()

    if not text:
        return "Ask me about Bell LaPadula, Biba, subjects, objects, or access checks."

    if any(word in text for word in ["hello", "hi", "hey"]):
        return "Hi. I am your OS Security assistant. Ask me how the access control decision works."

    if "bell" in text or "lapadula" in text or "confidentiality" in text:
        return (
            "Bell LaPadula protects confidentiality. A subject can read objects at or below "
            "its level, and can write only to objects at or above its level."
        )

    if "biba" in text or "integrity" in text:
        return (
            "Biba protects integrity. A subject can read objects at or above its level, "
            "and can write only to objects at or below its level."
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

    if "read" in text and "write" in text:
        return (
            "Read and write rules depend on the selected model. Bell focuses on confidentiality; "
            "Biba focuses on integrity."
        )

    if "read" in text:
        return (
            "For Bell, read is allowed when subject level is greater than or equal to object level. "
            "For Biba, read is allowed when subject level is less than or equal to object level."
        )

    if "write" in text:
        return (
            "For Bell, write is allowed when subject level is less than or equal to object level. "
            "For Biba, write is allowed when subject level is greater than or equal to object level."
        )

    if "access" in text or "allowed" in text or "denied" in text:
        return (
            "The backend compares the selected subject level, object level, action, and policy. "
            "Then it returns allowed, denied, and a short policy reason."
        )

    return DEFAULT_REPLY
