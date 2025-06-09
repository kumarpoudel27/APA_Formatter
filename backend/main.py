from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from typing import Optional, List, Dict, Tuple
import uvicorn
from docx import Document
from docx.shared import Inches, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
import re
import io

# --- FastAPI App Initialization ---
app = FastAPI()

# --- CORS Middleware ---
# Allows your frontend (e.g., from Vercel, localhost) to communicate with this backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for simplicity, you can restrict this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Root Endpoint ---
# Provides a welcome message at the base URL (e.g., http://your-app.com/)
@app.get("/")
def read_root():
    """ A simple endpoint to confirm the API is running. """
    return {
        "message": "Welcome to the APA 7 Document Formatter API.",
        "usage": "Submit a POST request to the /format-apa/ endpoint with your document text or .docx file."
    }

# --- Constants for APA Formatting ---
APA_FONT = 'Times New Roman'
APA_SIZE = 12
APA_LINE_SPACING = 2.0

# --- Text Case Helpers ---
def title_case(s: str) -> str:
    """Capitalizes major words for APA headings, preserving structure."""
    small_words = {'and', 'or', 'the', 'of', 'in', 'on', 'for', 'to', 'a', 'an', 'by', 'at', 'with', 'from', 'but', 'as', 'if'}
    words = re.split(r'([ :\-()])', s)
    capitalized_words = []
    for i, word in enumerate(words):
        if i == 0 or (i > 1 and words[i-1] in [':', ' ']):
            capitalized_words.append(word.capitalize())
        elif word.lower() in small_words and word.isalpha():
            capitalized_words.append(word.lower())
        else:
            capitalized_words.append(word.capitalize() if word.isalpha() else word)
    return "".join(capitalized_words)

def smart_sentence_case(s: str) -> str:
    """Capitalizes the first letter of a string, trying to preserve acronyms."""
    s = s.strip()
    if not s:
        return s
    words = s.split()
    first_word = words[0].capitalize()
    rest_words = [word if word.isupper() else word.lower() for word in words[1:]]
    return " ".join([first_word] + rest_words)

# --- Section & Heading Detection (Aligned with Sample Doc) ---
def classify_paragraph(text: str) -> Tuple[str, str]:
    """
    Classifies a paragraph for accurate formatting based on APA 7 student paper rules.
    Returns a tuple of (classification, cleaned_text).
    """
    text = text.strip()
    if not text:
        return "empty", ""
    lower_text = text.lower()
    
    if len(text.split()) > 40:
        return "block_quote", text
    if lower_text.startswith("keywords:"):
        return "keywords", text
    if text.istitle() and len(text.split()) < 10 and not text.endswith('.'):
        return "heading_level_2", text
    return "body_paragraph", text

