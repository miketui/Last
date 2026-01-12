#!/usr/bin/env python3
"""
Build LaTeX files from XHTML sources for 'Curls & Contemplation'
Converts each XHTML to individual .tex files and creates a master document.
"""

import os
import re
import subprocess
import shutil
from pathlib import Path
from lxml import etree

# Directory setup
BASE_DIR = Path(__file__).parent.parent
XHTML_DIR = BASE_DIR / "pub" / "OEBPS" / "xhtml"
IMAGES_DIR = BASE_DIR / "pub" / "OEBPS" / "images"
FONTS_DIR = BASE_DIR / "pub" / "OEBPS" / "fonts"
PDF_DIR = BASE_DIR / "pdf"
LATEX_DIR = PDF_DIR / "latex"
LATEX_IMAGES_DIR = LATEX_DIR / "images"
LATEX_FONTS_DIR = LATEX_DIR / "fonts"

# Ordered list of XHTML files based on content.opf spine
SPINE_ORDER = [
    "1-TitlePage.xhtml",
    "2-Copyright.xhtml",
    "3-TableOfContents.xhtml",
    "4-Dedication.xhtml",
    "5-SelfAssessment.xhtml",
    "6-AffirmationOdyssey.xhtml",
    "7-Preface.xhtml",
    "7a-preface-quote.xhtml",
    "8-Part-I-Foundations-of-Creative-Hairstyling.xhtml",
    "9-chapter-i-unveiling-your-creative-odyssey.xhtml",
    "10-chapter-ii-refining-your-creative-toolkit.xhtml",
    "11-chapter-iii-reigniting-your-creative-fire.xhtml",
    "12-Part-II-Building-Your-Professional-Practice.xhtml",
    "13-chapter-iv-the-art-of-networking-in-freelance-hairstyling.xhtml",
    "14-chapter-v-cultivating-creative-excellence-through-mentorship.xhtml",
    "15-chapter-vi-mastering-the-business-of-hairstyling.xhtml",
    "16-chapter-vii-embracing-wellness-and-self-care.xhtml",
    "17-chapter-viii-advancing-skills-through-continuous-education.xhtml",
    "18-Part-III-Advanced-Business-Strategies.xhtml",
    "19-chapter-ix-stepping-into-leadership.xhtml",
    "20-chapter-x-crafting-enduring-legacies.xhtml",
    "21-chapter-xi-advanced-digital-strategies-for-freelance-hairstylists.xhtml",
    "22-chapter-xii-financial-wisdom-building-sustainable-ventures.xhtml",
    "23-chapter-xiii-embracing-ethics-and-sustainability-in-hairstyling.xhtml",
    "24-Part-IV-Future-Focused-Growth.xhtml",
    "25-chapter-xiv-the-impact-of-ai-on-the-beauty-industry.xhtml",
    "26-chapter-xv-cultivating-resilience-and-well-being-in-hairstyling.xhtml",
    "27-chapter-xvi-tresses-and-textures-embracing-diversity-in-hairstyling.xhtml",
    "28-Conclusion.xhtml",
    "28a-conclusion-quote.xhtml",
    "29-QuizKey.xhtml",
    "30-SelfAssessment.xhtml",
    "31-affirmations-close.xhtml",
    "32-continued-learning-commitment.xhtml",
    "33-Acknowledgments.xhtml",
    "34-AbouttheAuthor.xhtml",
    "35-CurlsContempCollective.xhtml",
    "36-JournalingStart.xhtml",
    "37-ManifestingJournal.xhtml",
    "38-journal-page.xhtml",
    "39-professional-development.xhtml",
    "40-SMARTGoals.xhtml",
    "41-self-care-journal.xhtml",
    "42-VisionJournal.xhtml",
    "43-DoodlePage.xhtml",
    "44-bibliography.xhtml",
]


def setup_directories():
    """Create necessary directories."""
    LATEX_DIR.mkdir(parents=True, exist_ok=True)
    LATEX_IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    LATEX_FONTS_DIR.mkdir(parents=True, exist_ok=True)


