#!/usr/bin/env python3
"""
Generate 'The Workshop Wall Charts' PDF — a beautiful set of printable
reference sheets for woodworkers. Designed by Floki for Jesper Makes.

Outputs an A4 PDF with multiple pages, each a self-contained wall chart.
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, white, black
from reportlab.pdfgen import canvas
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
import os

# Brand colors
WOOD_DARK = HexColor("#2C1810")
WOOD = HexColor("#3E2723")
WOOD_LIGHT = HexColor("#5D4037")
WOOD_LIGHTER = HexColor("#8D6E63")
AMBER = HexColor("#C17F3C")
CREAM = HexColor("#FAF3E8")
WARM_GRAY = HexColor("#E8E0D4")
LIGHT_LINE = HexColor("#D7CFC3")
WHITE = white

W, H = A4  # 210 x 297 mm

OUTPUT = os.path.join(os.path.dirname(__file__), "..", "website", "public", "downloads", "workshop-wall-charts.pdf")


def draw_page_frame(c, title, subtitle="", page_num=None, total_pages=None):
    """Draw consistent page frame with title bar."""
    # Background
    c.setFillColor(CREAM)
    c.rect(0, 0, W, H, fill=1, stroke=0)

    # Top bar
    c.setFillColor(WOOD_DARK)
    c.rect(0, H - 28 * mm, W, 28 * mm, fill=1, stroke=0)

    # Title
    c.setFillColor(CREAM)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(15 * mm, H - 18 * mm, title.upper())

    # Subtitle
    if subtitle:
        c.setFillColor(AMBER)
        c.setFont("Helvetica", 9)
        c.drawString(15 * mm, H - 24 * mm, subtitle)

    # Brand mark top right
    c.setFillColor(HexColor("#FFFFFF60"))
    c.setFont("Helvetica", 7)
    c.drawRightString(W - 15 * mm, H - 12 * mm, "JESPER MAKES")
    c.drawRightString(W - 15 * mm, H - 18 * mm, "WORKSHOP WALL CHARTS")

    # Footer
    c.setFillColor(WOOD_LIGHTER)
    c.setFont("Helvetica", 6.5)
    c.drawString(15 * mm, 8 * mm, "jespermakes.com  |  Workshop Wall Charts")
    if page_num and total_pages:
        c.drawRightString(W - 15 * mm, 8 * mm, f"{page_num} / {total_pages}")

    # Footer line
    c.setStrokeColor(LIGHT_LINE)
    c.setLineWidth(0.5)
    c.line(15 * mm, 14 * mm, W - 15 * mm, 14 * mm)


def draw_section_header(c, y, text):
    """Draw a section header with amber accent."""
    c.setFillColor(AMBER)
    c.rect(15 * mm, y - 1 * mm, 3 * mm, 5 * mm, fill=1, stroke=0)
    c.setFillColor(WOOD_DARK)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(21 * mm, y, text)
    return y - 8 * mm


def draw_table_header(c, y, cols, col_xs):
    """Draw table column headers."""
    c.setFillColor(WOOD)
    c.setFont("Helvetica-Bold", 7.5)
    for i, col in enumerate(cols):
        c.drawString(col_xs[i], y, col)
    y -= 3 * mm
    c.setStrokeColor(AMBER)
    c.setLineWidth(0.8)
    c.line(col_xs[0], y, W - 15 * mm, y)
    return y - 5 * mm


def draw_table_row(c, y, values, col_xs, bold_first=True):
    """Draw a table row."""
    for i, val in enumerate(values):
        if i == 0 and bold_first:
            c.setFont("Helvetica-Bold", 7.5)
            c.setFillColor(WOOD_DARK)
        else:
            c.setFont("Helvetica", 7.5)
            c.setFillColor(WOOD_LIGHT)
        c.drawString(col_xs[i], y, str(val))
    return y - 5 * mm


def draw_alt_row_bg(c, y, row_idx):
    """Draw alternating row background."""
    if row_idx % 2 == 0:
        c.setFillColor(WARM_GRAY)
        c.rect(14 * mm, y - 1.5 * mm, W - 28 * mm, 5 * mm, fill=1, stroke=0)


# ───────────────────────────────────────────────────────────────
# PAGE 1: WOOD SPECIES REFERENCE
# ───────────────────────────────────────────────────────────────
def page_wood_species(c):
    draw_page_frame(c, "Wood Species Reference", "Hardness, workability, and best uses at a glance", 1, 8)

    # Common hardwoods
    y = H - 38 * mm
    y = draw_section_header(c, y, "COMMON HARDWOODS")
    y -= 2 * mm

    cols = ["SPECIES", "JANKA (lbf)", "HARDNESS", "WORKABILITY", "BEST FOR", "FINISH"]
    xs = [15 * mm, 45 * mm, 67 * mm, 87 * mm, 115 * mm, 160 * mm]
    y = draw_table_header(c, y, cols, xs)

    hardwoods = [
        ("Oak (White)", "1,360", "Hard", "Good", "Furniture, flooring", "Oil, poly"),
        ("Oak (Red)", "1,290", "Hard", "Good", "Cabinets, trim", "Stain + poly"),
        ("Walnut", "1,010", "Medium", "Excellent", "Furniture, accents", "Oil, wax"),
        ("Maple (Hard)", "1,450", "Very hard", "Moderate", "Cutting boards, floors", "Poly, oil"),
        ("Cherry", "950", "Medium", "Excellent", "Furniture, boxes", "Oil (darkens)"),
        ("Ash", "1,320", "Hard", "Good", "Tool handles, furniture", "Oil, poly"),
        ("Beech", "1,300", "Hard", "Good", "Workbenches, tools", "Oil, wax"),
        ("Birch", "1,260", "Hard", "Good", "Plywood, cabinets", "Poly, paint"),
        ("Alder", "590", "Soft", "Excellent", "Cabinets, carving", "Stain, paint"),
        ("Poplar", "540", "Soft", "Excellent", "Paint-grade, practice", "Paint"),
        ("Mahogany", "800", "Medium", "Excellent", "Furniture, boats", "Oil, varnish"),
        ("Teak", "1,070", "Hard", "Moderate", "Outdoor, marine", "Oil or bare"),
    ]

    for i, row in enumerate(hardwoods):
        draw_alt_row_bg(c, y, i)
        y = draw_table_row(c, y, row, xs)

    # Softwoods
    y -= 6 * mm
    y = draw_section_header(c, y, "COMMON SOFTWOODS")
    y -= 2 * mm
    y = draw_table_header(c, y, cols, xs)

    softwoods = [
        ("Pine (Yellow)", "870", "Medium", "Good", "Construction, furniture", "Poly, paint"),
        ("Pine (White)", "380", "Soft", "Excellent", "Shelves, trim, boxes", "Paint, stain"),
        ("Spruce", "510", "Soft", "Good", "Framing, instruments", "Paint, poly"),
        ("Cedar (Red)", "350", "Soft", "Excellent", "Outdoor, closets", "Oil or bare"),
        ("Douglas Fir", "660", "Medium", "Good", "Structural, flooring", "Poly, oil"),
        ("Larch", "830", "Medium", "Moderate", "Outdoor, cladding", "Oil or bare"),
    ]

    for i, row in enumerate(softwoods):
        draw_alt_row_bg(c, y, i)
        y = draw_table_row(c, y, row, xs)

    # Reclaimed/pallet
    y -= 6 * mm
    y = draw_section_header(c, y, "PALLET WOOD CHEAT SHEET")
    y -= 2 * mm

    c.setFont("Helvetica", 7.5)
    c.setFillColor(WOOD_LIGHT)
    tips = [
        "HT stamp = Heat Treated (safe to use).  MB stamp = Methyl Bromide (avoid!).",
        "Most EU pallets are pine or spruce. US pallets are often oak or poplar.",
        "Standard EUR pallet: 1200 x 800 mm.  US standard: 48 x 40 in (1219 x 1016 mm).",
        "Top deck boards are typically 100mm or 145mm wide, 22mm thick.",
        "Let pallet wood acclimate indoors 1-2 weeks before use.",
        "Always check for hidden nails with a metal detector or magnet.",
        "Sand to 120-grit minimum. Pallet pine takes stain unevenly — test first.",
    ]
    for tip in tips:
        c.drawString(15 * mm, y, f"   {tip}")
        y -= 4.5 * mm


# ───────────────────────────────────────────────────────────────
# PAGE 2: SANDPAPER & FINISHING
# ───────────────────────────────────────────────────────────────
def page_sandpaper_finishing(c):
    draw_page_frame(c, "Sandpaper & Finishing Guide", "Grit sequences, finish types, and when to use what", 2, 8)

    y = H - 38 * mm
    y = draw_section_header(c, y, "SANDPAPER GRIT REFERENCE")
    y -= 2 * mm

    cols = ["GRIT", "TYPE", "USE FOR", "NOTES"]
    xs = [15 * mm, 35 * mm, 75 * mm, 135 * mm]
    y = draw_table_header(c, y, cols, xs)

    grits = [
        ("40-60", "Extra Coarse", "Heavy stock removal, paint stripping", "Orbital sander only"),
        ("80", "Coarse", "Initial shaping, rough surfaces", "Start here for rough lumber"),
        ("100", "Medium-Coarse", "General sanding after planing", "Good starting grit for planed wood"),
        ("120", "Medium", "Standard prep before finishing", "Most common starting grit"),
        ("150", "Medium-Fine", "Final sand before stain/oil", "Good for softwoods"),
        ("180", "Fine", "Between coats, final prep", "Standard for hardwoods"),
        ("220", "Very Fine", "Between finish coats", "Last grit before most finishes"),
        ("320", "Extra Fine", "Between poly/varnish coats", "Wet sand lacquer/poly"),
        ("400+", "Ultra Fine", "Final buffing, polishing", "Wet sanding, automotive"),
    ]

    for i, row in enumerate(grits):
        draw_alt_row_bg(c, y, i)
        y = draw_table_row(c, y, row, xs)

    # Sanding sequences
    y -= 8 * mm
    y = draw_section_header(c, y, "RECOMMENDED SANDING SEQUENCES")
    y -= 2 * mm

    sequences = [
        ("Paint grade:", "80 > 120 > 150 (done)"),
        ("Oil finish:", "120 > 150 > 180 > 220"),
        ("Polyurethane:", "120 > 150 > 180 > 220 (sand 320 between coats)"),
        ("Hardwax oil:", "120 > 150 > 180 (apply on 180-sanded surface)"),
        ("Pallet wood:", "80 > 120 > 150 (stain test a sample first)"),
        ("Tabletops:", "120 > 150 > 180 > 220 > 320 (for glass-smooth)"),
    ]

    c.setFont("Helvetica", 7.5)
    for seq in sequences:
        c.setFillColor(WOOD_DARK)
        c.setFont("Helvetica-Bold", 7.5)
        c.drawString(15 * mm, y, seq[0])
        c.setFillColor(WOOD_LIGHT)
        c.setFont("Helvetica", 7.5)
        c.drawString(48 * mm, y, seq[1])
        y -= 5 * mm

    # Finish comparison
    y -= 6 * mm
    y = draw_section_header(c, y, "FINISH COMPARISON")
    y -= 2 * mm

    cols = ["FINISH", "PROTECTION", "LOOK", "DRY TIME", "FOOD SAFE", "EASE"]
    xs = [15 * mm, 52 * mm, 78 * mm, 115 * mm, 140 * mm, 165 * mm]
    y = draw_table_header(c, y, cols, xs)

    finishes = [
        ("Danish Oil", "Low-Med", "Natural, warm", "4-6 hrs", "When cured", "Easy"),
        ("Tung Oil (pure)", "Medium", "Natural, matte", "24-48 hrs", "Yes", "Easy"),
        ("Boiled Linseed Oil", "Low", "Warm, amber", "24 hrs", "When cured", "Easy"),
        ("Hardwax Oil", "Med-High", "Natural satin", "4-6 hrs", "Yes (most)", "Easy"),
        ("Rubio Monocoat", "Med-High", "Natural matte", "24-36 hrs", "Yes", "Easy"),
        ("Polyurethane (oil)", "High", "Glossy/satin", "6-8 hrs", "When cured", "Moderate"),
        ("Polyurethane (water)", "High", "Clear, less amber", "2-4 hrs", "When cured", "Moderate"),
        ("Lacquer (spray)", "High", "Gloss/satin", "30 min", "When cured", "Moderate"),
        ("Shellac", "Low-Med", "Warm, amber", "30 min", "Yes", "Easy"),
        ("Epoxy", "Very High", "Glass-like", "24 hrs", "When cured", "Hard"),
        ("Exterior Oil", "Medium", "Natural", "12-24 hrs", "N/A", "Easy"),
        ("Spar Varnish", "Very High", "Glossy, UV resist", "6-8 hrs", "When cured", "Moderate"),
    ]

    for i, row in enumerate(finishes):
        draw_alt_row_bg(c, y, i)
        y = draw_table_row(c, y, row, xs)


# ───────────────────────────────────────────────────────────────
# PAGE 3: JOINERY REFERENCE
# ───────────────────────────────────────────────────────────────
def page_joinery(c):
    draw_page_frame(c, "Joinery Quick Reference", "Common joints, strength ratings, and when to use each", 3, 8)

    y = H - 38 * mm
    y = draw_section_header(c, y, "JOINT TYPES")
    y -= 2 * mm

    cols = ["JOINT", "STRENGTH", "DIFFICULTY", "TOOLS NEEDED", "BEST FOR"]
    xs = [15 * mm, 55 * mm, 80 * mm, 105 * mm, 150 * mm]
    y = draw_table_header(c, y, cols, xs)

    joints = [
        ("Butt joint", "Low", "Beginner", "Saw, drill", "Basic boxes, frames"),
        ("Pocket hole", "Medium", "Beginner", "Pocket jig, drill", "Face frames, quick builds"),
        ("Dowel joint", "Med-High", "Beginner", "Dowel jig, drill", "Panels, frames, furniture"),
        ("Biscuit joint", "Medium", "Intermediate", "Biscuit jointer", "Panel glue-ups, alignment"),
        ("Domino (Festool)", "High", "Beginner*", "Domino jointer", "Everything (* tool does work)"),
        ("Half-lap", "Medium", "Beginner", "Saw, chisel", "Frames, crosses, grids"),
        ("Rabbet / Rebate", "Medium", "Beginner", "Router or table saw", "Boxes, cabinet backs"),
        ("Dado / Housing", "Medium", "Beginner", "Router or table saw", "Shelves, dividers"),
        ("Tongue & groove", "Med-High", "Intermediate", "Router or table saw", "Panels, flooring, cladding"),
        ("Box joint (finger)", "High", "Intermediate", "Table saw + jig", "Boxes, drawers"),
        ("Dovetail (through)", "Very High", "Advanced", "Saw, chisel, marking", "Drawers, fine boxes"),
        ("Dovetail (half-blind)", "Very High", "Advanced", "Saw, chisel, router", "Drawer fronts"),
        ("Mortise & tenon", "Very High", "Intermediate", "Chisel, drill, saw", "Tables, chairs, doors"),
        ("Bridle joint", "High", "Intermediate", "Saw, chisel", "Frames, table legs"),
        ("Mitre joint", "Low", "Beginner", "Mitre saw/box", "Picture frames, trim"),
        ("Mitre + spline", "Med-High", "Intermediate", "Table saw, jig", "Boxes, frames (decorative)"),
        ("Scarf joint", "Medium", "Intermediate", "Saw, plane", "Lengthening boards"),
    ]

    for i, row in enumerate(joints):
        draw_alt_row_bg(c, y, i)
        y = draw_table_row(c, y, row, xs)

    # Glue reference
    y -= 8 * mm
    y = draw_section_header(c, y, "WOOD GLUE REFERENCE")
    y -= 2 * mm

    cols = ["TYPE", "OPEN TIME", "CLAMP TIME", "FULL CURE", "WATERPROOF", "BEST FOR"]
    xs = [15 * mm, 48 * mm, 70 * mm, 93 * mm, 118 * mm, 148 * mm]
    y = draw_table_header(c, y, cols, xs)

    glues = [
        ("PVA (yellow)", "5-10 min", "30-60 min", "24 hrs", "No (Type I)", "Indoor furniture"),
        ("PVA (Titebond III)", "8-10 min", "30-60 min", "24 hrs", "Yes (Type I)", "Cutting boards, outdoor"),
        ("Polyurethane", "15-20 min", "1-4 hrs", "24 hrs", "Yes", "Mixed materials, gaps"),
        ("Epoxy (5-min)", "3-5 min", "10-15 min", "24 hrs", "Yes", "Quick repairs, fills"),
        ("Epoxy (slow)", "30-45 min", "6-8 hrs", "72 hrs", "Yes", "River tables, casting"),
        ("CA Glue (super)", "5-15 sec", "Instant", "Instant", "Fair", "Quick fixes, turning"),
        ("Hide glue", "2-5 min", "2-4 hrs", "24 hrs", "No", "Instrument making, reversible"),
    ]

    for i, row in enumerate(glues):
        draw_alt_row_bg(c, y, i)
        y = draw_table_row(c, y, row, xs)


# ───────────────────────────────────────────────────────────────
# PAGE 4: SCREWS, NAILS & FASTENERS
# ───────────────────────────────────────────────────────────────
def page_fasteners(c):
    draw_page_frame(c, "Screws, Nails & Fasteners", "Sizes, pilot holes, and what to use where", 4, 8)

    y = H - 38 * mm
    y = draw_section_header(c, y, "WOOD SCREW PILOT HOLE SIZES")
    y -= 2 * mm

    cols = ["SCREW #", "SCREW DIA", "SOFTWOOD PILOT", "HARDWOOD PILOT", "CLEARANCE HOLE", "COMMON USE"]
    xs = [15 * mm, 38 * mm, 60 * mm, 85 * mm, 115 * mm, 148 * mm]
    y = draw_table_header(c, y, cols, xs)

    screws = [
        ("#4", "2.8 mm", "1.8 mm", "2.2 mm", "3.0 mm", "Hinges, small hardware"),
        ("#6", "3.5 mm", "2.3 mm", "2.8 mm", "3.6 mm", "General light work"),
        ("#8", "4.2 mm", "2.8 mm", "3.3 mm", "4.4 mm", "Most furniture, cabinets"),
        ("#10", "4.8 mm", "3.2 mm", "3.8 mm", "5.0 mm", "Heavy furniture, shelving"),
        ("#12", "5.5 mm", "3.6 mm", "4.2 mm", "5.6 mm", "Structural, heavy-duty"),
        ("#14", "6.4 mm", "4.0 mm", "4.8 mm", "6.5 mm", "Lag-type applications"),
        ("3.0mm", "3.0 mm", "2.0 mm", "2.5 mm", "3.2 mm", "Euro-style, light"),
        ("3.5mm", "3.5 mm", "2.3 mm", "2.8 mm", "3.6 mm", "Euro-style, general"),
        ("4.0mm", "4.0 mm", "2.5 mm", "3.0 mm", "4.2 mm", "Euro-style, furniture"),
        ("4.5mm", "4.5 mm", "3.0 mm", "3.5 mm", "4.8 mm", "Euro-style, heavy"),
        ("5.0mm", "5.0 mm", "3.3 mm", "3.8 mm", "5.2 mm", "Euro-style, structural"),
        ("6.0mm", "6.0 mm", "4.0 mm", "4.5 mm", "6.5 mm", "Euro-style, heavy-duty"),
    ]

    for i, row in enumerate(screws):
        draw_alt_row_bg(c, y, i)
        y = draw_table_row(c, y, row, xs)

    # Screw length guide
    y -= 8 * mm
    y = draw_section_header(c, y, "SCREW LENGTH RULE OF THUMB")
    y -= 2 * mm

    c.setFont("Helvetica", 7.5)
    c.setFillColor(WOOD_LIGHT)
    rules = [
        "The screw should penetrate the receiving piece by at least 2/3 of the screw length.",
        "For softwood: screw length = top piece thickness + 1.5x top piece thickness into bottom piece.",
        "For hardwood: screw length = top piece thickness + 1x top piece thickness into bottom piece.",
        "Always drill a pilot hole in hardwood. In softwood, pilot holes prevent splitting near edges.",
        "Countersink depth: flush = 0mm, plugged = 6-10mm deep with matching plug.",
    ]
    for r in rules:
        c.drawString(15 * mm, y, f"   {r}")
        y -= 4.5 * mm

    # Nail sizes
    y -= 6 * mm
    y = draw_section_header(c, y, "COMMON NAIL & BRAD SIZES")
    y -= 2 * mm

    cols = ["TYPE", "GAUGE", "LENGTH", "USE"]
    xs = [15 * mm, 55 * mm, 80 * mm, 115 * mm]
    y = draw_table_header(c, y, cols, xs)

    nails = [
        ("Pin nails", "23 ga", "12-35 mm", "Trim, moulding (nearly invisible)"),
        ("Brad nails", "18 ga", "15-50 mm", "Trim, thin stock, assembly"),
        ("Finish nails", "15-16 ga", "25-65 mm", "Casing, baseboards, furniture"),
        ("Framing nails", "11-12 ga", "60-90 mm", "Structural, framing"),
    ]

    for i, row in enumerate(nails):
        draw_alt_row_bg(c, y, i)
        y = draw_table_row(c, y, row, xs)


# ───────────────────────────────────────────────────────────────
# PAGE 5: DRILL BIT REFERENCE
# ───────────────────────────────────────────────────────────────
def page_drill_bits(c):
    draw_page_frame(c, "Drill Bit Reference", "Types, sizes, and speed settings", 5, 8)

    y = H - 38 * mm
    y = draw_section_header(c, y, "DRILL BIT TYPES")
    y -= 2 * mm

    cols = ["BIT TYPE", "SIZES", "BEST FOR", "SPEED", "NOTES"]
    xs = [15 * mm, 52 * mm, 80 * mm, 128 * mm, 153 * mm]
    y = draw_table_header(c, y, cols, xs)

    bits = [
        ("Brad point", "1-16 mm", "Clean holes in wood", "Med-High", "Best all-around wood bit"),
        ("Twist (HSS)", "0.5-13 mm", "Metal, plastic, wood", "Varies", "Universal but tears wood grain"),
        ("Forstner", "10-50 mm", "Flat-bottom holes", "Low-Med", "Use drill press if possible"),
        ("Spade/paddle", "6-38 mm", "Rough holes, fast", "High", "Not for precision work"),
        ("Auger", "6-25 mm", "Deep, clean holes", "Low", "Self-feeding, great for thick stock"),
        ("Hole saw", "19-152 mm", "Large circles", "Low", "Use pilot bit, clear chips often"),
        ("Step drill", "4-32 mm", "Sheet metal, thin stock", "Med", "Not for thick wood"),
        ("Countersink", "Various", "Screw head recesses", "Med-High", "Adjustable ones are best"),
        ("Plug cutter", "6-16 mm", "Wood plugs for screw holes", "Med", "Match wood species for invisible"),
    ]

    for i, row in enumerate(bits):
        draw_alt_row_bg(c, y, i)
        y = draw_table_row(c, y, row, xs)

    # Drilling speeds
    y -= 8 * mm
    y = draw_section_header(c, y, "RECOMMENDED DRILLING SPEEDS (RPM)")
    y -= 2 * mm

    cols = ["HOLE SIZE", "SOFTWOOD", "HARDWOOD", "METAL", "PLASTIC"]
    xs = [15 * mm, 52 * mm, 85 * mm, 118 * mm, 152 * mm]
    y = draw_table_header(c, y, cols, xs)

    speeds = [
        ("1-3 mm", "3,000+", "3,000+", "2,500", "1,500"),
        ("4-6 mm", "2,500", "2,000", "1,500", "1,000"),
        ("7-10 mm", "2,000", "1,500", "1,000", "800"),
        ("11-16 mm", "1,500", "1,000", "500", "500"),
        ("17-25 mm", "1,000", "750", "300", "400"),
        ("26-38 mm", "750", "500", "N/A", "300"),
        ("39-50 mm", "500", "350", "N/A", "250"),
    ]

    for i, row in enumerate(speeds):
        draw_alt_row_bg(c, y, i)
        y = draw_table_row(c, y, row, xs)

    # Router bit basics
    y -= 8 * mm
    y = draw_section_header(c, y, "ROUTER BIT ESSENTIALS")
    y -= 2 * mm

    cols = ["BIT TYPE", "SHANK", "USE", "FEED DIRECTION"]
    xs = [15 * mm, 55 * mm, 75 * mm, 140 * mm]
    y = draw_table_header(c, y, cols, xs)

    router = [
        ("Straight", "6/8/12 mm", "Dados, grooves, rabbets", "Left to right (against rotation)"),
        ("Flush trim", "6/8 mm", "Template routing, edge trimming", "Template guides the cut"),
        ("Roundover", "6/8 mm", "Rounding edges", "Left to right, light passes"),
        ("Chamfer (45 deg)", "6/8 mm", "Beveled edges", "Left to right"),
        ("Cove", "8 mm", "Decorative concave edge", "Left to right"),
        ("Rabbeting", "8/12 mm", "Rabbets with bearing guide", "Left to right"),
        ("Dovetail", "8 mm", "Dovetail joints with jig", "Follow jig pattern"),
        ("Slot cutter", "8 mm", "Biscuit slots, T-molding", "Left to right"),
    ]

    for i, row in enumerate(router):
        draw_alt_row_bg(c, y, i)
        y = draw_table_row(c, y, row, xs)


# ───────────────────────────────────────────────────────────────
# PAGE 6: METRIC / IMPERIAL CONVERSION
# ───────────────────────────────────────────────────────────────
def page_conversions(c):
    draw_page_frame(c, "Metric / Imperial Conversions", "The chart you wish you had printed years ago", 6, 8)

    y = H - 38 * mm
    y = draw_section_header(c, y, "COMMON LUMBER DIMENSIONS")
    y -= 2 * mm

    cols = ["IMPERIAL (NOMINAL)", "IMPERIAL (ACTUAL)", "METRIC (ACTUAL)", "COMMON NAME"]
    xs = [15 * mm, 55 * mm, 95 * mm, 140 * mm]
    y = draw_table_header(c, y, cols, xs)

    lumber = [
        ('1 x 2"', '3/4 x 1-1/2"', "19 x 38 mm", "Furring strip"),
        ('1 x 3"', '3/4 x 2-1/2"', "19 x 64 mm", "Small trim"),
        ('1 x 4"', '3/4 x 3-1/2"', "19 x 89 mm", "Trim, shelving"),
        ('1 x 6"', '3/4 x 5-1/2"', "19 x 140 mm", "Shelving, fencing"),
        ('1 x 8"', '3/4 x 7-1/4"', "19 x 184 mm", "Shelving, panels"),
        ('1 x 10"', '3/4 x 9-1/4"', "19 x 235 mm", "Wide shelving"),
        ('1 x 12"', '3/4 x 11-1/4"', "19 x 286 mm", "Wide panels"),
        ('2 x 4"', '1-1/2 x 3-1/2"', "38 x 89 mm", "Stud, framing"),
        ('2 x 6"', '1-1/2 x 5-1/2"', "38 x 140 mm", "Floor joists"),
        ('2 x 8"', '1-1/2 x 7-1/4"', "38 x 184 mm", "Headers, joists"),
        ('2 x 10"', '1-1/2 x 9-1/4"', "38 x 235 mm", "Beams, headers"),
        ('2 x 12"', '1-1/2 x 11-1/4"', "38 x 286 mm", "Large beams"),
        ('4 x 4"', '3-1/2 x 3-1/2"', "89 x 89 mm", "Posts"),
    ]

    for i, row in enumerate(lumber):
        draw_alt_row_bg(c, y, i)
        y = draw_table_row(c, y, row, xs)

    # Length conversions
    y -= 8 * mm
    y = draw_section_header(c, y, "LENGTH CONVERSIONS")
    y -= 2 * mm

    cols = ["INCHES", "MM", "CM", "", "INCHES", "MM", "CM"]
    xs = [15 * mm, 35 * mm, 55 * mm, 75 * mm, 85 * mm, 105 * mm, 125 * mm]
    y = draw_table_header(c, y, cols, xs)

    # Two columns of conversions side by side
    left = [
        ("1/16", "1.6", "0.16"),
        ("1/8", "3.2", "0.32"),
        ("3/16", "4.8", "0.48"),
        ("1/4", "6.4", "0.64"),
        ("5/16", "7.9", "0.79"),
        ("3/8", "9.5", "0.95"),
        ("7/16", "11.1", "1.11"),
        ("1/2", "12.7", "1.27"),
        ("9/16", "14.3", "1.43"),
        ("5/8", "15.9", "1.59"),
        ("11/16", "17.5", "1.75"),
        ("3/4", "19.1", "1.91"),
    ]

    right = [
        ("13/16", "20.6", "2.06"),
        ("7/8", "22.2", "2.22"),
        ("15/16", "23.8", "2.38"),
        ("1", "25.4", "2.54"),
        ("2", "50.8", "5.08"),
        ("3", "76.2", "7.62"),
        ("4", "101.6", "10.16"),
        ("6", "152.4", "15.24"),
        ("8", "203.2", "20.32"),
        ("10", "254.0", "25.40"),
        ("12", "304.8", "30.48"),
        ("36 (1 yd)", "914.4", "91.44"),
    ]

    for i, (l, r) in enumerate(zip(left, right)):
        draw_alt_row_bg(c, y, i)
        y_row = draw_table_row(c, y, list(l) + [""] + list(r), xs, bold_first=True)
        y = y_row


# ───────────────────────────────────────────────────────────────
# PAGE 7: COMMON ANGLES, GEOMETRY & LAYOUT
# ───────────────────────────────────────────────────────────────
def page_angles_geometry(c):
    draw_page_frame(c, "Angles, Geometry & Layout", "The math you keep Googling, all in one place", 7, 8)

    y = H - 38 * mm
    y = draw_section_header(c, y, "COMMON ANGLES FOR WOODWORKING")
    y -= 2 * mm

    cols = ["ANGLE", "MITRE SAW SETTING", "USE CASE"]
    xs = [15 * mm, 55 * mm, 105 * mm]
    y = draw_table_header(c, y, cols, xs)

    angles = [
        ("90 deg (square)", "0 deg (straight cut)", "All standard crosscuts"),
        ("45 deg", "45 deg", "Picture frames, box mitres, trim corners"),
        ("22.5 deg", "22.5 deg", "Octagonal builds (8-sided)"),
        ("30 deg", "30 deg", "Hexagonal builds (6-sided), some trim"),
        ("60 deg", "60 deg (or 30 from other side)", "Triangular builds, some decorative"),
        ("15 deg", "15 deg", "12-sided builds, subtle tapers"),
        ("10 deg", "10 deg", "Seat back angles, gentle tapers"),
        ("5 deg", "5 deg", "Subtle splay for legs, back rests"),
    ]

    for i, row in enumerate(angles):
        draw_alt_row_bg(c, y, i)
        y = draw_table_row(c, y, row, xs)

    # Polygon angles
    y -= 8 * mm
    y = draw_section_header(c, y, "MITRE ANGLES FOR REGULAR POLYGONS")
    y -= 2 * mm

    c.setFont("Helvetica", 7.5)
    c.setFillColor(WOOD_DARK)
    c.drawString(15 * mm, y, "Formula: Mitre angle = 180 / number of sides")
    y -= 7 * mm

    cols = ["SIDES", "SHAPE", "MITRE ANGLE", "INTERIOR ANGLE"]
    xs = [15 * mm, 40 * mm, 80 * mm, 120 * mm]
    y = draw_table_header(c, y, cols, xs)

    polys = [
        ("3", "Triangle", "60.0 deg", "60 deg"),
        ("4", "Square", "45.0 deg", "90 deg"),
        ("5", "Pentagon", "36.0 deg", "108 deg"),
        ("6", "Hexagon", "30.0 deg", "120 deg"),
        ("8", "Octagon", "22.5 deg", "135 deg"),
        ("10", "Decagon", "18.0 deg", "144 deg"),
        ("12", "Dodecagon", "15.0 deg", "150 deg"),
    ]

    for i, row in enumerate(polys):
        draw_alt_row_bg(c, y, i)
        y = draw_table_row(c, y, row, xs)

    # Useful formulas
    y -= 8 * mm
    y = draw_section_header(c, y, "FORMULAS YOU ACTUALLY NEED")
    y -= 2 * mm

    c.setFont("Helvetica", 7.5)
    c.setFillColor(WOOD_LIGHT)
    formulas = [
        "Circle circumference = diameter x 3.14159 (pi)",
        "Circle area = pi x radius x radius",
        "Board feet = (thickness x width x length) / 144  (all in inches)",
        "Diagonal of a rectangle = sqrt(width^2 + height^2)  (Pythagorean theorem)",
        "3-4-5 rule: A triangle with sides 3, 4, 5 (or any multiple) is always a right angle.",
        "    Use this to check if your project is square! Measure 300mm, 400mm, diagonal should be 500mm.",
        "Taper per side = (wide end - narrow end) / (2 x length)  (for equal tapers)",
        "Wood expansion (rough): 1% across the grain per 4% moisture change. Plan for seasonal movement!",
    ]
    for f in formulas:
        c.drawString(15 * mm, y, f"   {f}")
        y -= 4.5 * mm


# ───────────────────────────────────────────────────────────────
# PAGE 8: SAFETY & WORKSHOP SETUP
# ───────────────────────────────────────────────────────────────
def page_safety_setup(c):
    draw_page_frame(c, "Safety & Workshop Essentials", "The stuff that keeps you making for years to come", 8, 8)

    y = H - 38 * mm
    y = draw_section_header(c, y, "PERSONAL PROTECTIVE EQUIPMENT")
    y -= 2 * mm

    cols = ["TASK", "EYES", "EARS", "LUNGS", "HANDS"]
    xs = [15 * mm, 55 * mm, 80 * mm, 105 * mm, 145 * mm]
    y = draw_table_header(c, y, cols, xs)

    ppe = [
        ("Hand sawing", "Safety glasses", "-", "-", "Optional gloves"),
        ("Power sawing", "Safety glasses", "Muffs/plugs", "Dust mask", "NEVER gloves"),
        ("Routing", "Safety glasses", "Muffs/plugs", "Dust mask", "NEVER gloves"),
        ("Sanding (power)", "Safety glasses", "Optional", "Dust mask/P2", "-"),
        ("Sanding (hand)", "-", "-", "Optional", "-"),
        ("Finishing (oil/wax)", "-", "-", "Ventilate", "Gloves (nitrile)"),
        ("Finishing (spray)", "Safety glasses", "-", "Respirator", "Gloves (nitrile)"),
        ("Epoxy work", "Safety glasses", "-", "Respirator", "Gloves (nitrile)"),
        ("Drilling", "Safety glasses", "-", "-", "NEVER gloves"),
        ("Turning (lathe)", "Full face shield", "Muffs/plugs", "Dust mask", "NEVER gloves"),
        ("Welding", "Welding helmet", "Plugs", "Fume resp.", "Welding gloves"),
    ]

    for i, row in enumerate(ppe):
        draw_alt_row_bg(c, y, i)
        y = draw_table_row(c, y, row, xs)

    # Key safety rules
    y -= 8 * mm
    y = draw_section_header(c, y, "RULES THAT SAVE FINGERS")
    y -= 2 * mm

    c.setFont("Helvetica-Bold", 7.5)
    c.setFillColor(WOOD_DARK)
    rules = [
        "1. Never wear gloves near spinning tools (table saw, router, lathe, drill press).",
        "2. Tie back long hair and remove loose clothing, jewelry, and lanyards.",
        "3. Wait for the blade to stop completely before reaching near it.",
        "4. Never remove safety guards unless you understand the alternative setup.",
        "5. Use push sticks. Always. Your fingers don't grow back.",
        "6. If a cut feels sketchy, it IS sketchy. Stop. Find a safer method.",
        "7. Keep your workspace clean. Offcuts on the floor cause falls.",
        "8. Never work when tired, rushed, or distracted. Most accidents happen then.",
        "9. Always unplug tools before changing blades or bits.",
        "10. Dust is the invisible danger. Use extraction. Wear a mask. Your lungs matter.",
    ]

    for r in rules:
        c.setFont("Helvetica", 7.5)
        c.setFillColor(WOOD_DARK)
        c.drawString(15 * mm, y, f"   {r}")
        y -= 5 * mm

    # Dust collection basics
    y -= 4 * mm
    y = draw_section_header(c, y, "DUST COLLECTION BASICS")
    y -= 2 * mm

    c.setFont("Helvetica", 7.5)
    c.setFillColor(WOOD_LIGHT)
    dust = [
        "Table saw, planer, jointer: Need dust collection (4 inch / 100mm hose minimum).",
        "Router table: Dust collection recommended (2.5 inch / 63mm or larger).",
        "Mitre saw: Dust bag or collection. Most built-in bags are terrible. Upgrade.",
        "Random orbit sander: Connect to shop vac. Keeps sandpaper lasting 3x longer.",
        "General air: Consider an ambient air filtration unit. Fine dust hangs for hours.",
        "Emptying: Wear a dust mask when emptying collectors. That's the most dangerous moment.",
    ]

    for d in dust:
        c.drawString(15 * mm, y, f"   {d}")
        y -= 4.5 * mm


# ───────────────────────────────────────────────────────────────
# BUILD THE PDF
# ───────────────────────────────────────────────────────────────
def main():
    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)

    c = canvas.Canvas(OUTPUT, pagesize=A4)
    c.setTitle("Workshop Wall Charts — Jesper Makes")
    c.setAuthor("Jesper Makes")
    c.setSubject("Printable woodworking reference charts for your workshop wall")

    pages = [
        page_wood_species,
        page_sandpaper_finishing,
        page_joinery,
        page_fasteners,
        page_drill_bits,
        page_conversions,
        page_angles_geometry,
        page_safety_setup,
    ]

    for i, page_fn in enumerate(pages):
        page_fn(c)
        if i < len(pages) - 1:
            c.showPage()

    c.save()
    size_kb = os.path.getsize(OUTPUT) / 1024
    print(f"Generated: {OUTPUT}")
    print(f"Size: {size_kb:.0f} KB")
    print(f"Pages: {len(pages)}")


if __name__ == "__main__":
    main()
