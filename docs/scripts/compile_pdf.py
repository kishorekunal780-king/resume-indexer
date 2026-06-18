import os
import re
import sys
from fpdf import FPDF
from fpdf.enums import XPos, YPos

class DocumentPDF(FPDF):
    def __init__(self, doc_title: str = "Documentation Layer", layer_name: str = "Layer"):
        super().__init__()
        self.doc_title = doc_title
        self.layer_name = layer_name
        self.set_margins(20, 20, 20)
        self.alias_nb_pages()
        self.current_font_family = "helvetica"
        self.current_font_size = 10

    def clean_unicode(self, text: str) -> str:
        """Replaces common non-latin-1 Unicode characters with standard ASCII equivalents."""
        replacements = {
            "│": "|",
            "▼": "v",
            "▲": "^",
            "─": "-",
            "┌": "+",
            "┐": "+",
            "└": "+",
            "┘": "+",
            "├": "+",
            "┤": "+",
            "┬": "+",
            "┴": "+",
            "┼": "+",
            "→": "->",
            "←": "<-",
            "●": "*",
            "•": "*",
            "–": "-", # En dash
            "—": "-", # Em dash
            "“": '"',
            "”": '"',
            "‘": "'",
            "’": "'",
        }
        for char, repl in replacements.items():
            text = text.replace(char, repl)
        # Remove any other non-latin-1 characters
        return text.encode("latin-1", errors="replace").decode("latin-1")

    def header(self):
        if self.page_no() == 1:
            return
            
        self.set_font("helvetica", "I", 8)
        self.set_text_color(100, 116, 139) # slate gray
        self.cell(0, 10, f"{self.doc_title} - {self.layer_name}", border=0, new_x=XPos.RIGHT, new_y=YPos.TOP, align="L")
        self.cell(0, 10, "Resume Analyzer Project", border=0, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="R")
        # Draw a thin divider line
        self.set_draw_color(226, 232, 240)
        self.set_line_width(0.5)
        self.line(20, 25, 190, 25)
        self.ln(5)

    def footer(self):
        if self.page_no() == 1:
            return
            
        self.set_y(-15)
        self.set_draw_color(226, 232, 240)
        self.line(20, self.get_y() - 2, 190, self.get_y() - 2)
        
        self.set_font("helvetica", "I", 8)
        self.set_text_color(148, 163, 184)
        self.cell(0, 10, "CONFIDENTIAL - Placement & Technical Review Preparation", border=0, new_x=XPos.RIGHT, new_y=YPos.TOP, align="L")
        self.cell(0, 10, f"Page {self.page_no()} of {{nb}}", border=0, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="R")

    def draw_cover_page(self, title: str, subtitle: str, metadata: dict):
        self.add_page()
        
        self.set_fill_color(15, 23, 42)
        self.rect(0, 0, 210, 100, "F")
        
        self.set_y(35)
        self.set_font("helvetica", "B", 24)
        self.set_text_color(255, 255, 255)
        self.cell(0, 12, "RESUME ANALYZER PROJECT", border=0, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
        
        self.set_font("helvetica", "B", 14)
        self.set_text_color(56, 189, 248)
        self.cell(0, 8, "TECHNICAL ARCHITECTURE & REVIEW DOCUMENTATION", border=0, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
        
        self.set_y(120)
        self.set_font("helvetica", "B", 20)
        self.set_text_color(15, 23, 42)
        self.multi_cell(0, 10, self.clean_unicode(title.upper()), border=0, align="C")
        
        if subtitle:
            self.ln(2)
            self.set_font("helvetica", "I", 12)
            self.set_text_color(100, 116, 139)
            self.multi_cell(0, 6, self.clean_unicode(subtitle), border=0, align="C")
            
        self.set_y(170)
        self.set_draw_color(37, 99, 235)
        self.set_line_width(1.5)
        self.line(40, 175, 170, 175)
        
        self.set_y(190)
        self.set_font("helvetica", "", 10)
        self.set_text_color(71, 85, 105)
        
        for label, val in metadata.items():
            self.set_x(50)
            self.set_font("helvetica", "B", 10)
            self.cell(45, 6, f"{self.clean_unicode(label)}:", border=0, new_x=XPos.RIGHT, new_y=YPos.TOP)
            self.set_font("helvetica", "", 10)
            self.cell(0, 6, self.clean_unicode(str(val)), border=0, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    def write_styled_line(self, text: str, h: float = 6):
        text = self.clean_unicode(text)
        tokens = re.split(r'(\*\*.*?\*\*|\*.*?\*|`.*?`)', text)
        for token in tokens:
            if not token:
                continue
            if token.startswith('**') and token.endswith('**'):
                self.set_font(self.current_font_family, "B", self.current_font_size)
                self.write(h, token[2:-2])
            elif token.startswith('*') and token.endswith('*'):
                self.set_font(self.current_font_family, "I", self.current_font_size)
                self.write(h, token[1:-1])
            elif token.startswith('`') and token.endswith('`'):
                self.set_font("courier", "", self.current_font_size - 1)
                self.set_fill_color(241, 245, 249)
                self.set_text_color(219, 39, 119)
                self.write(h, f" {token[1:-1]} ")
                self.set_font(self.current_font_family, "", self.current_font_size)
                self.set_text_color(30, 41, 59)
            else:
                self.set_font(self.current_font_family, "", self.current_font_size)
                self.set_text_color(30, 41, 59)
                self.write(h, token)

def parse_markdown_to_pdf(md_path: str, pdf_path: str, title: str, subtitle: str, metadata: dict):
    pdf = DocumentPDF(doc_title=title, layer_name=subtitle)
    pdf.draw_cover_page(title, subtitle, metadata)
    pdf.add_page()
    
    with open(md_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    in_code_block = False
    code_lines = []
    
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        if stripped.startswith("```"):
            if in_code_block:
                in_code_block = False
                pdf.set_fill_color(248, 250, 252)
                pdf.set_draw_color(226, 232, 240)
                pdf.set_font("courier", "", 8.5)
                pdf.set_text_color(15, 23, 42)
                
                code_text = "".join(code_lines)
                code_text = pdf.clean_unicode(code_text)
                pdf.multi_cell(0, 4, code_text, border=1, fill=True)
                pdf.ln(4)
                code_lines = []
            else:
                in_code_block = True
            i += 1
            continue
            
        if in_code_block:
            code_lines.append(line)
            i += 1
            continue
            
        if not stripped:
            pdf.ln(3)
            i += 1
            continue
            
        if stripped.startswith("# "):
            pdf.ln(5)
            pdf.set_font("helvetica", "B", 18)
            pdf.set_text_color(15, 23, 42)
            pdf.cell(0, 10, pdf.clean_unicode(stripped[2:]), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
            pdf.set_draw_color(37, 99, 235)
            pdf.set_line_width(1.0)
            pdf.line(20, pdf.get_y(), 190, pdf.get_y())
            pdf.ln(4)
            i += 1
            continue
            
        elif stripped.startswith("## "):
            pdf.ln(4)
            pdf.set_font("helvetica", "B", 14)
            pdf.set_text_color(30, 41, 59)
            pdf.cell(0, 8, pdf.clean_unicode(stripped[3:]), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
            pdf.ln(2)
            i += 1
            continue
            
        elif stripped.startswith("### "):
            pdf.ln(3)
            pdf.set_font("helvetica", "B", 11)
            pdf.set_text_color(71, 85, 105)
            pdf.cell(0, 6, pdf.clean_unicode(stripped[4:]), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
            pdf.ln(1)
            i += 1
            continue
            
        elif stripped.startswith("#### "):
            pdf.ln(2)
            pdf.set_font("helvetica", "BI", 10)
            pdf.set_text_color(100, 116, 139)
            pdf.cell(0, 5, pdf.clean_unicode(stripped[5:]), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
            pdf.ln(1)
            i += 1
            continue
            
        if stripped.startswith("- ") or stripped.startswith("* "):
            pdf.set_x(25)
            pdf.set_font("helvetica", "B", 10)
            pdf.set_text_color(37, 99, 235)
            pdf.write(5, "* ") # Standard asterisk instead of Unicode bullet
            pdf.set_font("helvetica", "", 10)
            pdf.set_text_color(30, 41, 59)
            
            content = stripped[2:]
            pdf.write_styled_line(content, h=5)
            pdf.ln(5)
            i += 1
            continue
            
        match_num = re.match(r'^(\d+)\.\s+(.*)$', stripped)
        if match_num:
            pdf.set_x(25)
            pdf.set_font("helvetica", "B", 10)
            pdf.set_text_color(37, 99, 235)
            pdf.write(5, f"{match_num.group(1)}. ")
            pdf.set_font("helvetica", "", 10)
            pdf.set_text_color(30, 41, 59)
            
            content = match_num.group(2)
            pdf.write_styled_line(content, h=5)
            pdf.ln(5)
            i += 1
            continue
            
        if stripped.startswith(">"):
            alert_match = re.match(r'^>\s*\[!(NOTE|IMPORTANT|WARNING|TIP|CAUTION)\]\s*(.*)$', stripped, re.IGNORECASE)
            alert_type = "NOTE"
            quote_content = ""
            
            if alert_match:
                alert_type = alert_match.group(1).upper()
                quote_content = alert_match.group(2)
            else:
                quote_content = stripped[1:].strip()
                
            next_i = i + 1
            while next_i < len(lines) and lines[next_i].strip().startswith(">"):
                next_stripped = lines[next_i].strip()
                next_content = next_stripped[1:].strip()
                if re.match(r'^\[!(NOTE|IMPORTANT|WARNING|TIP|CAUTION)\]', next_content, re.IGNORECASE):
                    break
                quote_content += " " + next_content
                next_i += 1
            
            i = next_i - 1
            
            if alert_type in ["NOTE", "TIP"]:
                bg_color = (240, 249, 255)
                border_color = (14, 165, 233)
                title_color = (3, 105, 161)
            elif alert_type in ["IMPORTANT", "WARNING", "CAUTION"]:
                bg_color = (254, 242, 242)
                border_color = (239, 68, 68)
                title_color = (185, 28, 28)
            else:
                bg_color = (248, 250, 252)
                border_color = (100, 116, 139)
                title_color = (71, 85, 105)
                
            pdf.set_fill_color(*bg_color)
            pdf.set_draw_color(*border_color)
            pdf.set_line_width(1.0)
            
            start_y = pdf.get_y()
            
            pdf.set_x(25)
            pdf.set_font("helvetica", "B", 9)
            pdf.set_text_color(*title_color)
            pdf.cell(0, 5, f"[{alert_type}]", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
            
            pdf.set_x(25)
            pdf.set_font("helvetica", "", 9.5)
            pdf.set_text_color(51, 65, 85)
            pdf.multi_cell(0, 5, pdf.clean_unicode(quote_content), border=0)
            
            end_y = pdf.get_y()
            pdf.line(23, start_y + 1, 23, end_y - 1)
            pdf.ln(3)
            i += 1
            continue
            
        pdf.set_font("helvetica", "", 10)
        pdf.set_text_color(30, 41, 59)
        pdf.write_styled_line(stripped, h=5)
        pdf.ln(5)
        i += 1
        
    os.makedirs(os.path.dirname(pdf_path), exist_ok=True)
    pdf.output(pdf_path)
    print(f"Compiled: {pdf_path}")

if __name__ == "__main__":
    if len(sys.argv) < 6:
        print("Usage: python compile_pdf.py <md_path> <pdf_path> <title> <subtitle> <metadata_key:val> ...")
        sys.exit(1)
        
    md_path = sys.argv[1]
    pdf_path = sys.argv[2]
    title = sys.argv[3]
    subtitle = sys.argv[4]
    
    metadata = {}
    for meta_arg in sys.argv[5:]:
        if ":" in meta_arg:
            k, v = meta_arg.split(":", 1)
            metadata[k.strip()] = v.strip()
            
    parse_markdown_to_pdf(md_path, pdf_path, title, subtitle, metadata)
