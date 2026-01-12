# Makefile for Curls & Contemplation LaTeX to PDF build
# POD-ready PDF generation

.PHONY: all clean build fonts pdf rebuild help

# Variables
LATEX_ENGINE = xelatex
MASTER_TEX = CurlsAndContemplation-master.tex
OUTPUT_PDF = CurlsAndContemplation-master.pdf
LATEX_DIR = latex
FONTS_DIR = $(LATEX_DIR)/fonts
IMAGES_DIR = $(LATEX_DIR)/images

# Default target
all: fonts pdf

# Help target
help:
	@echo "Curls & Contemplation - LaTeX to PDF Build System"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  all      - Build everything (default)"
	@echo "  fonts    - Convert woff2 fonts to TTF"
	@echo "  pdf      - Compile LaTeX to PDF"
	@echo "  rebuild  - Regenerate LaTeX from XHTML and compile"
	@echo "  clean    - Remove generated files"
	@echo "  help     - Show this help message"

# Convert woff2 fonts to TTF if not already done
fonts:
	@echo "Converting fonts..."
	@cd $(FONTS_DIR) && for f in *.woff2; do \
		if [ -f "$$f" ] && [ ! -f "$${f%.woff2}.ttf" ]; then \
			woff2_decompress "$$f" 2>/dev/null || true; \
		fi \
	done
	@echo "Fonts ready."

# Compile PDF (run twice for TOC/references)
pdf: fonts
	@echo "Compiling PDF (pass 1)..."
	$(LATEX_ENGINE) -interaction=nonstopmode $(MASTER_TEX) || true
	@echo "Compiling PDF (pass 2 for TOC)..."
	$(LATEX_ENGINE) -interaction=nonstopmode $(MASTER_TEX) || true
	@echo "Compiling PDF (pass 3 for final)..."
	$(LATEX_ENGINE) -interaction=nonstopmode $(MASTER_TEX)
	@echo ""
	@echo "Build complete: $(OUTPUT_PDF)"

# Rebuild everything from XHTML sources
rebuild:
	@echo "Rebuilding LaTeX from XHTML sources..."
	python3 build_latex.py
	$(MAKE) pdf

# Clean generated files
clean:
	rm -f *.aux *.log *.out *.toc *.lof *.lot *.fls *.fdb_latexmk *.synctex.gz
	rm -f $(LATEX_DIR)/*.aux $(LATEX_DIR)/*.log
	@echo "Cleaned auxiliary files."

# Deep clean - also removes PDF
distclean: clean
	rm -f *.pdf
	@echo "Cleaned all generated files including PDF."
