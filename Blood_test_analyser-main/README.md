# Blood Test Analyzer

An AI-powered web app where users enter blood test results and receive a plain-language interpretation, dietary suggestions, a shopping list, and recipes — powered by Google Gemini.

---

## How to run

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) and Docker Compose

### 1. Set your Google Gemini API key

Edit `backend/.env`:

```
GOOGLE_API_KEY=your-key-here
```

> **No key?** The app still works — it falls back to a built-in reference-range checker that flags abnormal values without AI commentary.

### 2. Start everything

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API docs (Swagger) | http://localhost:8000/docs |
| Health check | http://localhost:8000/health |

### 3. Stop

```bash
docker compose down          # stop containers
docker compose down -v       # stop + delete MongoDB data
```

---

## How the app works

### User flow

1. **Sign up / Log in** — creates a JWT-authenticated session stored in `localStorage`.
2. **Enter blood test results** — pick tests from the quick-add panel (Cholesterol, CBC, Metabolic) and type the measured values. Optionally enter age and gender.
3. **Click Analyze** — the results are sent to the backend, which calls the Gemini API and returns:
   - A plain-language **summary** (2–4 sentences)
   - Per-test **details** with status (NORMAL / LOW / HIGH), reference range, and a plain note
   - **Suggestions** (e.g. "discuss with your doctor")
   - A concrete **shopping list** of foods relevant to your results
   - Simple **recipes** using those ingredients
4. **History** — every analysis is saved per user; the History tab lets you view or delete past reports.
5. **Session persistence** — on page reload the app calls `/api/auth/me` with the stored access token. If the token has expired (30 min), the Axios interceptor silently refreshes it using the refresh token (7 days) without logging the user out.

---

## Architecture

```
Browser
  └── React + Vite  (port 5173)
        └── Axios ──► FastAPI  (port 8000)
                        ├── /api/auth/*     JWT auth
                        └── /api/analyze/*  analysis + history
                              ├── Google Gemini API  (AI)
                              └── MongoDB            (storage)
```

---

## Components

### Backend (`backend/`)

| File | What it does |
|---|---|
| `app/main.py` | FastAPI app, MongoDB startup/shutdown, CORS |
| `app/models.py` | Pydantic schemas for every request and response |
| `app/routes/auth.py` | `POST /signup`, `POST /login`, `POST /refresh`, `GET /me` |
| `app/routes/analyze.py` | `POST /analyze`, history GET/DELETE endpoints |
| `app/services/__init__.py` | `AuthService` (JWT + bcrypt), `MongoDBService` (pymongo) |
| `app/services/analysis_service.py` | Gemini prompt, reference-range table, fallback analysis |

**Auth** — two JWTs: access token (30 min) + refresh token (7 days), signed with `SECRET_KEY` using HS256.

**Analysis** — sends a structured prompt to `gemini-2.0-flash` requesting JSON output. Falls back to `fallback_analysis()` if the API key is absent or the call fails; this compares values against a built-in reference table covering ~35 common tests (CBC, lipids, metabolic, kidney, liver, thyroid, vitamins).

### Frontend (`frontend/`)

| File | What it does |
|---|---|
| `src/main.jsx` | React entry point, mounts `AuthProvider` |
| `src/App.jsx` | Auth gate — shows Login/Signup or the main nav |
| `src/context/AuthContext.jsx` | Global `user` state, `login` / `signup` / `logout` |
| `src/services/api.js` | Axios instance with Bearer token injection + automatic refresh on 401 |
| `src/pages/Home.jsx` | Test-entry form + analysis results panel |
| `src/pages/History.jsx` | Past analyses list with delete |
| `src/pages/Login.jsx` / `Signup.jsx` | Auth forms |

Styling: **Tailwind CSS v4** via the `@tailwindcss/vite` plugin (configured in `vite.config.js`).

---

## Database schema

**`users`** collection
```json
{ "_id": ObjectId, "email": "...", "full_name": "...", "password": "<bcrypt>", "created_at": Date, "updated_at": Date }
```

**`analyses`** collection
```json
{
  "_id": ObjectId,
  "user_id": "<user _id>",
  "created_at": Date,
  "analysis": {
    "summary": ["..."],
    "details": [{ "name": "...", "value": 0, "unit": "...", "reference_range": "...", "status": "normal|low|high", "note": "..." }],
    "suggestions": ["..."],
    "grocery_list": ["..."],
    "recipes": [{ "name": "...", "ingredients": ["..."], "instructions": ["..."] }],
    "disclaimer": "..."
  }
}
```

---

## API reference

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | — | Register (email, password, full_name) |
| POST | `/api/auth/login` | — | Login → access + refresh tokens |
| POST | `/api/auth/refresh` | — | Exchange refresh token for new tokens |
| GET | `/api/auth/me` | ✓ | Current user info |
| POST | `/api/analyze/analyze` | ✓ | Submit results, get AI analysis |
| GET | `/api/analyze/history` | ✓ | List all analyses (newest first) |
| GET | `/api/analyze/history/{id}` | ✓ | Get one analysis |
| DELETE | `/api/analyze/history/{id}` | ✓ | Delete one analysis |
| GET | `/health` | — | MongoDB ping |

---

## Environment variables

### `backend/.env`

| Variable | Default | Notes |
|---|---|---|
| `MONGO_URI` | `mongodb://mongodb:27017` | Change to Atlas URI for cloud |
| `DB_NAME` | `blood_test_analyzer` | |
| `SECRET_KEY` | `your-super-secret-key-...` | Change in production |
| `GOOGLE_API_KEY` | _(empty)_ | Gemini key; blank = fallback mode |
| `CORS_ORIGINS` | `http://localhost:5173,...` | Comma-separated allowed origins |

### `frontend/.env`

| Variable | Default | Notes |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` | Backend base URL |

---

## Troubleshooting

**Backend won't start**
```bash
docker compose logs backend
```
Common causes: bad `requirements.txt` pin, import error in Python files.

**CORS error in browser**
Usually means the backend crashed before handling the request. Fix the backend error first — CORS errors with `Status code: (null)` mean nothing is listening on port 8000.

**MongoDB not connected**
```bash
docker compose ps          # check all containers are Up
docker compose restart mongodb backend
```

**Gemini not responding**
Check `GOOGLE_API_KEY` in `backend/.env`. The app automatically falls back to rule-based analysis — you'll still get reference ranges and normal/low/high flags, just no AI commentary.

---

## Disclaimer

This tool is for **educational purposes only**. It is not a substitute for professional medical advice. Always consult a qualified healthcare provider about your lab results.
