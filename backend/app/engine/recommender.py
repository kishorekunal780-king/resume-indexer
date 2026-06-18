from typing import Dict, Any, List

def generate_recommendations(resume_data: Dict[str, Any], score_result: Dict[str, Any]) -> Dict[str, Any]:
    """
    Evaluates parsing and scoring data to generate lists of:
    - Strengths
    - Weaknesses / Areas for Improvement
    - Actionable Recommendations
    """
    strengths = []
    weaknesses = []
    recommendations = []
    
    experience_years = resume_data.get("experience_years", 0.0)
    pages = resume_data.get("pages_count", 1)
    has_images = resume_data.get("has_images", False)
    sections_found = set(resume_data.get("sections_found", []))
    contact_info = resume_data.get("contact_info", {})
    all_skills_flat = resume_data.get("all_skills_flat", [])
    
    breakdown = score_result.get("breakdown", {})
    skill_match = score_result.get("skill_match", {})
    missing_skills = skill_match.get("missing_skills", [])
    matched_skills = skill_match.get("matched_skills", [])

    # 1. EVALUATE STRENGTHS
    if experience_years >= 5.0:
        strengths.append(
            "Senior Experience Standing: Demonstrates a deep career footprint (5+ years) "
            "indicating leadership potential and project ownership maturity."
        )
    elif 2.0 <= experience_years < 5.0:
        strengths.append(
            "Established Industry Background: Exhibits stable professional tenure (2-5 years) "
            "showing readiness for mid-to-senior technical roles."
        )
        
    if len(all_skills_flat) >= 12:
        strengths.append(
            f"Broad Technical Toolkit: Lists a diverse set of {len(all_skills_flat)} skills, "
            "providing strong search indexing capability for recruiters."
        )
        
    if 1 <= pages <= 2:
        strengths.append(
            "Ideal Document Length: Fits within the standard 1-2 page layout, ensuring "
            "recruiters can quickly scan the entire document."
        )
        
    if contact_info.get("email") and contact_info.get("phone"):
        strengths.append(
            "Complete Contact Framework: Primary contact vectors (email and phone) are present, "
            "removing roadblocks for recruiter outreach."
        )
        
    if contact_info.get("linkedin") or contact_info.get("github"):
        strengths.append(
            "Professional Online Footprint: Includes links to professional/code platforms, "
            "supporting portfolio validation."
        )
        
    if "experience" in sections_found and "projects" in sections_found:
        strengths.append(
            "Balanced Structure: Contains both professional employment history and personal projects, "
            "showing both industry experience and proactive learning."
        )
        
    if skill_match.get("match_ratio", 0) >= 70.0:
        strengths.append(
            f"High Role Alignment: Exhibits strong skill matching ({skill_match['match_ratio']}%) "
            "against the target job description requirements."
        )
        
    # Fallback strength
    if not strengths:
        strengths.append(
            "Structured Document: Basic sections are labeled, laying a baseline for resume tuning."
        )

    # 2. EVALUATE WEAKNESSES
    if experience_years < 1.0:
        weaknesses.append(
            "Limited Industry Exposure: Displays less than 1 year of industry experience. "
            "May cause filtering flags for mid-level roles."
        )
        
    if not contact_info.get("email") or not contact_info.get("phone"):
        weaknesses.append(
            "Missing Critical Contact Fields: Absent email address or phone number, "
            "creating an immediate bottleneck for recruitment coordinates."
        )
        
    if not contact_info.get("linkedin") and not contact_info.get("github"):
        weaknesses.append(
            "Invisible Web Presence: No LinkedIn or GitHub profiles found, leaving "
            "credentials and repository portfolios unlinked."
        )
        
    if "projects" not in sections_found:
        weaknesses.append(
            "Missing Projects Segment: No dedicated section for practical engineering projects, "
            "making it harder to demonstrate applied skills."
        )
        
    if "summary" not in sections_found:
        weaknesses.append(
            "Missing Executive Hook: Absent summary/objective header, leaving the resume "
            "without a rapid overview introduction."
        )
        
    if len(all_skills_flat) < 5:
        weaknesses.append(
            "Sparsely Populated Skills Section: Lists fewer than 5 technical skills, "
            "reducing the likelihood of matching ATS search strings."
        )
        
    if pages > 2:
        weaknesses.append(
            f"Verbose Document Span ({pages} pages): Exceeds the standard 2-page limit, "
            "which can lead to information clutter and drop-off in recruiter attention."
        )
        
    if has_images:
        weaknesses.append(
            "ATS Parsing Obstacles: Contains embedded images or graphical charts. "
            "ATS systems can fail to extract text from graphics, causing empty sections."
        )
        
    if missing_skills and len(missing_skills) > 4:
        weaknesses.append(
            f"Critical Skill Deficits: Lacks {len(missing_skills)} key skills requested "
            "in the job description, leading to a lower match index."
        )

    # 3. ACTIONABLE RECOMMENDATIONS
    if not contact_info.get("email") or not contact_info.get("phone"):
        recommendations.append(
            "Add a standardized header containing a professional email address and a direct contact phone number."
        )
        
    if not contact_info.get("linkedin") and not contact_info.get("github"):
        recommendations.append(
            "Include URLs for your LinkedIn profile (to verify background) and GitHub profile "
            "(to showcase actual coding samples)."
        )
        
    if "projects" not in sections_found:
        recommendations.append(
            "Create a 'Projects' section containing 2-3 recent engineering tasks. Structured as: "
            "Project Title, Tech Stack Used, and Bullet points describing what you built and the results."
        )
        
    if "summary" not in sections_found:
        recommendations.append(
            "Draft a 3-line 'Professional Summary' at the top of your resume. State your core role (e.g. Frontend Engineer), "
            "years of experience, and a key achievement."
        )
        
    if len(all_skills_flat) < 8:
        recommendations.append(
            "Categorize and expand your 'Skills' block (e.g. Languages, Databases, Tools). "
            "Explicitly list all technologies you have touched, even junior libraries."
        )
        
    if pages > 2:
        recommendations.append(
            "Condense your document to exactly 1 or 2 pages. Remove roles older than 7 years or condense bullet points "
            "to a maximum of 4 per job."
        )
        
    if has_images:
        recommendations.append(
            "Remove visual graphic items like progress bars for skill levels, profile headshots, or flowchart diagrams. "
            "Replace them with standard text representations."
        )
        
    if experience_years < 1.0:
        recommendations.append(
            "As an entry-level candidate, move your 'Projects' and 'Education' sections above your 'Experience' section "
            "to emphasize your practical capabilities and technical training."
        )
        
    if missing_skills:
        # Suggest the top 5 missing skills specifically
        sample_missing = sorted(list(missing_skills))[:5]
        recommendations.append(
            f"Explicitly add missing keywords required by the job description if you have working exposure to them: "
            f"{', '.join(sample_missing)}."
        )
        
    # Standard fallback recommendation
    if not recommendations:
        recommendations.append(
            "Conduct a periodic review of your resume, updating bullet points with active verbs "
            "and measurable outcomes (e.g. 'improved performance by 20%')."
        )
        
    return {
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendations": recommendations
    }
