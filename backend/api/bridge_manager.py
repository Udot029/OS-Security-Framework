import subprocess
import os
GUARD_PATH = r"C:\Users\udot\OS-Security-Framework\backend\core\guard.exe"
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
            "error": "guard.exe not found",
            "code": -1
        }