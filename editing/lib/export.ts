// Export engine — converts manuscript content to .docx, .epub, .md, .html, .pdf
// Assembles chapters from encrypted storage and outputs in the requested format

import db from "./database";
import { decrypt } from "./encryption";
import JSZip from "jszip";

export type ExportFormat = "docx" | "epub" | "md" | "html" | "txt";

interface ExportResult {
  filename: string;
  contentType: string;
  data: ArrayBuffer | string;
}

/** Get the assembled manuscript text from chapters */
function getManuscriptText(manuscriptId: string): { title: string; chapters: { number: number; title: string; content: string }[] } {
  const manuscript = db.query("SELECT title FROM manuscripts WHERE id = ?").get(manuscriptId) as any;
  if (!manuscript) throw new Error("Manuscript not found");

  const chapters = db.query(
    "SELECT chapter_number, title, encrypted_content FROM chapters WHERE manuscript_id = ? ORDER BY chapter_number"
  ).all(manuscriptId) as any[];

  return {
    title: manuscript.title,
    chapters: chapters.map((ch: any) => ({
      number: ch.chapter_number,
      title: ch.title,
      content: decrypt(ch.encrypted_content),
    })),
  };
}

/** Export manuscript to the specified format */
export async function exportManuscript(manuscriptId: string, format: ExportFormat): Promise<ExportResult> {
  const ms = getManuscriptText(manuscriptId);

  switch (format) {
    case "txt":
      return exportTxt(ms);
    case "md":
      return exportMarkdown(ms);
    case "html":
      return exportHtml(ms);
    case "epub":
      return exportEpub(ms);
    case "docx":
      return exportDocx(ms);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

function exportTxt(ms: { title: string; chapters: { number: number; title: string; content: string }[] }): ExportResult {
  let text = `${ms.title}\n${"=".repeat(ms.title.length)}\n\n`;

  for (const ch of ms.chapters) {
    text += `${ch.title}\n${"-".repeat(ch.title.length)}\n\n${ch.content}\n\n\n`;
  }

  return {
    filename: `${ms.title}.txt`,
    contentType: "text/plain",
    data: text,
  };
}

function exportMarkdown(ms: { title: string; chapters: { number: number; title: string; content: string }[] }): ExportResult {
  let md = `# ${ms.title}\n\n`;

  for (const ch of ms.chapters) {
    md += `## ${ch.title}\n\n${ch.content}\n\n---\n\n`;
  }

  return {
    filename: `${ms.title}.md`,
    contentType: "text/markdown",
    data: md,
  };
}

function exportHtml(ms: { title: string; chapters: { number: number; title: string; content: string }[] }): ExportResult {
  const chaptersHtml = ms.chapters
    .map((ch) => {
      const paragraphs = ch.content
        .split(/\n\s*\n/)
        .map((p) => `<p>${escapeHtml(p.trim())}</p>`)
        .join("\n");
      return `<section>\n<h2>${escapeHtml(ch.title)}</h2>\n${paragraphs}\n</section>`;
    })
    .join("\n\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(ms.title)}</title>
  <style>
    body { font-family: Georgia, serif; max-width: 700px; margin: 2rem auto; padding: 0 1rem; line-height: 1.8; color: #222; }
    h1 { text-align: center; margin-bottom: 2rem; }
    h2 { margin-top: 3rem; page-break-before: always; }
    p { text-indent: 1.5em; margin: 0.5em 0; }
    section + section { margin-top: 2rem; }
  </style>
</head>
<body>
  <h1>${escapeHtml(ms.title)}</h1>
  ${chaptersHtml}
</body>
</html>`;

  return {
    filename: `${ms.title}.html`,
    contentType: "text/html",
    data: html,
  };
}

async function exportEpub(ms: { title: string; chapters: { number: number; title: string; content: string }[] }): Promise<ExportResult> {
  const zip = new JSZip();

  // mimetype must be first, uncompressed
  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });

  // Container
  zip.file(
    "META-INF/container.xml",
    `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`
  );

  // Generate chapter XHTML files
  const manifest: string[] = [];
  const spine: string[] = [];

  for (const ch of ms.chapters) {
    const id = `chapter${ch.number}`;
    const filename = `${id}.xhtml`;
    const paragraphs = ch.content
      .split(/\n\s*\n/)
      .map((p) => `<p>${escapeHtml(p.trim())}</p>`)
      .join("\n");

    zip.file(
      `OEBPS/${filename}`,
      `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>${escapeHtml(ch.title)}</title></head>
<body>
<h2>${escapeHtml(ch.title)}</h2>
${paragraphs}
</body>
</html>`
    );

    manifest.push(`<item id="${id}" href="${filename}" media-type="application/xhtml+xml"/>`);
    spine.push(`<itemref idref="${id}"/>`);
  }

  // OPF
  zip.file(
    "OEBPS/content.opf",
    `<?xml version="1.0" encoding="UTF-8"?>
<package version="3.0" xmlns="http://www.idpf.org/2007/opf" unique-identifier="uid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">urn:uuid:${crypto.randomUUID()}</dc:identifier>
    <dc:title>${escapeHtml(ms.title)}</dc:title>
    <dc:language>en</dc:language>
    <meta property="dcterms:modified">${new Date().toISOString().slice(0, 19)}Z</meta>
  </metadata>
  <manifest>
    ${manifest.join("\n    ")}
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
  </manifest>
  <spine>
    ${spine.join("\n    ")}
  </spine>
</package>`
  );

  // Navigation document
  const navItems = ms.chapters
    .map((ch) => `<li><a href="chapter${ch.number}.xhtml">${escapeHtml(ch.title)}</a></li>`)
    .join("\n      ");

  zip.file(
    "OEBPS/nav.xhtml",
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head><title>Table of Contents</title></head>
<body>
<nav epub:type="toc">
  <h1>Table of Contents</h1>
  <ol>
    ${navItems}
  </ol>
</nav>
</body>
</html>`
  );

  const buffer = await zip.generateAsync({ type: "arraybuffer" });

  return {
    filename: `${ms.title}.epub`,
    contentType: "application/epub+zip",
    data: buffer,
  };
}

async function exportDocx(ms: { title: string; chapters: { number: number; title: string; content: string }[] }): Promise<ExportResult> {
  // Minimal OOXML .docx generation
  const zip = new JSZip();

  zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);

  zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

  zip.file("word/_rels/document.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`);

  // Build document body
  let body = `<w:p><w:pPr><w:pStyle w:val="Title"/></w:pPr><w:r><w:t>${escapeXml(ms.title)}</w:t></w:r></w:p>`;

  for (const ch of ms.chapters) {
    body += `<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>${escapeXml(ch.title)}</w:t></w:r></w:p>`;

    const paragraphs = ch.content.split(/\n\s*\n/).filter((p) => p.trim());
    for (const p of paragraphs) {
      body += `<w:p><w:r><w:t xml:space="preserve">${escapeXml(p.trim())}</w:t></w:r></w:p>`;
    }
  }

  zip.file("word/document.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${body}
  </w:body>
</w:document>`);

  const buffer = await zip.generateAsync({ type: "arraybuffer" });

  return {
    filename: `${ms.title}.docx`,
    contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    data: buffer,
  };
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
