# Blood Test Analyzer - Full Stack Application

An AI-powered blood test analysis platform with user authentication, MongoDB persistence, and Docker deployment. Analyze lab results with AI insights, save history, and get personalized recommendations.

## 🏗️ Architecture

```
blood-test-analyzer/
├── backend/              (FastAPI + Python)
│   ├── app/
│   │   ├── main.py      (FastAPI app with MongoDB)
│   │   ├── models.py    (Pydantic request/response models)
│   │   ├── routes/
│   │   │   ├── auth.py  (signup, login, token refresh)
│   │   │   └── analyze.py (blood test analysis endpoints)
│   │   └── services/
│   │       ├── __init__.py (AuthService, MongoDBService)
│   │       └── analysis_service.py (AI analysis logic)
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/            (React + JavaScript)
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.jsx
│   │   ├── index.css
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Home.jsx
│   │   │   └── History.jsx
│   │   ├── services/
│   │   │   └── api.js  (API client with axios)
│   │   └── context/
│   │       └── AuthContext.jsx (Auth state management)
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile
│   └── .env.example
│
├── docker-compose.yml  (MongoDB + Backend + Frontend)
├── README.md
└── .gitignore
```

## 🚀 Quick Start with Docker

### Prerequisites
- Docker & Docker Compose installed

### 1. Clone and Setup
```bash
cd blood-test-analyzer
```

### 2. Create Environment Files
```bash
# Backend .env
cp backend/.env.example backend/.env
# Edit backend/.env and add your OpenAI key if desired:
# OPENAI_API_KEY=sk-your-key-here
# SECRET_KEY=your-production-secret-key

# Frontend .env
cp frontend/.env.example frontend/.env
```

### 3. Start All Services
```bash
docker-compose up --build
```

### 4. Access the App
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **MongoDB**: localhost:27017

### 5. Stop Services
```bash
docker-compose down
```

## 🔧 Local Development (Without Docker)

### Backend Setup

#### Prerequisites
- Python 3.11+
- MongoDB running locally (or MongoDB Atlas connection string)

#### Installation
```bash
cd backend
pip install -r requirements.txt
```

#### Configuration
```bash
cp .env.example .env
# Edit .env:
MONGO_URI=mongodb://localhost:27017
DB_NAME=blood_test_analyzer
OPENAI_API_KEY=sk-your-key-here
SECRET_KEY=your-secret-key
```

#### Run Backend
```bash
uvicorn app.main:app --reload
# Server: http://localhost:8000
# Docs: http://localhost:8000/docs
```

### Frontend Setup

#### Prerequisites
- Node.js 18+

#### Installation
```bash
cd frontend
npm install
```

#### Configuration
```bash
cp .env.example .env
# Frontend .env is ready, points to http://localhost:8000
```

#### Run Frontend
```bash
npm run dev
# Open: http://localhost:5173
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "full_name": "John Doe"
  }
  ```
- `POST /api/auth/login` - Login
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user (requires auth)

### Analysis
- `POST /api/analyze/analyze` - Analyze blood test (requires auth)
  ```json
  {
    "results": [
      {"name": "Hemoglobin", "value": 14.5, "unit": "g/dL"},
      {"name": "WBC Count", "value": 7.2, "unit": "K/µL"}
    ],
    "patient_info": {
      "age": 30,
      "gender": "Male"
    }
  }
  ```
- `GET /api/analyze/history` - Get user's analysis history (requires auth)
- `GET /api/analyze/history/{id}` - Get specific analysis (requires auth)
- `DELETE /api/analyze/history/{id}` - Delete analysis (requires auth)

## 🔑 Authentication Flow

1. **Signup**: Create account → receive `access_token` + `refresh_token`
2. **Login**: Enter credentials → receive tokens
3. **Protected Requests**: Send `Authorization: Bearer <access_token>`
4. **Token Refresh**: Use `refresh_token` to get new `access_token` (automatic)

Tokens are stored in browser's `localStorage`.

## 🗄️ Database Schema

### Users Collection
```json
{
  "_id": ObjectId,
  "email": "user@example.com",
  "full_name": "John Doe",
  "password": "bcrypt_hashed_password",
  "created_at": ISODate,
  "updated_at": ISODate
}
```

### Analyses Collection
```json
{
  "_id": ObjectId,
  "user_id": "user_object_id",
  "analysis": {
    "summary": ["..."],
    "details": [{"name": "...", "value": ..., "status": "normal|low|high"}],
    "suggestions": ["..."],
    "grocery_list": ["..."],
    "recipes": [{"name": "...", "ingredients": [...], "instructions": [...]}],
    "disclaimer": "..."
  },
  "created_at": ISODate
}
```

## 🎯 Features

### User Authentication
- ✅ Sign up with email/password
- ✅ Login/Logout
- ✅ JWT-based auth with refresh tokens
- ✅ Auto token refresh on expiry
- ✅ Password hashing with bcrypt

### Blood Test Analysis
- ✅ Input blood test values
- ✅ Auto-detect abnormal results (low/high)
- ✅ AI-powered analysis (GPT-4o-mini)
- ✅ Fallback rule-based analysis (no API key needed)
- ✅ Grocery shopping list
- ✅ Recipe suggestions

### History & Persistence
- ✅ Save analyses to MongoDB
- ✅ View analysis history
- ✅ Delete old analyses
- ✅ Filter by date

## 🔐 Security

- Passwords hashed with bcrypt
- JWT tokens with expiry (30 min access, 7 day refresh)
- CORS configured
- Environment variables for secrets
- No secrets committed to git

## 📦 Dependencies

### Backend
- FastAPI - Web framework
- PyMongo - MongoDB driver
- Pydantic - Data validation
- OpenAI - AI analysis
- PyJWT - Token management
- bcrypt - Password hashing

### Frontend
- React 18 - UI library
- Axios - HTTP client
- Tailwind CSS - Styling
- Lucide React - Icons
- Vite - Build tool

## 🛠️ Customization

### Adding More Blood Tests
Edit `backend/app/services/analysis_service.py`:
```python
REFERENCE_RANGES = {
    "Your Test Name": {
        "low": 0,
        "high": 100,
        "unit": "mg/dL",
        "category": "Your Category"
    },
    # ...
}
```

### Changing AI Model
Edit `backend/app/services/analysis_service.py`:
```python
client.chat.completions.create(
    model="gpt-4",  # Change here
    # ...
)
```

### Customizing Styles
Edit `frontend/src/index.css` or update Tailwind classes in components.

## 📝 License

MIT License - Feel free to use and modify.

## ⚠️ Disclaimer

This tool is **for educational purposes only**. It is not a substitute for professional medical advice. Always consult a qualified healthcare provider about your lab results.

## 🆘 Troubleshooting

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
docker ps | grep mongodb

# Restart services
docker-compose restart mongodb backend
```

### API Returns 401 Unauthorized
- Check if `access_token` is in localStorage
- Token may have expired - refresh with `refresh_token`
- Try logging in again

### Frontend Cannot Connect to Backend
- Ensure backend is running (`http://localhost:8000`)
- Check `VITE_API_URL` in frontend `.env`
- Check browser console for CORS errors

### OpenAI API Error
- Verify API key is set in `backend/.env`
- Check OpenAI account has credits
- App falls back to rule-based analysis if API fails

## 📧 Support

For issues or questions, check the API docs at `http://localhost:8000/docs`
