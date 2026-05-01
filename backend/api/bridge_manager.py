import subprocess
import os

GUARD_PATH = os.path.join(os.path.dirname(__file__), "guard.exe")


def _fallback_decision(model, s_lvl, o_lvl, action, data, hash_val):
    allowed = False
    output = ""
    error = ""
    code = 0

    if model == "bell":
        if action == "read":
            allowed = s_lvl >= o_lvl
            output = "allowed" if allowed else "denied by Bell no read-up"
        elif action == "write":
            allowed = s_lvl <= o_lvl
            output = "allowed" if allowed else "denied by Bell no write-down"
        else:
            error = f"Unsupported action: {action}"
            code = -1
    elif model == "biba":
        if action == "read":
            allowed = s_lvl <= o_lvl
            output = "allowed" if allowed else "denied by Biba no read-down"
        elif action == "write":
            allowed = s_lvl >= o_lvl
            output = "allowed" if allowed else "denied by Biba no write-up"
        else:
            error = f"Unsupported action: {action}"
            code = -1
    else:
        error = f"Unsupported model: {model}"
        code = -1

    return {
        "allowed": allowed,
        "output": output,
        "error": error,
        "code": code
    }


def run_guard(model, s_lvl, o_lvl, action, data, hash_val):
    if not os.path.isfile(GUARD_PATH) or os.path.getsize(GUARD_PATH) == 0:
        return _fallback_decision(model, s_lvl, o_lvl, action, data, hash_val)

    try:
        result = subprocess.run(
            [
                GUARD_PATH,
                str(model),
                str(s_lvl),
                str(o_lvl),
                str(action),
                str(data),
                str(hash_val)
            ],
            capture_output=True,
            text=True
        )
        return {
            "allowed": result.returncode == 0,
            "output": result.stdout.strip(),
            "error": result.stderr.strip(),
            "code": result.returncode
        }
    except FileNotFoundError:
        return {
            "allowed": False,
            "output": "",
            "error": f"guard.exe not found at {GUARD_PATH}",
            "code": -1
        }
    except OSError as e:
        if getattr(e, "winerror", None) == 193:
            return {
                "allowed": False,
                "output": "",
                "error": "guard.exe is not a valid Windows executable. The backend is using a Python fallback policy evaluator.",
                "code": -1
            }
        return {
            "allowed": False,
            "output": "",
            "error": str(e),
            "code": -1
        }