# --- Master Reference Parsing and Formatting Function ---
def parse_and_format_reference(ref_text: str) -> Tuple[str, Dict, Optional[str]]:
    """
    A rewritten, robust function to parse a single reference string based on the sample doc.
    Returns: (formatted_text, formatting_dict, url)
    """
    ref_text = ref_text.strip()
    fmt = {'italics': []}
    url = None

    url_match = re.search(r'(https?://\S+)', ref_text)
    if url_match:
        url = url_match.group(1).strip('.')
        ref_text = ref_text[:url_match.start()].strip()

    year_match = re.search(r'\(((?:\d{4}.*?|n\.d\.)\.?)\)\.', ref_text)
    if not year_match:
        return ref_text, fmt, url

    authors_part = ref_text[:year_match.start()].strip()
    date_part = f"({year_match.group(1)})"
    content_part = ref_text[year_match.end():].strip()
    
    authors_final_str = authors_part
    final_text_parts = [authors_final_str, date_part]
    current_pos = len(authors_final_str) + len(date_part) + 2

    # Heuristic for Journal Article
    journal_match = re.match(r'(.+?\.)\s*([^,]+),\s*(\d+)(?:\((\w+)\))?,\s*([\d–-]+)\.', content_part, re.IGNORECASE)
    if journal_match:
        article_title = smart_sentence_case(journal_match.group(1).strip().rstrip('.'))
        journal_name = title_case(journal_match.group(2).strip())
        volume = journal_match.group(3).strip()
        issue = f"({journal_match.group(4)})" if journal_match.group(4) else ""
        pages = journal_match.group(5).strip()
        
        reconstructed_source = f"{journal_name}, {volume}{issue}, {pages}."
        final_text_parts.extend([article_title + '.', reconstructed_source])
        
        journal_start = current_pos + len(article_title) + 2
        journal_end = journal_start + len(journal_name)
        fmt['italics'].append((journal_start, journal_end))
        
        volume_start = journal_end + 2
        volume_end = volume_start + len(volume)
        fmt['italics'].append((volume_start, volume_end))
    else: # Assume Book or Report
        # This part could be expanded with more heuristics for other types (e.g., edited books)
        # For now, it treats remaining content as the title and publisher.
        book_match = re.match(r'([^.]+)(\s*\(.+? ed\.\))?\.\s*(.*)', content_part)
        if book_match:
            book_title = book_match.group(1).strip()
            edition = (book_match.group(2) or "").strip()
            publisher = (book_match.group(3) or "").strip().rstrip('.')
            
            title_part = book_title + (f" {edition}" if edition else "")
            final_text_parts.append(title_part + '.')
            if publisher: final_text_parts.append(publisher + '.')
            
            title_start = current_pos
            title_end = current_pos + len(title_part)
            fmt['italics'].append((title_start, title_end))

    final_ref = " ".join(final_text_parts)
    final_ref = re.sub(r'\s+([.,])', r'\1', final_ref) # Clean up spaces before punctuation
    return final_ref, fmt, url

def apa_sort_key(entry_str: str) -> str:
    """Generates a sort key for a reference string (Author or Title)."""
    entry_str = entry_str.strip()
    year_match = re.search(r'\s*\((?:\d{4}|n\.d\.)', entry_str)
    sortable_part = entry_str[:year_match.start()].strip().lower() if year_match else entry_str.lower()
    return re.sub(r'^(a|an|the)\s+', '', sortable_part)


