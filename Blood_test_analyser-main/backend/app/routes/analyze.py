from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthCredentials
from typing import List
from app.models import AnalysisRequest, AnalysisResponse, AnalysisHistoryItem
from app.services import MongoDBService
from app.services.analysis_service import analyze_blood_test
from fastapi import Request

router = APIRouter()
security = HTTPBearer()

async def get_current_user(request: Request, credentials: HTTPAuthCredentials = Depends(security)):
    from app.services import AuthService
    
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    token = credentials.credentials
    payload = AuthService.verify_token(token)
    
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    return payload

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze(
    request: AnalysisRequest,
    req: Request,
    user: dict = Depends(get_current_user)
):
    db = MongoDBService(req.app.state.db)
    
    # Convert request to dict for analysis
    results = [r.dict() for r in request.results]
    patient_info = request.patient_info.dict() if request.patient_info else None
    
    # Perform analysis
    analysis = await analyze_blood_test(results, patient_info)
    
    # Save to database
    analysis_id = await db.save_analysis(user["sub"], analysis)
    
    # Return response with ID and timestamp
    from datetime import datetime
    response = AnalysisResponse(
        id=analysis_id,
        **analysis,
        created_at=datetime.utcnow()
    )
    
    return response

@router.get("/history", response_model=List[AnalysisHistoryItem])
async def get_history(
    req: Request,
    user: dict = Depends(get_current_user)
):
    db = MongoDBService(req.app.state.db)
    
    analyses = await db.get_user_analyses(user["sub"])
    
    history = []
    for analysis in analyses:
        history.append(AnalysisHistoryItem(
            id=analysis.get("id"),
            user_id=user["sub"],
            analysis=AnalysisResponse(**analysis["analysis"]),
            created_at=analysis["created_at"]
        ))
    
    return history

@router.get("/history/{analysis_id}", response_model=AnalysisHistoryItem)
async def get_analysis(
    analysis_id: str,
    req: Request,
    user: dict = Depends(get_current_user)
):
    db = MongoDBService(req.app.state.db)
    
    analysis = await db.get_analysis_by_id(analysis_id, user["sub"])
    
    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")
    
    return AnalysisHistoryItem(
        id=analysis.get("id"),
        user_id=user["sub"],
        analysis=AnalysisResponse(**analysis["analysis"]),
        created_at=analysis["created_at"]
    )

@router.delete("/history/{analysis_id}")
async def delete_analysis(
    analysis_id: str,
    req: Request,
    user: dict = Depends(get_current_user)
):
    db = MongoDBService(req.app.state.db)
    
    deleted = await db.delete_analysis(analysis_id, user["sub"])
    
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")
    
    return {"message": "Analysis deleted successfully"}
