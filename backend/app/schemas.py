from pydantic import BaseModel, Field
from typing import Dict, List, Optional

class ContactInfoSchema(BaseModel):
    email: Optional[str] = Field(None, example="candidate@email.com")
    phone: Optional[str] = Field(None, example="+1 (555) 019-2834")
    linkedin: Optional[str] = Field(None, example="https://linkedin.com/in/username")
    github: Optional[str] = Field(None, example="https://github.com/username")

class ScoreBreakdownSchema(BaseModel):
    section_score: float = Field(..., description="Completeness of standard resume sections (max 20)")
    formatting_score: float = Field(..., description="Layout validation (max 20)")
    skills_score: float = Field(..., description="Role skill density (max 40)")
    experience_score: float = Field(..., description="Tenure suitability (max 20)")

class SkillMatchSchema(BaseModel):
    matched_skills: List[str] = Field(..., example=["Python", "FastAPI"])
    missing_skills: List[str] = Field(..., example=["Docker", "React"])
    match_ratio: float = Field(..., example=50.0)

class AnalysisResponseSchema(BaseModel):
    ats_score: float = Field(..., description="Overall score out of 100", example=78.5)
    breakdown: ScoreBreakdownSchema
    skill_match: SkillMatchSchema
    experience_years: float = Field(..., description="Estimated experience", example=3.5)
    required_experience: Optional[float] = Field(None, description="Required experience if JD provided", example=4.0)
    contact_info: ContactInfoSchema
    education: List[str] = Field(..., example=["B.Tech Computer Science"])
    skills: Dict[str, List[str]] = Field(..., description="Categorized skills list")
    strengths: List[str] = Field(..., description="Strengths of resume")
    weaknesses: List[str] = Field(..., description="Areas of improvement")
    recommendations: List[str] = Field(..., description="Actionable checklist items")
    pages_count: int = Field(..., example=1)
    has_images: bool = Field(..., example=False)

class HealthResponseSchema(BaseModel):
    status: str = Field(..., example="healthy")
