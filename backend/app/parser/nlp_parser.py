import spacy
import re
from typing import Dict, Any, List, Set
from datetime import datetime

# Load spaCy model lazily to speed up startup times
_nlp = None

def get_nlp():
    global _nlp
    if _nlp is None:
        try:
            _nlp = spacy.load("en_core_web_sm")
        except OSError:
            spacy.cli.download("en_core_web_sm")
            _nlp = spacy.load("en_core_web_sm")
    return _nlp

# Comprehensive Skill Categorization
SKILLS_DATABASE = {
    "Languages": [
        "python", "javascript", "typescript", "c++", "c#", "java", "ruby", "go", 
        "rust", "swift", "kotlin", "php", "sql", "html", "css", "r", "bash", "scala"
    ],
    "Frameworks & Libraries": [
        "react", "angular", "vue", "next.js", "nuxt", "fastapi", "flask", "django", 
        "express", "node.js", "node", "spring boot", "laravel", "ruby on rails", "rails",
        "pytorch", "tensorflow", "keras", "scikit-learn", "pandas", "numpy", "spacy",
        "huggingface", "opencv", "tailwind css", "tailwind", "bootstrap", "sass", "redux"
    ],
    "Databases & Caches": [
        "postgresql", "postgres", "mysql", "mongodb", "redis", "cassandra", 
        "sqlite", "dynamodb", "elasticsearch", "mariadb", "firebase", "neo4j"
    ],
    "Cloud & DevOps": [
        "aws", "gcp", "azure", "docker", "kubernetes", "k8s", "terraform", "ansible",
        "jenkins", "github actions", "ci/cd", "git", "github", "gitlab", "bitbucket",
        "linux", "nginx", "heroku", "vercel", "render", "netlify", "prometheus", "grafana"
    ],
    "Concepts & Methodologies": [
        "rest api", "restful", "graphql", "microservices", "system design", "oop", 
        "object-oriented programming", "mvc", "agile", "scrum", "kanban", "machine learning", 
        "deep learning", "nlp", "natural language processing", "computer vision", 
        "data structures", "algorithms", "test driven development", "tdd", "ci/cd"
    ],
    "Soft Skills": [
        "communication", "leadership", "teamwork", "collaboration", "problem solving", 
        "critical thinking", "adaptability", "time management", "public speaking", "mentoring"
    ]
}

# Combine all skills into a flat lookup dictionary for quick extraction
FLAT_SKILLS_LOOKUP = {}
for category, skills in SKILLS_DATABASE.items():
    for skill in skills:
        FLAT_SKILLS_LOOKUP[skill] = category

