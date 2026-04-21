from fastapi import APIRouter, Depends, File, HTTPException, Query, Request, UploadFile, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List
from io import BytesIO
from app.models import AnalysisRequest, AnalysisResponse, AnalysisHistoryItem
from app.services import MongoDBService
from app.services.analysis_service import analyze_blood_test, analyze_pdf_text

router = APIRouter()
security = HTTPBearer()

async def get_current_user(request: Request, credentials: HTTPAuthorizationCredentials = Depends(security)):
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
    
    analysis_id = db.save_analysis(user["sub"], analysis)
    return AnalysisResponse(id=analysis_id, **analysis)

@router.post("/upload-pdf", response_model=AnalysisResponse)
async def analyze_pdf(
    req: Request,
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user)
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF files are accepted.")

    content = await file.read()

    try:
        import pypdf
        reader = pypdf.PdfReader(BytesIO(content))
        text = "\n".join(page.extract_text() or "" for page in reader.pages)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Could not read PDF: {e}")

    if not text.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No text could be extracted from this PDF. Please ensure it is a text-based PDF, not a scanned image."
        )

    analysis = await analyze_pdf_text(text)

    db = MongoDBService(req.app.state.db)
    analysis_id = db.save_analysis(user["sub"], analysis)
    return AnalysisResponse(id=analysis_id, **analysis)


@router.get("/history", response_model=List[AnalysisHistoryItem])
async def get_history(
    req: Request,
    user: dict = Depends(get_current_user),
    limit: int = Query(50, le=100),
):
    db = MongoDBService(req.app.state.db)

    analyses = db.get_user_analyses(user["sub"], limit=limit)

    return [
        AnalysisHistoryItem(
            id=a.get("id"),
            user_id=user["sub"],
            analysis=AnalysisResponse(**a["analysis"]),
            created_at=a["created_at"],
        )
        for a in analyses
    ]

@router.get("/history/{analysis_id}", response_model=AnalysisHistoryItem)
async def get_analysis(
    analysis_id: str,
    req: Request,
    user: dict = Depends(get_current_user)
):
    db = MongoDBService(req.app.state.db)
    
    analysis = db.get_analysis_by_id(analysis_id, user["sub"])

    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")

    return AnalysisHistoryItem(
        id=analysis.get("id"),
        user_id=user["sub"],
        analysis=AnalysisResponse(**analysis["analysis"]),
        created_at=analysis["created_at"],
    )

@router.delete("/history/{analysis_id}")
async def delete_analysis(
    analysis_id: str,
    req: Request,
    user: dict = Depends(get_current_user)
):
    db = MongoDBService(req.app.state.db)
    
    deleted = db.delete_analysis(analysis_id, user["sub"])
    
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")
    
    return {"message": "Analysis deleted successfully"}
