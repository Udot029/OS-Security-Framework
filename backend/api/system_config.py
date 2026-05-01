SECURITY_MODEL = "bell"
SUBJECTS = {
    "Uday": 3,
    "Rishu": 1,
    "Anisha": 2,
    "Kavya": 1,
    "Rahul": 2,
    "Sanya": 1,
    "Aarav": 2,
    "Diya": 1,
    "Kabir": 2,
    "Myra": 1
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