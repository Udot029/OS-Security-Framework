import subprocess
import os

GUARD_PATH = os.path.join(os.path.dirname(__file__), "guard.exe")

def run_guard(model, s_lvl, o_lvl, action, data, hash_val):
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
            "error": f"guard.exe not found at {GUARD_PATH}",
            "code": -1
        }