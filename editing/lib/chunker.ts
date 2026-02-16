// Manuscript chunking system for handling large files within LLM token limits
// Splits chapters into overlapping chunks to preserve context at boundaries

import { estimateTokens } from "./llm";

export interface Chunk {
  index: number;
  content: string;
  tokenCount: number;
  chapterNumber: number;
  startParagraph: number;
  endParagraph: number;
}

// Target chunk size in tokens — leaves room for system prompt + response
const DEFAULT_CHUNK_SIZE = 3000;
// Overlap in paragraphs to preserve context at chunk boundaries
const OVERLAP_PARAGRAPHS = 2;

/**
 * Split chapter content into token-limited chunks.
 * Chunks split on paragraph boundaries with overlap for context continuity.
 */
export function chunkChapter(
  content: string,
  chapterNumber: number,
  maxTokens: number = DEFAULT_CHUNK_SIZE
): Chunk[] {
  const paragraphs = content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  if (paragraphs.length === 0) {
    return [
      {
        index: 0,
        content,
        tokenCount: estimateTokens(content),
        chapterNumber,
        startParagraph: 0,
        endParagraph: 0,
      },
    ];
  }

  const chunks: Chunk[] = [];
  let startIdx = 0;

  while (startIdx < paragraphs.length) {
    let endIdx = startIdx;
    let currentText = paragraphs[startIdx];
    let currentTokens = estimateTokens(currentText);

    // Add paragraphs until we hit the token limit
    while (endIdx + 1 < paragraphs.length) {
      const nextParagraph = paragraphs[endIdx + 1];
      const nextTokens = estimateTokens(nextParagraph);

      if (currentTokens + nextTokens > maxTokens) break;

      endIdx++;
      currentText += "\n\n" + nextParagraph;
      currentTokens += nextTokens;
    }

    // If a single paragraph exceeds the limit, include it anyway (will be handled by LLM)
    if (endIdx === startIdx && currentTokens > maxTokens) {
      // Split long paragraph by sentences as fallback
      const sentences = currentText.match(/[^.!?]+[.!?]+/g) || [currentText];
      let sentenceChunk = "";
      let sentenceTokens = 0;

      for (const sentence of sentences) {
        const st = estimateTokens(sentence);
        if (sentenceTokens + st > maxTokens && sentenceChunk.length > 0) {
          chunks.push({
            index: chunks.length,
            content: sentenceChunk.trim(),
            tokenCount: sentenceTokens,
            chapterNumber,
            startParagraph: startIdx,
            endParagraph: startIdx,
          });
          sentenceChunk = sentence;
          sentenceTokens = st;
        } else {
          sentenceChunk += sentence;
          sentenceTokens += st;
        }
      }
      if (sentenceChunk.trim().length > 0) {
        chunks.push({
          index: chunks.length,
          content: sentenceChunk.trim(),
          tokenCount: sentenceTokens,
          chapterNumber,
          startParagraph: startIdx,
          endParagraph: startIdx,
        });
      }
      startIdx = endIdx + 1;
      continue;
    }

    chunks.push({
      index: chunks.length,
      content: currentText,
      tokenCount: currentTokens,
      chapterNumber,
      startParagraph: startIdx,
      endParagraph: endIdx,
    });

    // Move forward with overlap
    startIdx = Math.max(startIdx + 1, endIdx + 1 - OVERLAP_PARAGRAPHS);
  }

  return chunks;
}

/** Chunk an entire manuscript across all chapters */
export function chunkManuscript(
  chapters: { number: number; content: string }[],
  maxTokensPerChunk?: number
): Chunk[] {
  const allChunks: Chunk[] = [];
  for (const ch of chapters) {
    const chapterChunks = chunkChapter(ch.content, ch.number, maxTokensPerChunk);
    for (const c of chapterChunks) {
      allChunks.push({ ...c, index: allChunks.length });
    }
  }
  return allChunks;
}
