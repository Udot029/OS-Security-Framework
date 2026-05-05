# Chatbot Setup

The chatbot uses Gemini when `GEMINI_API_KEY` is configured. Keep the real key
in `.env`, not in source code.

## Setup

1. Copy `.env.example` to `.env`.
2. Replace `GEMINI_API_KEY` with your Gemini API key.
3. Start the backend:

```powershell
npm run start:backend
```

Or start the whole app:

```powershell
npm start
```

If the key is missing or the API call fails, the chatbot still answers with
local project-specific rules.
