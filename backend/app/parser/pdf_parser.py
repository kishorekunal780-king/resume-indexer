import fitz  # PyMuPDF
import re
from typing import Dict, Any, List

# Common section headers in resumes
SECTION_HEADERS = {
    "experience": ["experience", "work experience", "professional experience", "employment history", "work history", "history"],
    "education": ["education", "academic background", "academic history", "qualification", "qualifications"],
    "projects": ["projects", "academic projects", "personal projects", "key projects"],
    "skills": ["skills", "technical skills", "core competencies", "technologies", "expertise", "specializations"],
    "certifications": ["certifications", "licenses", "certificates", "courses"],
    "summary": ["summary", "professional summary", "objective", "career objective", "about me", "profile"],
    "contact": ["contact", "contact info", "personal information", "social links"]
}

def clean_text(text: str) -> str:
    """Cleans extracted text by normalizing whitespaces."""
    if not text:
        return ""
    # Replace multiple spaces with a single space
    text = re.sub(r'[ \t]+', ' ', text)
    # Normalize multiple newlines to double newlines (to preserve paragraphs)
    text = re.sub(r'\n\s*\n', '\n\n', text)
    return text.strip()

def identify_sections(text: str) -> Dict[str, str]:
    """
    Identifies sections in the resume by looking for common headings.
    Splits the text accordingly.
    """
    lines = text.split('\n')
    sections = {key: [] for key in SECTION_HEADERS.keys()}
    sections["misc"] = []
    
    current_section = "misc"
    
    # Pre-compile regex for faster matching of headers
    # Match headers that stand alone on a line or are capitalized/bold
    header_patterns = {}
    for sec_name, keywords in SECTION_HEADERS.items():
        patterns = []
        for kw in keywords:
            # Match exact keyword, allowing optional spaces and terminal punctuation like colons
            patterns.append(rf"^\s*{re.escape(kw)}\s*:?\s*$")
        header_patterns[sec_name] = re.compile("|".join(patterns), re.IGNORECASE)

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
            
        # Check if line is a header
        matched_section = None
        for sec_name, pattern in header_patterns.items():
            if pattern.match(stripped):
                matched_section = sec_name
                break
        
        if matched_section:
            current_section = matched_section
        else:
            sections[current_section].append(stripped)
            
    # Join the lines back
    return {key: clean_text("\n".join(val)) for key, val in sections.items() if val}

def parse_pdf(pdf_bytes: bytes) -> Dict[str, Any]:
    """
    Parses a PDF file from bytes.
    Extracts raw text, page counts, images count, and sections.
    """
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    pages_count = len(doc)
    
    raw_text_list = []
    images_count = 0
    
    for page in doc:
        raw_text_list.append(page.get_text())
        images_count += len(page.get_images())
        
    raw_text = "\n".join(raw_text_list)
    cleaned_raw_text = clean_text(raw_text)
    sections = identify_sections(raw_text)
    
    return {
        "raw_text": cleaned_raw_text,
        "pages_count": pages_count,
        "has_images": images_count > 0,
        "images_count": images_count,
        "sections": sections
    }
