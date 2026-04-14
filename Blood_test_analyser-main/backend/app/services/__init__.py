import os
from datetime import datetime, timedelta
from typing import Optional
import jwt
import bcrypt
from bson.objectid import ObjectId
from bson.errors import InvalidId

class AuthService:
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30
    REFRESH_TOKEN_EXPIRE_DAYS = 7

    @staticmethod
    def hash_password(password: str) -> str:
        return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    @staticmethod
    def verify_password(password: str, hashed: str) -> bool:
        return bcrypt.checkpw(password.encode(), hashed.encode())

    @classmethod
    def create_tokens(cls, user_id: str, email: str) -> dict:
        access_payload = {
            "sub": user_id,
            "email": email,
            "type": "access",
            "exp": datetime.utcnow() + timedelta(minutes=cls.ACCESS_TOKEN_EXPIRE_MINUTES)
        }
        refresh_payload = {
            "sub": user_id,
            "email": email,
            "type": "refresh",
            "exp": datetime.utcnow() + timedelta(days=cls.REFRESH_TOKEN_EXPIRE_DAYS)
        }
        
        access_token = jwt.encode(access_payload, cls.SECRET_KEY, algorithm=cls.ALGORITHM)
        refresh_token = jwt.encode(refresh_payload, cls.SECRET_KEY, algorithm=cls.ALGORITHM)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token
        }

    @classmethod
    def verify_token(cls, token: str) -> Optional[dict]:
        try:
            payload = jwt.decode(token, cls.SECRET_KEY, algorithms=[cls.ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None

class MongoDBService:
    def __init__(self, db):
        self.db = db

    def create_user(self, email: str, full_name: str, hashed_password: str):
        user = {
            "email": email,
            "full_name": full_name,
            "password": hashed_password,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        result = self.db.users.insert_one(user)
        return str(result.inserted_id)

    def get_user_by_email(self, email: str):
        return self.db.users.find_one({"email": email})

    def get_user_by_id(self, user_id: str):
        try:
            return self.db.users.find_one({"_id": ObjectId(user_id)})
        except (InvalidId, Exception):
            return None

    def save_analysis(self, user_id: str, analysis: dict):
        analysis_doc = {
            "user_id": user_id,
            "analysis": analysis,
            "created_at": datetime.utcnow()
        }
        result = self.db.analyses.insert_one(analysis_doc)
        return str(result.inserted_id)

    def get_user_analyses(self, user_id: str, limit: int = 50):
        analyses = list(self.db.analyses.find(
            {"user_id": user_id}
        ).sort("created_at", -1).limit(limit))

        for analysis in analyses:
            analysis["id"] = str(analysis["_id"])
            del analysis["_id"]

        return analyses

    def get_analysis_by_id(self, analysis_id: str, user_id: str):
        try:
            analysis = self.db.analyses.find_one({
                "_id": ObjectId(analysis_id),
                "user_id": user_id
            })
            if analysis:
                analysis["id"] = str(analysis["_id"])
                del analysis["_id"]
            return analysis
        except (InvalidId, Exception):
            return None

    def delete_analysis(self, analysis_id: str, user_id: str):
        try:
            result = self.db.analyses.delete_one({
                "_id": ObjectId(analysis_id),
                "user_id": user_id
            })
            return result.deleted_count > 0
        except (InvalidId, Exception):
            return False