def copy_assets():
    """Copy images and fonts to latex directory."""
    print("Copying images...")
    for img in IMAGES_DIR.glob("*"):
        if img.is_file():
            shutil.copy2(img, LATEX_IMAGES_DIR / img.name)

    print("Copying fonts...")
    for font in FONTS_DIR.glob("*"):
        if font.is_file():
            shutil.copy2(font, LATEX_FONTS_DIR / font.name)


def convert_xhtml_to_latex(xhtml_path: Path) -> str:
    """Convert a single XHTML file to LaTeX using pandoc."""
    result = subprocess.run(
        [
            "pandoc",
            str(xhtml_path),
            "-f", "html",
            "-t", "latex",
            "--wrap=preserve",
        ],
        capture_output=True,
        text=True
    )
    if result.returncode != 0:
        print(f"Warning: pandoc error for {xhtml_path.name}: {result.stderr}")
    return result.stdout


def fix_latex_content(content: str, filename: str) -> str:
    """Fix and enhance LaTeX content."""
    # Fix image paths
    content = re.sub(
        r'\\includegraphics(\[.*?\])?\{\.\.?/images/',
        r'\\includegraphics\1{images/',
        content
    )
    content = re.sub(
        r'\\includegraphics(\[.*?\])?\{images/',
        r'\\includegraphics\1{images/',
        content
    )

    # Fix SVG references (convert to PDF if needed, or use PNG fallback)
    content = re.sub(
        r'\\includegraphics(\[.*?\])?\{images/brushstroke\.svg\}',
        r'\\includegraphics\1{images/brushstroke}',
        content
    )

    # Escape special characters that might have slipped through
    # (pandoc usually handles this but just in case)

    return content


def get_file_type(filename: str) -> str:
    """Determine the type of content based on filename."""
    if "TitlePage" in filename:
        return "titlepage"
    elif "Copyright" in filename:
        return "copyright"
    elif "TableOfContents" in filename:
        return "toc"
    elif "Dedication" in filename:
        return "dedication"
    elif "Preface" in filename and "quote" not in filename:
        return "preface"
    elif "-quote" in filename:
        return "quote"
    elif "Part-I" in filename or "Part-II" in filename or "Part-III" in filename or "Part-IV" in filename:
        return "part"
    elif "chapter-" in filename:
        return "chapter"
    elif "Conclusion" in filename and "quote" not in filename:
        return "conclusion"
    elif "QuizKey" in filename:
        return "quizkey"
    elif "SelfAssessment" in filename:
        return "assessment"
    elif "Affirmation" in filename or "affirmation" in filename:
        return "affirmation"
    elif "Acknowledgments" in filename:
        return "acknowledgments"
    elif "AbouttheAuthor" in filename:
        return "author"
    elif "bibliography" in filename:
        return "bibliography"
    elif "Journal" in filename or "journal" in filename:
        return "journal"
    elif "Doodle" in filename:
        return "doodle"
    elif "SMART" in filename:
        return "worksheet"
    elif "Collective" in filename:
        return "collective"
    elif "commitment" in filename:
        return "commitment"
    else:
        return "generic"


def create_individual_tex_file(filename: str, content: str, file_type: str) -> str:
    """Create the content for an individual .tex file."""
    tex_content = f"% {filename}\n"
    tex_content += f"% Type: {file_type}\n\n"
    tex_content += content
    return tex_content