# --- Main API Endpoint for APA Formatting ---
@app.post("/format-apa/")
async def format_apa_endpoint(
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
):
    if file:
        try:
            doc_in = Document(file.file)
            content = "\n".join([p.text for p in doc_in.paragraphs])
        except Exception:
            return JSONResponse({"error": "Could not process .docx file."}, status_code=400)
    elif text:
        content = text
    else:
        return JSONResponse({"error": "No input provided."}, status_code=400)

    # --- Dynamic Section Parsing ---
    lines = [line.strip() for line in content.split('\n') if line.strip()]
    title_page_lines, abstract_lines, body_lines, reference_lines = [], [], [], []
    current_section = "title"
    for line in lines:
        line_lower = line.lower().strip()
        if line_lower == "references": current_section = "references"; continue
        elif line_lower == "abstract": current_section = "abstract"; continue
        
        if current_section == "title": title_page_lines.append(line)
        elif current_section == "abstract": abstract_lines.append(line)
        elif current_section == "references": reference_lines.append(line)
        else: body_lines.append(line)
            
    # --- DOCX Generation ---
    doc = Document()
    style = doc.styles['Normal']
    style.font.name = APA_FONT
    style.font.size = Pt(APA_SIZE)
    
    # Page Setup and Header
    section = doc.sections[0]
    section.top_margin, section.bottom_margin = Inches(1), Inches(1)
    section.left_margin, section.right_margin = Inches(1), Inches(1)
    header = section.header
    p_header = header.paragraphs[0] if header.paragraphs else header.add_paragraph()
    p_header.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    run = p_header.add_run()
    fldChar1 = OxmlElement('w:fldChar'); fldChar1.set(qn('w:fldCharType'), 'begin')
    instrText = OxmlElement('w:instrText'); instrText.set(qn('w:xml:space'), 'preserve'); instrText.text = 'PAGE'
    fldChar2 = OxmlElement('w:fldChar'); fldChar2.set(qn('w:fldCharType'), 'end')
    run._r.extend([fldChar1, instrText, fldChar2])

    # Title Page
    if title_page_lines:
        for _ in range(3): doc.add_paragraph()
        p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER; p.paragraph_format.line_spacing = APA_LINE_SPACING
        p.add_run(title_case(title_page_lines[0])).bold = True
        doc.add_paragraph()
        for line in title_page_lines[1:]:
            p = doc.add_paragraph(line); p.alignment = WD_ALIGN_PARAGRAPH.CENTER; p.paragraph_format.line_spacing = APA_LINE_SPACING

    # Abstract & Keywords Page
    if abstract_lines:
        doc.add_page_break()
        p_abstract_heading = doc.add_paragraph(); p_abstract_heading.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_abstract_heading.add_run("Abstract").bold = True
        
        abstract_body = [line for line in abstract_lines if not line.lower().strip().startswith("keywords:")]
        keywords_line = next((line for line in abstract_lines if line.lower().strip().startswith("keywords:")), None)
        
        p_abstract = doc.add_paragraph(' '.join(abstract_body)); p_abstract.paragraph_format.line_spacing = APA_LINE_SPACING
        
        if keywords_line:
            p_keywords = doc.add_paragraph(); p_keywords.paragraph_format.first_line_indent = Inches(0.5); p_keywords.paragraph_format.line_spacing = APA_LINE_SPACING
            label, rest = keywords_line.split(':', 1)
            p_keywords.add_run(label + ":").italic = True; p_keywords.add_run(rest)

    # Main Body
    if body_lines:
        doc.add_page_break()
        if title_page_lines:
            p_title_repeat = doc.add_paragraph(); p_title_repeat.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_title_repeat.add_run(title_case(title_page_lines[0])).bold = True

        for line in body_lines:
            classification, text = classify_paragraph(line)
            p = doc.add_paragraph(); p.paragraph_format.line_spacing = APA_LINE_SPACING
            if classification == "heading_level_2": p.add_run(title_case(text)).bold = True
            elif classification == "block_quote": p.paragraph_format.left_indent = Inches(0.5); p.add_run(text)
            elif classification == "body_paragraph": p.paragraph_format.first_line_indent = Inches(0.5); p.add_run(text)
                
    # References Page
    if reference_lines:
        doc.add_page_break()
        p_ref_heading = doc.add_paragraph(); p_ref_heading.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_ref_heading.add_run("References").bold = True

        sorted_refs = sorted(reference_lines, key=apa_sort_key)
        for ref_text in sorted_refs:
            formatted_text, fmt_info, url = parse_and_format_reference(ref_text)
            p = doc.add_paragraph(); p.paragraph_format.line_spacing = APA_LINE_SPACING; p.paragraph_format.hanging_indent = Inches(0.5)
            
            current_pos = 0
            sorted_italics = sorted(fmt_info.get('italics', []), key=lambda x: x[0])
            for start, end in sorted_italics:
                if start > current_pos: p.add_run(formatted_text[current_pos:start])
                if start < end <= len(formatted_text): p.add_run(formatted_text[start:end]).italic = True
                current_pos = end
            if current_pos < len(formatted_text): p.add_run(formatted_text[current_pos:])
            if url: p.add_run(" " + url)

    # Final pass to set font on all runs
    for p in doc.paragraphs:
        for run in p.runs:
            run.font.name = APA_FONT
            run.font.size = Pt(APA_SIZE)

    # Save and Return DOCX
    buf = io.BytesIO()
    doc.save(buf)
    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        headers={"Content-Disposition": "attachment; filename=formatted_apa_document.docx"}
    )

# --- Uvicorn Runner for Local Development ---
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
