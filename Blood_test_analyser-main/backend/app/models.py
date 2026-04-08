from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class BloodTestResult(BaseModel):
    name: str
    value: float
    unit: str

class PatientInfo(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    notes: Optional[str] = None

class AnalysisRequest(BaseModel):
    results: List[BloodTestResult]
    patient_info: Optional[PatientInfo] = None

class TestDetail(BaseModel):
    name: str
    value: float
    unit: str
    reference_range: str
    status: str  # normal, low, high
    note: str

class Recipe(BaseModel):
    name: str
    ingredients: List[str]
    instructions: List[str]

class AnalysisResponse(BaseModel):
    id: Optional[str] = None
    summary: List[str]
    details: List[TestDetail]
    suggestions: List[str]
    grocery_list: List[str]
    recipes: List[Recipe]
    disclaimer: str
    created_at: Optional[datetime] = None

class AnalysisHistoryItem(BaseModel):
    id: Optional[str] = None
    user_id: str
    analysis: AnalysisResponse
    created_at: datetime

class User(BaseModel):
    id: Optional[str] = None
    email: str
    full_name: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