def create_preamble() -> str:
    """Create the LaTeX preamble with all necessary packages and styling."""
    return r"""\documentclass[11pt,twoside]{book}

% ============================================================================
% PAGE GEOMETRY - 6x9 inch trim size for POD
% ============================================================================
\usepackage[
    paperwidth=6in,
    paperheight=9in,
    inner=0.875in,
    outer=0.625in,
    top=0.75in,
    bottom=0.75in,
    footskip=0.4in
]{geometry}

% ============================================================================
% ESSENTIAL PACKAGES
% ============================================================================
\usepackage{fontspec}
\usepackage{unicode-math}
\usepackage{polyglossia}
\setdefaultlanguage{english}

\usepackage{graphicx}
\usepackage{xcolor}
\usepackage{titlesec}
\usepackage{titletoc}
\usepackage{fancyhdr}
\usepackage{hyperref}
\usepackage{bookmark}
\usepackage{enumitem}
\usepackage{longtable}
\usepackage{booktabs}
\usepackage{array}
\usepackage{multirow}
\usepackage{float}
\usepackage{wrapfig}
\usepackage{soul}
\usepackage{setspace}
\usepackage{parskip}
\usepackage{microtype}
\usepackage{lettrine}
\usepackage{epigraph}
\usepackage{tikz}
\usepackage{afterpage}
\usepackage{pdfpages}
\usepackage{calc}
\usepackage{etoolbox}

% ============================================================================
% COLORS - Matching EPUB theme
% ============================================================================
\definecolor{teal}{RGB}{43,153,153}
\definecolor{tealdark}{RGB}{31,114,114}
\definecolor{teallight}{RGB}{61,179,179}
\definecolor{gold}{RGB}{201,169,97}
\definecolor{golddark}{RGB}{176,143,74}
\definecolor{goldlight}{RGB}{212,185,118}
\definecolor{ink}{RGB}{26,26,26}
\definecolor{textcolor}{RGB}{68,68,68}
\definecolor{cream}{RGB}{249,247,242}
\definecolor{linecolor}{RGB}{224,224,224}

% ============================================================================
% FONTS - Using system fonts similar to EPUB design
% ============================================================================
\setmainfont{DejaVu Serif}[
    Scale=1.0,
    Ligatures=TeX
]
\setsansfont{DejaVu Sans}[
    Scale=0.95,
    Ligatures=TeX
]
\setmonofont{DejaVu Sans Mono}[
    Scale=0.85
]

% Define font commands for special styling
\newfontfamily\displayfont{DejaVu Serif}[Scale=1.1]
\newfontfamily\headingfont{DejaVu Sans}[Scale=0.95]

% ============================================================================
% CHAPTER & SECTION STYLING
% ============================================================================
\titleformat{\part}[display]
    {\centering\Huge\bfseries\color{tealdark}}
    {\partname\ \thepart}
    {20pt}
    {\Huge}

\titleformat{\chapter}[display]
    {\normalfont\huge\bfseries\centering\color{tealdark}}
    {}
    {0pt}
    {\huge}

\titleformat{\section}
    {\normalfont\Large\bfseries\color{tealdark}}
    {\thesection}
    {1em}
    {}
    [\color{gold}\titlerule]

\titleformat{\subsection}
    {\normalfont\large\bfseries\color{teal}}
    {\thesubsection}
    {1em}
    {}

\titleformat{\subsubsection}
    {\normalfont\normalsize\bfseries\color{tealdark}}
    {\thesubsubsection}
    {1em}
    {}

% Spacing
\titlespacing*{\chapter}{0pt}{30pt}{20pt}
\titlespacing*{\section}{0pt}{20pt}{10pt}
\titlespacing*{\subsection}{0pt}{15pt}{8pt}

% ============================================================================
% HEADERS & FOOTERS
% ============================================================================
\pagestyle{fancy}
\fancyhf{}
\fancyhead[LE]{\thepage}
\fancyhead[RE]{\textit{Curls \& Contemplation}}
\fancyhead[LO]{\textit{\leftmark}}
\fancyhead[RO]{\thepage}
\renewcommand{\headrulewidth}{0.4pt}
\renewcommand{\footrulewidth}{0pt}

% Plain style for chapter pages
\fancypagestyle{plain}{
    \fancyhf{}
    \fancyfoot[C]{\thepage}
    \renewcommand{\headrulewidth}{0pt}
}

% ============================================================================
% HYPERREF SETUP
% ============================================================================
\hypersetup{
    colorlinks=true,
    linkcolor=tealdark,
    urlcolor=teal,
    citecolor=golddark,
    pdftitle={Curls \& Contemplation: A Stylist's Interactive Journey},
    pdfauthor={Michael David Warren Jr.},
    pdfsubject={Hairstyling, Professional Development},
    pdfkeywords={hairstyling, beauty industry, freelance, professional development}
}

% ============================================================================
% CUSTOM ENVIRONMENTS
% ============================================================================
% Action Steps Box
\newenvironment{actionsteps}{%
    \begin{tcolorbox}[
        colback=teal!5,
        colframe=teal,
        boxrule=0.5pt,
        left=10pt,
        right=10pt,
        top=10pt,
        bottom=10pt,
        arc=0pt,
        boxsep=5pt,
        leftrule=4pt
    ]
    \textbf{\color{tealdark}ACTION STEPS}\\[0.5em]
}{%
    \end{tcolorbox}
}

% Case Study Box
\newenvironment{casestudy}{%
    \begin{tcolorbox}[
        colback=gold!5,
        colframe=gold,
        boxrule=1pt,
        left=10pt,
        right=10pt,
        top=10pt,
        bottom=10pt,
        arc=0pt,
        boxsep=5pt
    ]
    \textbf{\color{golddark}CASE STUDY}\\[0.5em]
}{%
    \end{tcolorbox}
}

% Reflection/Quote Box
\newenvironment{reflection}{%
    \begin{quote}
    \itshape
}{%
    \end{quote}
}

% Writing lines for journals
\newcommand{\writinglines}[1]{%
    \foreach \n in {1,...,#1}{%
        \noindent\rule{\linewidth}{0.4pt}\\[0.5em]%
    }%
}

% ============================================================================
% LETTRINE (DROP CAPS) SETTINGS
% ============================================================================
\setcounter{DefaultLines}{3}
\renewcommand{\DefaultLoversize}{0.1}
\renewcommand{\DefaultLraise}{0}

% ============================================================================
% IMAGE HANDLING
% ============================================================================
\graphicspath{{images/}}
\DeclareGraphicsExtensions{.pdf,.png,.jpg,.jpeg}

% Full page image command
\newcommand{\fullpageimage}[1]{%
    \clearpage
    \thispagestyle{empty}
    \begin{tikzpicture}[remember picture,overlay]
        \node at (current page.center) {%
            \includegraphics[width=\paperwidth,height=\paperheight,keepaspectratio]{#1}%
        };
    \end{tikzpicture}
    \clearpage
}

% ============================================================================
% TABLE OF CONTENTS STYLING
% ============================================================================
\titlecontents{part}[0em]
    {\addvspace{2em}\bfseries\large}
    {\partname\ \thecontentslabel\quad}
    {}
    {\hfill\contentspage}

\titlecontents{chapter}[1.5em]
    {\addvspace{1em}\bfseries}
    {\contentslabel{1.5em}}
    {\hspace*{-1.5em}}
    {\titlerule*[0.5pc]{.}\contentspage}

\titlecontents{section}[3.8em]
    {}
    {\contentslabel{2.3em}}
    {\hspace*{-2.3em}}
    {\titlerule*[0.5pc]{.}\contentspage}

% ============================================================================
% MISCELLANEOUS
% ============================================================================
% Prevent orphans and widows
\widowpenalty=10000
\clubpenalty=10000

% Line spacing
\setstretch{1.15}

% Paragraph settings
\setlength{\parindent}{0.25in}
\setlength{\parskip}{0pt}

% List settings
\setlist[itemize]{leftmargin=*,itemsep=0.5em}
\setlist[enumerate]{leftmargin=*,itemsep=0.5em}

% tcolorbox for boxes (load after other packages)
\usepackage[most]{tcolorbox}

% ============================================================================
% DOCUMENT INFO
% ============================================================================
\title{Curls \& Contemplation\\[0.5em]\large A Stylist's Interactive Journey}
\author{Michael David Warren Jr.}
\date{2024}

"""


