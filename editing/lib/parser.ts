// File parsing engine — accepts .docx, .txt, .md, .html, .epub, .zip
// Extracts plain text + chapter structure from uploaded manuscripts
// All content is sanitized before processing

import sanitizeHtml from "sanitize-html";
import { marked } from "marked";
import JSZip from "jszip";

export interface ParsedManuscript {
  title: string;
  chapters: ParsedChapter[];
  fullText: string;
  wordCount: number;
  format: string;
}

export interface ParsedChapter {
  number: number;
  title: string;
  content: string; // plain text
  htmlContent?: string;
  wordCount: number;
}

const ALLOWED_HTML_TAGS = [
  "p", "br", "b", "i", "em", "strong", "u", "h1", "h2", "h3", "h4", "h5", "h6",
  "blockquote", "ul", "ol", "li", "span", "div", "a", "table", "tr", "td", "th",
];

function sanitize(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_HTML_TAGS,
    allowedAttributes: { a: ["href"], span: ["class"], div: ["class"] },
    disallowedTagsMode: "discard",
  });
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function countWords(text: string): number {
  return text.split(/\s+/).filter((w) => w.length > 0).length;
}

// Split text into chapters based on common heading patterns
function splitIntoChapters(text: string, htmlContent?: string): ParsedChapter[] {
  // Try chapter markers: "Chapter X", "CHAPTER X", "Part X", numbered headings, etc.
  const chapterPatterns = [
    /^(?:chapter|CHAPTER)\s+(\d+|[IVXLC]+)[\s.:—\-]*(.*)/gm,
    /^(?:PART|Part)\s+(\d+|[IVXLC]+)[\s.:—\-]*(.*)/gm,
    /^#{1,2}\s+(.*)/gm,
  ];

  let splits: { index: number; title: string }[] = [];

  for (const pattern of chapterPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      splits.push({ index: match.index, title: match[0].trim() });
    }
    if (splits.length > 1) break;
  }

  // Sort by position
  splits.sort((a, b) => a.index - b.index);

  if (splits.length === 0) {
    // No chapter markers — treat entire text as one chapter
    return [
      {
        number: 1,
        title: "Full Manuscript",
        content: text,
        wordCount: countWords(text),
      },
    ];
  }

  const chapters: ParsedChapter[] = [];
  for (let i = 0; i < splits.length; i++) {
    const start = splits[i].index;
    const end = i + 1 < splits.length ? splits[i + 1].index : text.length;
    const content = text.slice(start, end).trim();
    chapters.push({
      number: i + 1,
      title: splits[i].title,
      content,
      wordCount: countWords(content),
    });
  }

  return chapters;
}

/** Parse a .txt file */
function parseTxt(content: string, filename: string): ParsedManuscript {
  const chapters = splitIntoChapters(content);
  return {
    title: filename.replace(/\.txt$/i, ""),
    chapters,
    fullText: content,
    wordCount: countWords(content),
    format: "txt",
  };
}

/** Parse a .md file */
async function parseMd(content: string, filename: string): Promise<ParsedManuscript> {
  const html = await marked.parse(content);
  const text = stripHtml(html);
  const chapters = splitIntoChapters(content);
  return {
    title: filename.replace(/\.md$/i, ""),
    chapters,
    fullText: text,
    wordCount: countWords(text),
    format: "md",
  };
}

/** Parse a .html file */
function parseHtml(content: string, filename: string): ParsedManuscript {
  const clean = sanitize(content);
  const text = stripHtml(clean);
  const chapters = splitIntoChapters(text);
  return {
    title: filename.replace(/\.html?$/i, ""),
    chapters,
    fullText: text,
    wordCount: countWords(text),
    format: "html",
  };
}

/** Parse a .docx file using mammoth */
async function parseDocx(buffer: ArrayBuffer, filename: string): Promise<ParsedManuscript> {
  const mammoth = await import("mammoth");
  const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
  const html = sanitize(result.value);
  const text = stripHtml(html);
  const chapters = splitIntoChapters(text);
  return {
    title: filename.replace(/\.docx?$/i, ""),
    chapters,
    fullText: text,
    wordCount: countWords(text),
    format: "docx",
  };
}