def extract_contact_info(text: str) -> Dict[str, Any]:
    """Extracts email, phone number, and social links using Regex."""
    email_pattern = re.compile(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+')
    # Matches international and common domestic phone formats
    phone_pattern = re.compile(
        r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+?\d{10,12}'
    )
    linkedin_pattern = re.compile(r'linkedin\.com/in/[a-zA-Z0-9_-]+', re.IGNORECASE)
    github_pattern = re.compile(r'github\.com/[a-zA-Z0-9_-]+', re.IGNORECASE)
    
    email_match = email_pattern.search(text)
    phone_match = phone_pattern.search(text)
    linkedin_match = linkedin_pattern.search(text)
    github_match = github_pattern.search(text)
    
    return {
        "email": email_match.group(0) if email_match else None,
        "phone": phone_match.group(0) if phone_match else None,
        "linkedin": f"https://{linkedin_match.group(0)}" if linkedin_match else None,
        "github": f"https://{github_match.group(0)}" if github_match else None
    }

def extract_skills(text: str) -> Dict[str, List[str]]:
    """Extracts skills from text based on FLAT_SKILLS_LOOKUP and spacy cleaning."""
    nlp = get_nlp()
    doc = nlp(text.lower())
    
    # Extract unigrams and bigrams/trigrams for skill matching
    # Remove punctuation, spaces, and stopwords
    tokens = [token.text for token in doc if not token.is_stop and not token.is_punct and token.text.strip()]
    
    # Reconstruct n-grams (up to 3 words)
    found_skills = {cat: set() for cat in SKILLS_DATABASE.keys()}
    
    # String checking approach for reliability (handles variations like "next.js" or "spring boot")
    text_lower = text.lower()
    for skill_name, category in FLAT_SKILLS_LOOKUP.items():
        # Match word boundaries or special chars
        # For skills like C++, C#, Node.js, we need specific regex
        escaped_skill = re.escape(skill_name)
        
        # If skill contains special characters, do custom regex match
        if '+' in skill_name or '#' in skill_name or '.' in skill_name or ' ' in skill_name:
            pattern = rf"\b{escaped_skill}\b"
        else:
            pattern = rf"\b{escaped_skill}\b"
            
        if re.search(pattern, text_lower):
            found_skills[category].add(skill_name.title() if len(skill_name) > 3 or skill_name in ["aws", "gcp", "sql", "r", "c", "nlp", "oop", "mvc", "tdd"] else skill_name.upper())
            
    return {category: sorted(list(skills)) for category, skills in found_skills.items() if skills}

def extract_education(text: str) -> List[Dict[str, Any]]:
    """Extracts education mentions like degree level and majors."""
    education_keywords = [
        r'\bachelor\b', r'\bmaster\b', r'\bdoctorate\b', r'\bphd\b', r'\bb\.?tech\b', 
        r'\bm\.?tech\b', r'\bb\.?s\b', r'\bm\.?s\b', r'\bb\.?sc\b', r'\bm\.?sc\b',
        r'\bbba\b', r'\bmba\b', r'\bdiploma\b', r'\bdegree\b'
    ]
    lines = text.split('\n')
    matches = []
    
    for line in lines:
        line_clean = line.strip()

        # Degree detection
        for keyword in education_keywords:
            if re.search(keyword, line_clean, re.IGNORECASE):
                if line_clean.lower() in [
                    "degree/examination",
                    "degree examination"
                ]:
                    continue
                matches.append(line_clean)
                break

        # College / University detection
        lower_line = line_clean.lower()

        if (
            ("university" in lower_line
            or "institute" in lower_line)
            and "address" not in lower_line
            and "consultancy" not in lower_line
            and "wing" not in lower_line
            ):
                matches.append(line_clean)

    # Deduplicate and return unique references
    return sorted(list(set(matches)))[:4]

def calculate_experience_years(text: str) -> float:
    """
    Estimates years of experience from:
    1. Direct mentions of years of experience (e.g. "5 years of experience")
    2. Parsing job date intervals (e.g. "Jan 2018 - Dec 2021" or "2018 - Present")
    """
    # 1. Direct regex search
    direct_exp_pattern = re.compile(
        r'(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:work\s+)?experience', 
        re.IGNORECASE
    )
    direct_matches = direct_exp_pattern.findall(text)
    if direct_matches:
        # Return the max direct mention
        try:
            return max([float(x) for x in direct_matches])
        except ValueError:
            pass

    # 2. Date ranges extraction
    # Months helper
    months_re = r'(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)'
    # Year: 4 digits starting with 19 or 20
    year_re = r'(?:19|20)\d{2}'
    
    # Full patterns:
    # "Jan 2018 - Dec 2020" or "2018 - Present" or "02/2018 to 04/2022"
    range_pattern = re.compile(
        rf'(?:({months_re})?\s*({year_re})|(\d{{1,2}})/(\d{{4}}))\s*[-–—to]+\s*(?:({months_re})?\s*({year_re})|(\d{{1,2}})/(\d{{4}})|(present|current|now))',
        re.IGNORECASE
    )
    
    total_months = 0
    now = datetime.now()
    
    month_map = {
        'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
        'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12,
        'january': 1, 'february': 2, 'march': 3, 'april': 4, 'may': 5, 'june': 6,
        'july': 7, 'august': 8, 'september': 9, 'october': 10, 'november': 11, 'december': 12
    }
    
    matches = range_pattern.findall(text.lower())
    for match in matches:
        # Parse start date
        start_month = 1
        start_year = None
        
        # Group indices based on regex:
        # Group 0: start month word, Group 1: start year word
        # Group 2: start month num, Group 3: start year num
        # Group 4: end month word, Group 5: end year word
        # Group 6: end month num, Group 7: end year num
        # Group 8: present keyword
        
        if match[1]: # Month word + Year word
            start_year = int(match[1])
            if match[0]:
                start_month = month_map.get(match[0].lower(), 1)
        elif match[3]: # Month num / Year num
            start_year = int(match[3])
            start_month = int(match[2])
            
        if not start_year:
            continue
            
        # Parse end date
        end_month = 1
        end_year = None
        
        if match[8]: # Present / Current
            end_year = now.year
            end_month = now.month
        elif match[5]: # Month word + Year word
            end_year = int(match[5])
            if match[4]:
                end_month = month_map.get(match[4].lower(), 1)
        elif match[7]: # Month num / Year num
            end_year = int(match[7])
            end_month = int(match[6])
            
        if not end_year:
            continue
            
        # Compute difference in months
        months_diff = (end_year - start_year) * 12 + (end_month - start_month)
        # Sanity check: jobs shouldn't be negative time or more than 50 years
        if 0 < months_diff < 600:
            total_months += months_diff
            
    if total_months > 0:
        return round(total_months / 12, 1)
        
    return 0.0

def process_resume_nlp(parsed_pdf: Dict[str, Any]) -> Dict[str, Any]:
    """Runs full NLP/Regex pipeline over parsed PDF."""
    text = parsed_pdf["raw_text"]
    sections = parsed_pdf["sections"]
    
    contact_info = extract_contact_info(text)
    skills = extract_skills(text)
    education = extract_education(text)
    experience_years = calculate_experience_years(text)
    
    # Flatten skills for flat listing
    all_skills_flat = []
    for cat_skills in skills.values():
        all_skills_flat.extend(cat_skills)
        
    return {
        "contact_info": contact_info,
        "skills": skills,
        "all_skills_flat": all_skills_flat,
        "education": education,
        "experience_years": experience_years,
        "pages_count": parsed_pdf["pages_count"],
        "has_images": parsed_pdf["has_images"],
        "images_count": parsed_pdf["images_count"],
        "sections_found": list(sections.keys())
    }
