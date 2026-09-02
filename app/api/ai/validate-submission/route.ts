// /app/api/ai/validate-submission/route.ts
import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import mammoth from "mammoth";
import * as cheerio from "cheerio";
import { ACTIVE_MODEL } from "@/lib/ai/model";

// pdf-parse@2 bundles the browser-only pdfjs-dist canvas renderer, which
// evaluates `new DOMMatrix` at module scope and relies on the native
// `@napi-rs/canvas` package to polyfill `globalThis.DOMMatrix` first. When the
// bundler/Vercel build cannot load that native module, importing it (as this
// route did at top level) crashes during `next build` page-data collection.
// Use pdfjs-dist's Node-compatible `legacy` build directly instead, imported
// lazily so it is never evaluated at build time and text extraction works with
// no browser APIs. pdfjs-dist + @napi-rs/canvas are kept external to the
// server bundle via `serverExternalPackages` in next.config.ts.
let pdfjsModulePromise: Promise<typeof import("pdfjs-dist/legacy/build/pdf.mjs")> | null = null;
function loadPdfjs() {
  if (!pdfjsModulePromise) {
    pdfjsModulePromise = import("pdfjs-dist/legacy/build/pdf.mjs");
  }
  return pdfjsModulePromise;
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

interface SubmissionPayload {
  title: string;
  subject: string;
  description: string;
  text: string;
  links: string[];
  files: {
    name: string;
    type: string;
    content?: string; // base64
  }[];
  externalTools: {
    type: string;
    url: string;
  }[];
}

async function extractTextFromPDF(base64Data: string): Promise<string> {
  const buffer = Buffer.from(base64Data, "base64");
  const pdfjs = await loadPdfjs();
  const pdf = await pdfjs.getDocument({
    data: new Uint8Array(buffer),
    disableFontFace: true,
    useSystemFonts: false,
    isEvalSupported: false,
  }).promise;

  const pageTexts: string[] = [];
  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      let pageText = "";
      for (const item of content.items) {
        if ("str" in item) {
          pageText += item.str;
          if (item.hasEOL) {
            pageText += "\n";
          }
        }
      }
      pageTexts.push(pageText);
    }
  } finally {
    await pdf.destroy();
  }
  return pageTexts.join("\n");
}

async function extractTextFromDocx(base64Data: string): Promise<string> {
  const buffer = Buffer.from(base64Data, "base64");
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

async function fetchRichMetadata(url: string): Promise<string> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const html = await res.text();
    const $ = cheerio.load(html);
    const title = $("title").text();
    const description = $('meta[name="description"]').attr("content") || "";
    const bodyText = $("body").text().replace(/\s+/g, " ").trim().slice(0, 500);
    return `Title: ${title}\nDescription: ${description}\nPreview: ${bodyText}\nURL: ${url}`;
  } catch {
    return `Failed to fetch content from ${url}`;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: SubmissionPayload = await req.json();

    let fileContents = "";
    for (const file of body.files) {
      if (file.content) {
        let extracted = "";
        try {
          if (file.name.toLowerCase().endsWith(".pdf")) {
            extracted = await extractTextFromPDF(file.content);
          } else if (file.name.toLowerCase().endsWith(".docx")) {
            extracted = await extractTextFromDocx(file.content);
          } else {
            extracted = `[File type not supported: ${file.name}]`;
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          extracted = `[Error extracting text from ${file.name}: ${errorMessage}]`;
        }
        fileContents += `\n--- File: ${file.name} ---\n${extracted.slice(0, 3000)}\n`;
      } else {
        fileContents += `\n--- File: ${file.name} (no content provided) ---\n`;
      }
    }

    let linkMetadata = "";
    for (const link of body.links) {
      const meta = await fetchRichMetadata(link);
      linkMetadata += `\n${meta}\n`;
    }

    let toolsDescription = "";
    for (const tool of body.externalTools) {
      const meta = await fetchRichMetadata(tool.url);
      toolsDescription += `\n--- ${tool.type.toUpperCase()} ---\n${meta}\n`;
    }

    const prompt = `
You are an expert educational evaluator. Analyse the following assignment submission and provide a detailed, structured assessment.

Assignment Title: "${body.title}"
Subject: "${body.subject}"
Original Description: "${body.description}"

Student's written answer:
${body.text || "(No written answer provided)"}

Links provided (with metadata):
${linkMetadata || "None"}

Uploaded files (extracted text):
${fileContents || "None"}

External tools (preview):
${toolsDescription || "None"}

Return ONLY a JSON object with the following structure:
{
  "score": number (0-100),
  "assessment": "string (overall summary)",
  "strengths": ["string", "string", "string"],
  "weaknesses": ["string", "string", "string"],
  "recommendations": ["string", "string", "string"]
}

Be strict but fair. Consider completeness, accuracy, use of sources, originality, and technical quality.
`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: ACTIVE_MODEL,
      temperature: 0.4,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response");
    const result = JSON.parse(content);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Validation failed:", error);
    return NextResponse.json(
      {
        score: 0,
        assessment: "Unable to evaluate submission due to an error.",
        strengths: [],
        weaknesses: ["System error: please try again later."],
        recommendations: ["Contact support if the problem persists."],
      },
      { status: 500 }
    );
  }
}