/** Parse an .epub file — extract text from XHTML content files */
async function parseEpub(buffer: ArrayBuffer, filename: string): Promise<ParsedManuscript> {
  const zip = await JSZip.loadAsync(buffer);
  const chapters: ParsedChapter[] = [];
  let allText = "";
  let chapterNum = 0;

  // Find content files — typically in OEBPS or similar
  const contentFiles: { name: string; content: string }[] = [];

  for (const [path, file] of Object.entries(zip.files)) {
    if (file.dir) continue;
    if (path.match(/\.(xhtml|html|htm)$/i) && !path.match(/toc|nav|cover/i)) {
      const content = await file.async("string");
      contentFiles.push({ name: path, content });
    }
  }

  // Sort by filename to maintain order
  contentFiles.sort((a, b) => a.name.localeCompare(b.name));

  for (const file of contentFiles) {
    const clean = sanitize(file.content);
    const text = stripHtml(clean);
    if (text.length < 50) continue; // Skip near-empty files

    chapterNum++;
    const titleMatch = file.content.match(/<h[12][^>]*>(.*?)<\/h[12]>/i);
    const title = titleMatch ? stripHtml(titleMatch[1]) : `Chapter ${chapterNum}`;

    chapters.push({
      number: chapterNum,
      title,
      content: text,
      htmlContent: clean,
      wordCount: countWords(text),
    });
    allText += text + "\n\n";
  }

  if (chapters.length === 0) {
    chapters.push({
      number: 1,
      title: "Full Manuscript",
      content: allText || "No extractable text found in EPUB.",
      wordCount: countWords(allText),
    });
  }

  return {
    title: filename.replace(/\.epub$/i, ""),
    chapters,
    fullText: allText.trim(),
    wordCount: countWords(allText),
    format: "epub",
  };
}

/** Parse a .zip file — look for supported file inside */
async function parseZip(buffer: ArrayBuffer, filename: string): Promise<ParsedManuscript> {
  const zip = await JSZip.loadAsync(buffer);
  const supportedExts = [".docx", ".epub", ".txt", ".md", ".html", ".htm"];

  for (const [path, file] of Object.entries(zip.files)) {
    if (file.dir) continue;
    const ext = path.match(/\.[^.]+$/)?.[0]?.toLowerCase();
    if (ext && supportedExts.includes(ext)) {
      const content = await file.async("arraybuffer");
      return parseFile(content, path);
    }
  }

  throw new Error("ZIP file does not contain a supported manuscript format");
}

/** Main entry point: parse any supported file format */
export async function parseFile(
  content: ArrayBuffer | string,
  filename: string
): Promise<ParsedManuscript> {
  const ext = filename.match(/\.[^.]+$/)?.[0]?.toLowerCase();

  switch (ext) {
    case ".txt": {
      const text = typeof content === "string" ? content : new TextDecoder().decode(content);
      return parseTxt(text, filename);
    }
    case ".md": {
      const text = typeof content === "string" ? content : new TextDecoder().decode(content);
      return parseMd(text, filename);
    }
    case ".html":
    case ".htm": {
      const text = typeof content === "string" ? content : new TextDecoder().decode(content);
      return parseHtml(text, filename);
    }
    case ".docx":
    case ".doc": {
      const buf = typeof content === "string" ? new TextEncoder().encode(content).buffer : content;
      return parseDocx(buf as ArrayBuffer, filename);
    }
    case ".epub": {
      const buf = typeof content === "string" ? new TextEncoder().encode(content).buffer : content;
      return parseEpub(buf as ArrayBuffer, filename);
    }
    case ".zip": {
      const buf = typeof content === "string" ? new TextEncoder().encode(content).buffer : content;
      return parseZip(buf as ArrayBuffer, filename);
    }
    default:
      throw new Error(`Unsupported file format: ${ext}. Supported: .docx, .txt, .md, .html, .epub, .zip`);
  }
}
