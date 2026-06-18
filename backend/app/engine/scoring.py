import re
from typing import Dict, Any, List, Set
from app.parser.nlp_parser import extract_skills, calculate_experience_years

def extract_jd_requirements(jd_text: str) -> Dict[str, Any]:
    """
    Extracts structured requirements (skills and required experience) from a Job Description.
    """
    if not jd_text:
        return {"skills": [], "required_experience": 2.0}
        
    # Extract skills from JD text
    extracted_skills_dict = extract_skills(jd_text)
    
    # Flatten JD skills
    jd_skills = []
    for cat_skills in extracted_skills_dict.values():
        jd_skills.extend(cat_skills)
        
    # Extract required years of experience using Regex
    # E.g. "3+ years of experience", "minimum 5 years"
    exp_pattern = re.compile(
        r'(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|work|industry)', 
        re.IGNORECASE
    )
    matches = exp_pattern.findall(jd_text)
    required_exp = 2.0 # default baseline
    if matches:
        try:
            required_exp = max([float(x) for x in matches])
        except ValueError:
            pass
            
    return {
        "skills": list(set(jd_skills)),
        "required_experience": required_exp
    }

def calculate_ats_score(resume_data: Dict[str, Any], jd_requirements: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Calculates the ATS score (0-100) based on:
    1. Skills matching (40% weight)
    2. Experience relevance (20% weight)
    3. Section Completeness (20% weight)
    4. Formatting & Contact presence (20% weight)
    
    If jd_requirements is provided, skills and experience are scored relative to the JD.
    If not, they are scored against standard professional benchmarks.
    """
    # 1. Section Completeness Score (Max 20 pts)
    # Check for: summary, experience, education, skills, projects
    sections_found = set(resume_data.get("sections_found", []))
    section_score = 0
    section_weights = {
        "experience": 5,
        "education": 5,
        "skills": 5,
        "projects": 3,
        "summary": 2
    }
    for sec, weight in section_weights.items():
        if sec in sections_found:
            section_score += weight
            
    # 2. Formatting & Contact Score (Max 20 pts)
    formatting_score = 0
    contact_info = resume_data.get("contact_info", {})
    
    # Contact check (10 pts max)
    if contact_info.get("email"):
        formatting_score += 4
    if contact_info.get("phone"):
        formatting_score += 4
    if contact_info.get("linkedin") or contact_info.get("github"):
        formatting_score += 2
        
    # Page count check (5 pts max)
    pages = resume_data.get("pages_count", 1)
    if 1 <= pages <= 2:
        formatting_score += 5
    elif pages == 3:
        formatting_score += 3
    else:
        formatting_score += 1
        
    # Image presence penalty (5 pts max)
    has_images = resume_data.get("has_images", False)
    images_count = resume_data.get("images_count", 0)
    if not has_images:
        formatting_score += 5
    else:
        # Penalize if too many images (which throws off normal ATS)
        if images_count <= 2:
            formatting_score += 3
        else:
            formatting_score += 1

    # 3. Skills Score (Max 40 pts)
    skills_score = 0
    resume_skills_flat = resume_data.get("all_skills_flat", [])
    resume_skills_set = set([s.lower() for s in resume_skills_flat])
    
    skill_match_details = {}
    
    if jd_requirements and jd_requirements.get("skills"):
        jd_skills_list = jd_requirements.get("skills", [])
        jd_skills_set = set([s.lower() for s in jd_skills_list])
        
        # Calculate overlap
        matched_skills = resume_skills_set.intersection(jd_skills_set)
        missing_skills = jd_skills_set.difference(resume_skills_set)
        
        # Normalised match percentage
        if jd_skills_set:
            match_ratio = len(matched_skills) / len(jd_skills_set)
        else:
            match_ratio = 1.0
            
        skills_score = round(match_ratio * 40, 1)
        
        # Return matched/missing details
        skill_match_details = {
            "matched_skills": [s.title() for s in matched_skills],
            "missing_skills": [s.title() for s in missing_skills],
            "match_ratio": round(match_ratio * 100, 1)
        }
    else:
        # Standard benchmark: Expecting at least 10 skills for maximum score
        skills_count = len(resume_skills_flat)
        skills_score = min(40.0, (skills_count / 10) * 40)
        skill_match_details = {
            "matched_skills": resume_skills_flat,
            "missing_skills": [],
            "match_ratio": round((skills_count / 10) * 100, 1) if skills_count < 10 else 100.0
        }

    # 4. Experience Score (Max 20 pts)
    experience_score = 0
    experience_years = resume_data.get("experience_years", 0.0)
    
    if jd_requirements:
        required_years = jd_requirements.get("required_experience", 2.0)
        # Handle cases where required_years is 0 (internship/entry level)
        if required_years == 0:
            experience_score = 20
        else:
            ratio = experience_years / required_years
            experience_score = min(20.0, ratio * 20)
    else:
        # Benchmark: 5 years experience gets max points for a general resume
        experience_score = min(20.0, (experience_years / 5.0) * 20)

    # Sum total score
    total_score = round(section_score + formatting_score + skills_score + experience_score, 1)
    # Clamp between 0 and 100
    total_score = max(0.0, min(100.0, total_score))
    
    return {
        "ats_score": total_score,
        "breakdown": {
            "section_score": section_score,      # max 20
            "formatting_score": formatting_score,  # max 20
            "skills_score": skills_score,          # max 40
            "experience_score": experience_score,  # max 20
        },
        "skill_match": skill_match_details,
        "experience_years": experience_years,
        "required_experience": jd_requirements.get("required_experience", None) if jd_requirements else None
    }
