#!/usr/bin/env python3
"""
Convert XHTML files to a consolidated LaTeX document for PDF generation.
Uses the spine order from content.opf for proper document structure.
"""

import os
import re
import subprocess
from pathlib import Path
from lxml import etree

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

BASE_DIR = Path(__file__).parent.parent
XHTML_DIR = BASE_DIR / "pub" / "OEBPS" / "xhtml"
IMAGES_DIR = BASE_DIR / "pub" / "OEBPS" / "images"
OUTPUT_DIR = BASE_DIR / "pdf"


def convert_single_xhtml_to_latex(xhtml_path: Path) -> str:
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


def fix_image_paths(latex_content: str) -> str:
    """Fix image paths to be relative to the pdf directory."""
    # Replace image paths to point to ../pub/OEBPS/images/
    latex_content = re.sub(
        r'\\includegraphics(\[.*?\])?\{\.\.?/images/',
        r'\\includegraphics\1{../pub/OEBPS/images/',
        latex_content
    )
    latex_content = re.sub(
        r'\\includegraphics(\[.*?\])?\{images/',
        r'\\includegraphics\1{../pub/OEBPS/images/',
        latex_content
    )
    return latex_content


def escape_latex_special(text: str) -> str:
    """Escape special LaTeX characters."""
    # Already done by pandoc, but just in case
    return text