def create_master_document(tex_files: list) -> str:
    """Create the master LaTeX document that includes all individual files."""
    content = create_preamble()
    content += "\n\\begin{document}\n\n"

    # Front matter
    content += "\\frontmatter\n"
    content += "\\pagestyle{plain}\n\n"

    # Track which part we're in for proper structure
    in_mainmatter = False
    in_backmatter = False
    current_part = 0

    for tex_file in tex_files:
        basename = tex_file.replace(".tex", "")
        original_name = basename + ".xhtml"
        file_type = get_file_type(original_name)

        # Handle structure transitions
        if file_type == "part" and not in_mainmatter:
            content += "\n\\mainmatter\n"
            content += "\\pagestyle{fancy}\n\n"
            in_mainmatter = True

        if file_type in ["acknowledgments", "author", "bibliography"] and not in_backmatter:
            content += "\n\\backmatter\n\n"
            in_backmatter = True

        # Include the file
        content += f"\\input{{latex/{basename}}}\n"

        # Add page breaks after certain sections
        if file_type in ["titlepage", "copyright", "dedication", "toc", "part", "chapter", "quote", "conclusion"]:
            content += "\\clearpage\n"

        content += "\n"

    content += "\\end{document}\n"
    return content


def main():
    """Main function to build all LaTeX files."""
    print("=" * 60)
    print("Building LaTeX files for 'Curls & Contemplation'")
    print("=" * 60)

    # Setup
    print("\n1. Setting up directories...")
    setup_directories()

    # Copy assets
    print("\n2. Copying images and fonts...")
    copy_assets()

    # Convert SVG to PDF for LaTeX compatibility
    print("\n3. Converting SVG to PDF...")
    svg_path = LATEX_IMAGES_DIR / "brushstroke.svg"
    if svg_path.exists():
        subprocess.run([
            "rsvg-convert", "-f", "pdf",
            "-o", str(LATEX_IMAGES_DIR / "brushstroke.pdf"),
            str(svg_path)
        ], check=True)
        print("   Converted brushstroke.svg to PDF")

    # Convert each XHTML to LaTeX
    print("\n4. Converting XHTML files to LaTeX...")
    tex_files = []

    for filename in SPINE_ORDER:
        xhtml_path = XHTML_DIR / filename
        if not xhtml_path.exists():
            print(f"   Warning: {filename} not found, skipping")
            continue

        print(f"   Converting: {filename}")

        # Convert to LaTeX
        latex_content = convert_xhtml_to_latex(xhtml_path)
        latex_content = fix_latex_content(latex_content, filename)

        # Get file type
        file_type = get_file_type(filename)

        # Create individual tex file
        tex_filename = filename.replace(".xhtml", ".tex")
        tex_content = create_individual_tex_file(filename, latex_content, file_type)

        # Write the file
        tex_path = LATEX_DIR / tex_filename
        with open(tex_path, "w", encoding="utf-8") as f:
            f.write(tex_content)

        tex_files.append(tex_filename)

    # Create master document
    print("\n5. Creating master document...")
    master_content = create_master_document(tex_files)

    master_path = PDF_DIR / "CurlsAndContemplation-master.tex"
    with open(master_path, "w", encoding="utf-8") as f:
        f.write(master_content)

    print(f"   Master document: {master_path}")

    # Summary
    print("\n" + "=" * 60)
    print("BUILD COMPLETE")
    print("=" * 60)
    print(f"\nGenerated {len(tex_files)} individual LaTeX files in: {LATEX_DIR}")
    print(f"Master document: {master_path}")
    print(f"\nTo compile to PDF, run:")
    print(f"  cd {PDF_DIR}")
    print(f"  xelatex CurlsAndContemplation-master.tex")
    print(f"  xelatex CurlsAndContemplation-master.tex  # (run twice for TOC)")

    return tex_files


if __name__ == "__main__":
    main()
