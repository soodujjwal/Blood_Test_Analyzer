from fastapi import APIRouter, Depends, File, HTTPException, Query, Request, UploadFile, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List
from io import BytesIO
import logging
import re
from app.models import AnalysisRequest, AnalysisResponse, AnalysisHistoryItem
from app.services import MongoDBService
from app.services.analysis_service import analyze_blood_test, analyze_pdf_text, analyze_file_multimodal

router = APIRouter()
security = HTTPBearer()

logger = logging.getLogger(__name__)

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
    if req.app.state.db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database connection not established")
        
    db = MongoDBService(req.app.state.db)
    
    # Convert request to dict for analysis
    results = [r.dict() for r in request.results]
    patient_info = request.patient_info.dict() if request.patient_info else None
    
    # Perform analysis
    analysis = await analyze_blood_test(results, patient_info)
    
    analysis_id = db.save_analysis(user["sub"], analysis)
    return AnalysisResponse(id=analysis_id, **analysis)


def parse_lab_values_from_text(text: str):
    """Attempt to extract lab test name, value, and unit from arbitrary OCR/text content."""
    import re
    results = []
    lines = [l.strip() for l in text.splitlines() if l.strip()]

    # Original stable regex
    pattern = re.compile(r"([A-Za-z%()\-/& ]{2,60}?)[\:\s\t\-]{1,3}?(\d{1,3}(?:[\.,]\d+)?)(?:\s*([a-zA-Z/%µμμgLx\^°.-]+))?$")

    for line in lines:
        m = pattern.search(line)
        if m:
            name = m.group(1).strip().rstrip(':')
            value_str = m.group(2).replace(',', '.')
            unit = (m.group(3) or '').strip()
            try:
                value = float(value_str)
                results.append({"name": name, "value": value, "unit": unit})
            except Exception:
                continue
    return results

@router.post("/upload", response_model=AnalysisResponse)
async def upload_file(
    req: Request,
    file: UploadFile = File(...),
    age: int = Query(...),
    gender: str = Query(...),
    user: dict = Depends(get_current_user)
):
    if req.app.state.db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database connection not established")

    allowed_types = ["application/pdf", "image/png", "image/jpeg", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Only {', '.join(allowed_types)} files are accepted."
        )

    patient_info = {"age": age, "gender": gender}
    content = await file.read()
    text = ""

    if file.content_type == "application/pdf":
        try:
            import pypdf
            reader = pypdf.PdfReader(BytesIO(content))
            text = "\n".join(page.extract_text() or "" for page in reader.pages)
        except Exception as e:
            logger.warning(f"PDF extraction failed: {e}")
    else:
        try:
            from PIL import Image
            import pytesseract
            img = Image.open(BytesIO(content))
            text = pytesseract.image_to_string(img)
        except Exception as e:
            logger.warning(f"Image OCR failed: {e}")

    if text.strip():
        parsed_results = parse_lab_values_from_text(text)
        if parsed_results:
            formatted = [{"name": r["name"], "value": r["value"], "unit": r.get("unit", "")} for r in parsed_results]
            analysis = await analyze_blood_test(formatted, patient_info)
        else:
            # Fallback to multimodal if text found but no lab values parsed
            analysis = await analyze_file_multimodal(content, file.content_type, patient_info)
    else:
        # No text found at all, try multimodal
        analysis = await analyze_file_multimodal(content, file.content_type, patient_info)

    db = MongoDBService(req.app.state.db)
    analysis_id = db.save_analysis(user["sub"], analysis)
    return AnalysisResponse(id=analysis_id, **analysis)


@router.get("/history", response_model=List[AnalysisHistoryItem])
async def get_history(
    req: Request,
    user: dict = Depends(get_current_user),
    limit: int = Query(50, le=100),
):
    if req.app.state.db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database connection not established")

    try:
        db = MongoDBService(req.app.state.db)
        analyses = db.get_user_analyses(user["sub"], limit=limit)
        
        history_items = []
        for a in analyses:
            # Safely handle potential parsing errors for individual items
            try:
                # Compatibility layer: if grocery_list is a list, convert to dict
                raw_analysis = a["analysis"]
                if isinstance(raw_analysis.get("grocery_list"), list):
                    raw_analysis["grocery_list"] = {
                        "veg": raw_analysis["grocery_list"],
                        "non_veg": []
                    }
                
                history_items.append(
                    AnalysisHistoryItem(
                        id=a.get("id"),
                        user_id=user["sub"],
                        analysis=AnalysisResponse(**raw_analysis),
                        created_at=a["created_at"],
                    )
                )
            except Exception as item_err:
                logger.error(f"Error parsing history item {a.get('id')}: {item_err}")
                continue
                
        return history_items
    except Exception as e:
        logger.error(f"Error fetching history: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch history")

@router.get("/history/{analysis_id}", response_model=AnalysisHistoryItem)
async def get_analysis(
    analysis_id: str,
    req: Request,
    user: dict = Depends(get_current_user)
):
    if req.app.state.db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database connection not established")

    try:
        db = MongoDBService(req.app.state.db)
        analysis = db.get_analysis_by_id(analysis_id, user["sub"])
        if not analysis:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")
        
        # Compatibility layer
        raw_analysis = analysis["analysis"]
        if isinstance(raw_analysis.get("grocery_list"), list):
            raw_analysis["grocery_list"] = {
                "veg": raw_analysis["grocery_list"],
                "non_veg": []
            }

        return AnalysisHistoryItem(
            id=analysis.get("id"),
            user_id=user["sub"],
            analysis=AnalysisResponse(**raw_analysis),
            created_at=analysis["created_at"],
        )
    except Exception as e:
        logger.error(f"Error fetching analysis {analysis_id}: {e}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch analysis")

@router.delete("/history/{analysis_id}")
async def delete_analysis(
    analysis_id: str,
    req: Request,
    user: dict = Depends(get_current_user)
):
    if req.app.state.db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database connection not established")

    db = MongoDBService(req.app.state.db)
    deleted = db.delete_analysis(analysis_id, user["sub"])
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")
    return {"message": "Analysis deleted successfully"}
