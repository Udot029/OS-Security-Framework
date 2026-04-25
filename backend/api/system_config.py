SECURITY_MODEL = "bell"
SUBJECTS = {
    "alice": 3,
    "bob": 1
}
OBJECTS = {
    "file1": 2,
    "file2": 1
}
FILES = {
    "file1": "hello",
    "file2": "secret"
}
def simple_hash(data):
    return sum(ord(c) for c in data) % 1000
HASHES = {
    name: simple_hash(data)
    for name, data in FILES.items()
}