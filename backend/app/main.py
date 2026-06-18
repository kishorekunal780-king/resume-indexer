import logging
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import fitz

from app.parser.pdf_parser import parse_pdf
from app.parser.nlp_parser import process_resume_nlp
from app.engine.scoring import extract_jd_requirements, calculate_ats_score
from app.engine.recommender import generate_recommendations
from app.schemas import AnalysisResponseSchema, HealthResponseSchema

# Configure logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("resume_analyzer")

app = FastAPI(
    title="Resume Analyzer API",
    description="Stateless PDF parser, skills extraction, and ATS match evaluator.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS configurations for local frontend and production deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to target frontend domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_FILE_SIZE = 5 * 1024 * 1024 # 5 Megabytes

def validate_pdf_signature(file_bytes: bytes) -> bool:
    """Checks the first 4 bytes of a file to confirm the standard %PDF header."""
    return len(file_bytes) >= 4 and file_bytes[:4] == b"%PDF"

@app.get("/api/health", response_model=HealthResponseSchema, tags=["Utility"])
def health_check():
    """Health check endpoint to monitor API status."""
    return {"status": "healthy"}

@app.post(
    "/api/analyze", 
    response_model=AnalysisResponseSchema, 
    tags=["Analysis"], 
    summary="Analyze resume PDF against an optional Job Description"
)
async def analyze_resume(
    resume: UploadFile = File(..., description="The candidate's resume (PDF only)"),
    job_description_file: Optional[UploadFile] = File(None, description="Optional target Job Description PDF"),
    job_description_text: Optional[str] = Form(None, description="Optional target Job Description copy-paste text")
):
    # 1. Validate Resume File
    if not resume.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. The resume must be a PDF document."
        )
        
    resume_bytes = await resume.read()
    
    # Validate size
    if len(resume_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size too large. Resumes must be smaller than 5MB."
        )
        
    # Validate magic bytes
    if not validate_pdf_signature(resume_bytes):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to read file signature. Uploaded file is not a valid PDF."
        )

    # 2. Extract and Parse Resume Text
    try:
        parsed_pdf = parse_pdf(resume_bytes)
    except Exception as e:
        logger.error(f"Error parsing PDF resume: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to extract layout. The PDF file might be corrupted."
        )
        
    if not parsed_pdf["raw_text"].strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The PDF resume contains no readable text. Scanned or image-only PDFs are not supported."
        )
        
    # Process through spaCy NLP parser
    resume_nlp_data = process_resume_nlp(parsed_pdf) 
    
    # 3. Extract and Process Optional Job Description
    jd_requirements = None
    
    # Case A: JD File provided
    if job_description_file:
        if not job_description_file.filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid job description file type. It must be a PDF."
            )
            
        jd_bytes = await job_description_file.read()
        if len(jd_bytes) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Job description file size too large. Limit is 5MB."
            )
            
        if not validate_pdf_signature(jd_bytes):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Job description file signature mismatch. Not a valid PDF."
            )
            
        try:
            jd_parsed = parse_pdf(jd_bytes)
            jd_text = jd_parsed["raw_text"]
            jd_requirements = extract_jd_requirements(jd_text)
        except Exception as e:
            logger.error(f"Error parsing JD PDF: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to parse Job Description PDF."
            )
            
    # Case B: JD Text provided directly (takes priority or acts as fallback)
    elif job_description_text and job_description_text.strip():
        jd_requirements = extract_jd_requirements(job_description_text)

    # 4. Compute Scores & Matches
    score_result = calculate_ats_score(resume_nlp_data, jd_requirements)
    
    # 5. Generate recommendations
    recommendations_result = generate_recommendations(resume_nlp_data, score_result)
    
    # 6. Build response payload matching schema
    response_payload = {
        "ats_score": score_result["ats_score"],
        "breakdown": score_result["breakdown"],
        "skill_match": score_result["skill_match"],
        "experience_years": score_result["experience_years"],
        "required_experience": score_result["required_experience"],
        "contact_info": resume_nlp_data["contact_info"],
        "education": resume_nlp_data["education"],
        "skills": resume_nlp_data["skills"],
        "strengths": recommendations_result["strengths"],
        "weaknesses": recommendations_result["weaknesses"],
        "recommendations": recommendations_result["recommendations"],
        "pages_count": resume_nlp_data["pages_count"],
        "has_images": resume_nlp_data["has_images"]
    }
    
    return response_payload