def generate_latex_document() -> str:
    """Generate the complete LaTeX document."""

    # LaTeX preamble with professional book formatting
    preamble = r"""\documentclass[11pt,letterpaper,twoside]{book}

% Essential packages
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{fontspec}
\usepackage{geometry}
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
\usepackage{quotchap}
\usepackage{epigraph}

% Page geometry
\geometry{
    letterpaper,
    inner=1.25in,
    outer=1in,
    top=1in,
    bottom=1in,
    footskip=0.5in
}

% Colors matching the book's theme
\definecolor{goldaccent}{RGB}{212,175,55}
\definecolor{darkgold}{RGB}{139,117,0}
\definecolor{warmblack}{RGB}{30,30,30}
\definecolor{softwhite}{RGB}{250,248,245}

% Fonts - using system fonts that are similar to the book's design
\setmainfont{DejaVu Serif}
\setsansfont{DejaVu Sans}
\setmonofont{DejaVu Sans Mono}

% Chapter and section styling
\titleformat{\chapter}[display]
    {\normalfont\huge\bfseries\centering}
    {\chaptertitlename\ \thechapter}
    {20pt}
    {\Huge}
\titleformat{\section}
    {\normalfont\Large\bfseries\color{darkgold}}
    {\thesection}
    {1em}
    {}
\titleformat{\subsection}
    {\normalfont\large\bfseries}
    {\thesubsection}
    {1em}
    {}

% Header and footer
\pagestyle{fancy}
\fancyhf{}
\fancyhead[LE,RO]{\thepage}
\fancyhead[RE]{\textit{Curls \& Contemplation}}
\fancyhead[LO]{\textit{\leftmark}}
\renewcommand{\headrulewidth}{0.4pt}
\renewcommand{\footrulewidth}{0pt}

% Hyperref setup
\hypersetup{
    colorlinks=true,
    linkcolor=darkgold,
    urlcolor=darkgold,
    pdftitle={Curls \& Contemplation: A Stylist's Interactive Journey},
    pdfauthor={Michael David Warren Jr.}
}

% Custom environments for the book's special sections
\newenvironment{reflection}
    {\begin{quote}\itshape}
    {\end{quote}}

\newenvironment{exercise}
    {\begin{quote}\noindent\textbf{Exercise:}\\}
    {\end{quote}}

% Adjust image handling
\setkeys{Gin}{width=\linewidth,totalheight=\textheight,keepaspectratio}

% Begin document
\begin{document}

% Front matter
\frontmatter
\pagestyle{plain}

"""

    postamble = r"""

% End document
\end{document}
"""

    # Build the document body by converting each XHTML file
    body_parts = []
    current_part = None

    for i, filename in enumerate(SPINE_ORDER):
        xhtml_path = XHTML_DIR / filename
        if not xhtml_path.exists():
            print(f"Warning: {filename} not found, skipping")
            continue

        print(f"Converting: {filename}")
        latex_content = convert_single_xhtml_to_latex(xhtml_path)
        latex_content = fix_image_paths(latex_content)

        # Add section markers based on filename
        if "TitlePage" in filename:
            body_parts.append(r"\begin{titlepage}")
            body_parts.append(r"\centering")
            body_parts.append(r"\vspace*{2in}")
            body_parts.append(r"{\Huge\bfseries CURLS \& CONTEMPLATION}\\[0.5cm]")
            body_parts.append(r"{\Large A Stylist's Interactive Journey}\\[2cm]")
            body_parts.append(r"{\large Michael David Warren Jr.}")
            body_parts.append(r"\vfill")
            body_parts.append(r"\end{titlepage}")
            body_parts.append(r"\cleardoublepage")
        elif "Copyright" in filename:
            body_parts.append(r"\thispagestyle{empty}")
            body_parts.append(latex_content)
            body_parts.append(r"\cleardoublepage")
        elif "TableOfContents" in filename:
            body_parts.append(r"\tableofcontents")
            body_parts.append(r"\cleardoublepage")
        elif "Dedication" in filename:
            body_parts.append(r"\chapter*{Dedication}")
            body_parts.append(r"\addcontentsline{toc}{chapter}{Dedication}")
            body_parts.append(latex_content)
        elif "Preface" in filename and "quote" not in filename:
            body_parts.append(r"\chapter*{Preface}")
            body_parts.append(r"\addcontentsline{toc}{chapter}{Preface}")
            body_parts.append(latex_content)
        elif "Part-I" in filename or "Part-II" in filename or "Part-III" in filename or "Part-IV" in filename:
            # Start main matter with first part
            if "Part-I" in filename:
                body_parts.append(r"\mainmatter")
                body_parts.append(r"\pagestyle{fancy}")
            # Extract part name
            part_name = filename.replace(".xhtml", "").split("-", 1)[1].replace("-", " ")
            body_parts.append(f"\\part{{{part_name}}}")
        elif "chapter-" in filename:
            # Extract chapter title from content
            body_parts.append(latex_content)
        elif "Conclusion" in filename and "quote" not in filename:
            body_parts.append(r"\chapter*{Conclusion}")
            body_parts.append(r"\addcontentsline{toc}{chapter}{Conclusion}")
            body_parts.append(latex_content)
        elif "Acknowledgments" in filename:
            body_parts.append(r"\backmatter")
            body_parts.append(r"\chapter*{Acknowledgments}")
            body_parts.append(r"\addcontentsline{toc}{chapter}{Acknowledgments}")
            body_parts.append(latex_content)
        elif "AbouttheAuthor" in filename:
            body_parts.append(r"\chapter*{About the Author}")
            body_parts.append(r"\addcontentsline{toc}{chapter}{About the Author}")
            body_parts.append(latex_content)
        elif "bibliography" in filename:
            body_parts.append(r"\chapter*{Bibliography}")
            body_parts.append(r"\addcontentsline{toc}{chapter}{Bibliography}")
            body_parts.append(latex_content)
        else:
            # Generic section
            body_parts.append(latex_content)

        body_parts.append("")  # Add blank line between sections

    full_document = preamble + "\n".join(body_parts) + postamble
    return full_document


def main():
    """Main function to run the conversion."""
    print("Starting XHTML to LaTeX conversion...")
    print(f"XHTML directory: {XHTML_DIR}")
    print(f"Output directory: {OUTPUT_DIR}")

    # Ensure output directory exists
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Generate the LaTeX document
    latex_document = generate_latex_document()

    # Write the LaTeX file
    output_file = OUTPUT_DIR / "CurlsAndContemplation.tex"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(latex_document)

    print(f"\nLaTeX file generated: {output_file}")
    print(f"File size: {output_file.stat().st_size} bytes")

    return output_file


if __name__ == "__main__":
    main()
