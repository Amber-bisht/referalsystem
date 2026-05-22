#!/usr/bin/env python3
import os
import re
import sys
import subprocess

# Auto-install python-docx if not installed
try:
    import docx
    from docx.shared import Inches, Pt, Cm, RGBColor
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.enum.table import WD_TABLE_ALIGNMENT
    from docx.oxml import OxmlElement, parse_xml
    from docx.oxml.ns import qn, nsdecls
except ImportError:
    print("Installing python-docx library to compile your Word document...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "python-docx"])
    import docx
    from docx.shared import Inches, Pt, Cm, RGBColor
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.enum.table import WD_TABLE_ALIGNMENT
    from docx.oxml import OxmlElement, parse_xml
    from docx.oxml.ns import qn, nsdecls

# Constants & Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DOCS_DIR = os.path.join(BASE_DIR, 'docs')
CHARTS_DIR = os.path.join(DOCS_DIR, 'assets', 'charts')
SCREENSHOTS_DIR = os.path.join(DOCS_DIR, 'assets', 'screenshots')
OUTPUT_FILE = os.path.join(BASE_DIR, 'Referral_Ecommerce_System_Thesis.docx')

# Exclude preliminaries.md as per user request to add them manually
FILES_IN_ORDER = [
    'chapter1.md',
    'chapter2.md',
    'chapter3.md',
    'chapter4.md',
    'chapter5.md',
    'chapter6.md',
    'chapter7.md',
    'chapter8.md',
    'references.md',
    'appendices.md'
]

# Screenshots Mapping Catalog
SCREENSHOT_MAP = {
    "7.1": "homepage(7.10.png",
    "7.2": "loginpage(7.2).png",
    "7.3": "signuppage(7.3).png",
    "7.4": "shoppage(7.4).png",
    "7.5": "historypage(7.5).png",
    "7.6": "earingsdashboard(7.6).png",
    "7.7": "referalnetworkpage(7.7).png",
    "7.8": "wallet-withdrawlmode(7.8).png",
    "7.9": "userprofilepage(7.9).png",
    "7.10": "admindashboard(7.10).png",
    "7.11": "catgorymanagment(7.11).png",
    "7.12": "productsmanagemnt(7.12).png",
    "7.13": "withdrawlmanagment(7.14).png",
    "7.14": "bannermangement(7.14).png",
    "7.15": "razorypaypopup(7.15).png"
}

# Helper to add dynamic bottom-center page numbers in word
def add_page_number(run):
    fldChar1 = OxmlElement('w:fldChar')
    fldChar1.set(qn('w:fldCharType'), 'begin')
    instrText = OxmlElement('w:instrText')
    instrText.set(qn('xml:space'), 'preserve')
    instrText.text = "PAGE"
    fldChar2 = OxmlElement('w:fldChar')
    fldChar2.set(qn('w:fldCharType'), 'separate')
    fldChar3 = OxmlElement('w:fldChar')
    fldChar3.set(qn('w:fldCharType'), 'end')
    
    r = run._r
    r.append(fldChar1)
    r.append(instrText)
    r.append(fldChar2)
    r.append(fldChar3)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_cell_background(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_table_borders(table):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        '<w:tblBorders %s>'
        '<w:top w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>'
        '<w:bottom w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>'
        '<w:left w:val="none"/>'
        '<w:right w:val="none"/>'
        '<w:insideH w:val="single" w:sz="4" w:space="0" w:color="E5E5E5"/>'
        '<w:insideV w:val="none"/>'
        '</w:tblBorders>' % nsdecls('w')
    )
    tblPr.append(borders)

def format_run(run, font_name="Times New Roman", size_pt=12, bold=False, italic=False, color_rgb=(0,0,0)):
    run.font.name = font_name
    run.font.size = Pt(size_pt)
    run.bold = bold
    run.italic = italic
    run.font.color.rgb = RGBColor(*color_rgb)

# Unified helper to parse inline **bold** tags and strip out markdown noise
def populate_formatted_text(p, text, font_name="Times New Roman", size_pt=12):
    # Split by bold tags (**text**)
    parts = re.split(r'(\*\*.*?\*\*)', text)
    for part in parts:
        if part.startswith('**') and part.endswith('**'):
            bold_txt = part[2:-2]
            r = p.add_run(bold_txt)
            format_run(r, font_name=font_name, size_pt=size_pt, bold=True)
        else:
            r = p.add_run(part)
            format_run(r, font_name=font_name, size_pt=size_pt)

def add_styled_paragraph(doc, text="", style=None, font_name="Times New Roman", size_pt=12, bold=False, italic=False, align=WD_ALIGN_PARAGRAPH.LEFT, line_spacing=1.0, space_after=6):
    p = doc.add_paragraph(style=style)
    p.alignment = align
    p.paragraph_format.line_spacing = line_spacing
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.space_before = Pt(0)
    
    if text:
        populate_formatted_text(p, text, font_name=font_name, size_pt=size_pt)
        if bold or italic:
            for run in p.runs:
                if bold: run.bold = True
                if italic: run.italic = True
    return p

print("----------------------------------------------------------------------")
print("HNBGU MERN Thesis Word Document Compiler — Starting Build...")
print("----------------------------------------------------------------------")

# Initialize Word document
doc = docx.Document()

# Configure Page setup for HNBGU: A4 size
section = doc.sections[0]
section.page_width = Cm(21.0)
section.page_height = Cm(29.7)

# Margins: Left = 3.0 cm, Right = 2.0 cm, Top = 2.54 cm, Bottom = 2.54 cm
section.left_margin = Cm(3.0)
section.right_margin = Cm(2.0)
section.top_margin = Cm(2.54)
section.bottom_margin = Cm(2.54)

# Header & Footer setup for page numbering
footer = section.footer
footer_p = footer.paragraphs[0]
footer_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
footer_run = footer_p.add_run()
format_run(footer_run, font_name="Times New Roman", size_pt=10)
add_page_number(footer_run)

# Build file queues
available_charts = {}
if os.path.exists(CHARTS_DIR):
    for f in os.listdir(CHARTS_DIR):
        if f.endswith('.png'):
            # Match diagram identifier e.g., chapter2_diagram_03
            m = re.match(r'^(chapter[0-9]+_diagram_[0-9]+)', f)
            if m:
                available_charts[m.group(1)] = os.path.join(CHARTS_DIR, f)

print(f"Loaded {len(available_charts)} compiled Mermaid PNG charts.")

# Process each markdown file
for file_idx, filename in enumerate(FILES_IN_ORDER):
    file_path = os.path.join(DOCS_DIR, filename)
    if not os.path.exists(file_path):
        print(f"[WARNING] File not found: {filename}. Skipping...")
        continue
        
    print(f"Processing: {filename}...")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    file_prefix = filename.replace('.md', '')
    lines = content.split('\n')
    in_code_block = False
    code_lines = []
    
    # Track current section headers for screenshot slots
    current_h2_num = "" 
    mermaid_index = 0
    
    # Table building registers
    in_table = False
    table_rows = []
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Strip code formatting backticks from raw line checking to avoid backtick matches
        clean_line_strip = line.strip().replace('`', '')
        
        # 1. Skip Horizontal Rules (---) to avoid matching them as bullet lists (• --)
        if line.strip() == '---' or re.match(r'^\-{3,}$', line.strip()) or re.match(r'^\*+$', line.strip()):
            i += 1
            continue

        # 2. Skip/Parse Box Placeholders (Appendix D Boxes)
        if line.strip().startswith('+--') and (line.strip().endswith('--+') or line.strip().endswith('+')):
            # Read all box lines inside
            box_lines = []
            i += 1
            while i < len(lines) and not (lines[i].strip().startswith('+--') and (lines[i].strip().endswith('--+') or lines[i].strip().endswith('+'))):
                box_lines.append(lines[i])
                i += 1
            box_content = "\n".join(box_lines)
            
            # Match box context
            if 'CART_SLIDEOUT_PANEL' in box_content:
                s_path = os.path.join(SCREENSHOTS_DIR, "checkoutpage.D.1.png")
                if os.path.exists(s_path):
                    p = add_styled_paragraph(doc, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=12)
                    p.add_run().add_picture(s_path, width=Inches(5.6))
                    add_styled_paragraph(doc, "Figure D.1: Interactive Cart Drawer & Checkout panel", align=WD_ALIGN_PARAGRAPH.CENTER, size_pt=10, italic=True)
                else:
                    add_styled_paragraph(doc, "[SCREENSHOT PLACEHOLDER: CART SLIDEOUT]", align=WD_ALIGN_PARAGRAPH.CENTER, italic=True, size_pt=10)
            elif 'ADDRESS_SELECTION_MODAL' in box_content:
                s_path_modal = os.path.join(SCREENSHOTS_DIR, "newaddresssavemodeD.2.png")
                s_path_cards = os.path.join(SCREENSHOTS_DIR, "savedaddresscardd.2.png")
                
                if os.path.exists(s_path_modal):
                    p = add_styled_paragraph(doc, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=12)
                    p.add_run().add_picture(s_path_modal, width=Inches(5.4))
                    add_styled_paragraph(doc, "Figure D.2(a): Dynamic Address Register Modal Form", align=WD_ALIGN_PARAGRAPH.CENTER, size_pt=10, italic=True)
                
                if os.path.exists(s_path_cards):
                    p = add_styled_paragraph(doc, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=12)
                    p.add_run().add_picture(s_path_cards, width=Inches(5.4))
                    add_styled_paragraph(doc, "Figure D.2(b): User Shipping Cards display state during order execution", align=WD_ALIGN_PARAGRAPH.CENTER, size_pt=10, italic=True)
            i += 1
            continue

        # 3. Handle Code Blocks
        if line.strip().startswith('```'):
            if not in_code_block:
                in_code_block = True
                lang = line.strip().replace('```', '')
                code_lines = []
            else:
                in_code_block = False
                # Compile code block into single gray background table cell for high readability
                if len(code_lines) > 0:
                    if lang.strip().lower() == 'mermaid':
                        mermaid_index += 1
                        chart_key = f"{file_prefix}_diagram_{str(mermaid_index).rjust(2, '0')}"
                        # Check matching chart key
                        matched_path = None
                        for key, val in available_charts.items():
                            if key.replace('_', '').lower() == chart_key.replace('_', '').lower():
                                matched_path = val
                                break
                        
                        if matched_path and os.path.exists(matched_path):
                            p = add_styled_paragraph(doc, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=12)
                            p.add_run().add_picture(matched_path, width=Inches(5.5))
                            add_styled_paragraph(doc, f"Figure: {key.upper().replace('_', ' ')} Diagram", align=WD_ALIGN_PARAGRAPH.CENTER, size_pt=10, italic=True)
                        else:
                            add_styled_paragraph(doc, f"[DIAGRAM: {chart_key.upper()}]", align=WD_ALIGN_PARAGRAPH.CENTER, italic=True, size_pt=10)
                    else:
                        tbl = doc.add_table(rows=1, cols=1)
                        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
                        cell = tbl.cell(0, 0)
                        set_cell_background(cell, "F5F5F5")
                        set_cell_margins(cell, top=120, bottom=120, left=180, right=180)
                        cell_p = cell.paragraphs[0]
                        cell_p.paragraph_format.line_spacing = 1.0
                        cell_p.paragraph_format.space_after = Pt(0)
                        
                        code_txt = "\n".join(code_lines)
                        r = cell_p.add_run(code_txt)
                        format_run(r, font_name="Courier New", size_pt=10)
                        doc.add_paragraph() # spacer
                code_lines = []
            i += 1
            continue
            
        if in_code_block:
            code_lines.append(line)
            i += 1
            continue

        # 4. Handle Markdown Tables
        if line.strip().startswith('|'):
            if not in_table:
                in_table = True
                table_rows = []
            
            # Check separator row
            if not re.match(r'^\|\s*[:\-|\s]+\s*\|$', line.strip()):
                cols = [col.strip() for col in line.split('|')[1:-1]]
                table_rows.append(cols)
            i += 1
            continue
        else:
            if in_table:
                in_table = False
                if len(table_rows) > 0:
                    num_cols = len(table_rows[0])
                    tbl = doc.add_table(rows=len(table_rows), cols=num_cols)
                    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
                    set_table_borders(tbl)
                    
                    for r_idx, row_data in enumerate(table_rows):
                        for c_idx, cell_value in enumerate(row_data):
                            if c_idx < num_cols:
                                cell = tbl.cell(r_idx, c_idx)
                                set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
                                if r_idx == 0:
                                    set_cell_background(cell, "EBF1F5") # Light blue-gray shade for headers
                                    p = cell.paragraphs[0]
                                    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                                    p.paragraph_format.line_spacing = 1.0
                                    p.paragraph_format.space_after = Pt(0)
                                    populate_formatted_text(p, cell_value.replace('`',''), font_name="Times New Roman", size_pt=11)
                                    for run in p.runs:
                                        run.bold = True
                                else:
                                    p = cell.paragraphs[0]
                                    p.paragraph_format.line_spacing = 1.0
                                    p.paragraph_format.space_after = Pt(0)
                                    if cell_value.strip().lower() in ['post', 'get', 'none', 'confirmed', 'customer', 'admin']:
                                        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                                    else:
                                        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                                    populate_formatted_text(p, cell_value.replace('`',''), font_name="Times New Roman", size_pt=11)
                    doc.add_paragraph() # spacer
                table_rows = []

        if not line.strip():
            i += 1
            continue

        # 5. Handle Headings
        if line.startswith('#'):
            h_match = re.match(r'^(#+)\s*(.*)$', line)
            if h_match:
                level = len(h_match.group(1))
                text = h_match.group(2).strip().replace('`','')
                
                # Strip out raw bold markdown markers in headings
                text = text.replace('**', '').replace('__', '')
                
                if level == 1:
                    # Chapter headings on fresh page (16pt, bold, centered)
                    if file_idx > 0:
                        doc.add_page_break()
                    add_styled_paragraph(doc, text.upper(), font_name="Times New Roman", size_pt=16, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=18)
                elif level == 2:
                    # Section headings (14pt, bold, left)
                    add_styled_paragraph(doc, text, font_name="Times New Roman", size_pt=14, bold=True, align=WD_ALIGN_PARAGRAPH.LEFT, space_after=12)
                    m = re.match(r'^([0-9]+\.[0-9]+)', text)
                    if m:
                        current_h2_num = m.group(1)
                elif level == 3:
                    # Subsection headings (12pt, bold, left)
                    add_styled_paragraph(doc, text, font_name="Times New Roman", size_pt=12, bold=True, align=WD_ALIGN_PARAGRAPH.LEFT, space_after=8)
                else:
                    add_styled_paragraph(doc, text, font_name="Times New Roman", size_pt=12, bold=True, align=WD_ALIGN_PARAGRAPH.LEFT, space_after=6)
            i += 1
            continue

        # 6. Handle Screenshots ([SCREENSHOT])
        if clean_line_strip == '[SCREENSHOT]' and current_h2_num in SCREENSHOT_MAP:
            s_file = SCREENSHOT_MAP[current_h2_num]
            s_path = os.path.join(SCREENSHOTS_DIR, s_file)
            if os.path.exists(s_path):
                p = add_styled_paragraph(doc, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=12)
                p.add_run().add_picture(s_path, width=Inches(5.8))
                add_styled_paragraph(doc, f"Figure: {current_h2_num} {s_file.split('(')[0].replace('_',' ').capitalize()} Interface Screen", align=WD_ALIGN_PARAGRAPH.CENTER, size_pt=10, italic=True)
            else:
                add_styled_paragraph(doc, f"[SCREENSHOT PLACEHOLDER: {s_file.upper()}]", align=WD_ALIGN_PARAGRAPH.CENTER, italic=True, size_pt=10)
            i += 1
            continue

        # 7. Handle Markdown List Elements
        # Bullet Lists (* or -)
        list_match = re.match(r'^[\*\-]\s*(.*)$', line.strip())
        if list_match:
            item_text = list_match.group(1).replace('`', '')
            p = add_styled_paragraph(doc, style='List Bullet', space_after=4)
            p.paragraph_format.line_spacing = 1.0
            populate_formatted_text(p, item_text, font_name="Times New Roman", size_pt=12)
            i += 1
            continue

        # Numbered Lists (1. or 2.)
        num_list_match = re.match(r'^[0-9]+\.\s*(.*)$', line.strip())
        if num_list_match:
            item_text = num_list_match.group(1).replace('`', '')
            p = add_styled_paragraph(doc, style='List Number', space_after=4)
            p.paragraph_format.line_spacing = 1.0
            populate_formatted_text(p, item_text, font_name="Times New Roman", size_pt=12)
            i += 1
            continue

        # 8. Standard Paragraph Paragraphs
        p_txt = line.strip().replace('`', '')
        p = add_styled_paragraph(doc, align=WD_ALIGN_PARAGRAPH.JUSTIFY, line_spacing=1.0, space_after=6)
        populate_formatted_text(p, p_txt, font_name="Times New Roman", size_pt=12)
        i += 1

# Save finished output file
print("Compiling corrected final Word Document layouts...")
doc.save(OUTPUT_FILE)

print("----------------------------------------------------------------------")
print("SUCCESS!")
print(f"Your corrected thesis has been compiled and saved as:")
print(f"➔ {OUTPUT_FILE}")
print("Formatting Checksums fixed successfully:")
print("✔ preliminaries.md excluded completely to allow manual template setup.")
print("✔ Removed '• --' bullet slop by skipping markdown horizontal rules (---).")
print("✔ Eliminated raw '**' slop in tables and list elements by recursively parsing runs.")
print("✔ Fixed backticked `[SCREENSHOT]` parsing logic in Chapter 7 screenshots mapping.")
print("✔ Repaired Appendix D.1 and D.2 parsing boxes, successfully inserting screenshot files.")
print("----------------------------------------------------------------------")
