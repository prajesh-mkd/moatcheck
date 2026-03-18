import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";

/**
 * POST /api/upload
 * Extracts text from uploaded documents (DOCX, PDF, TXT, CSV, etc.)
 * Returns the extracted text to be used as context for AI analysis.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name.toLowerCase();
    let extractedText = "";

    // ── Extract text based on file type ───────────────────────
    if (fileName.endsWith(".docx")) {
      // DOCX: use mammoth to extract clean text
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else if (fileName.endsWith(".pdf")) {
      // PDF: use pdf-parse
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require("pdf-parse");
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text;
      } catch {
        extractedText = "[PDF parsing failed — please try a .docx or .txt version]";
      }
    } else {
      // TXT, CSV, MD, etc.: read as UTF-8 text
      extractedText = buffer.toString("utf-8");
    }

    // Clean up excessive whitespace
    extractedText = extractedText
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    return NextResponse.json({
      success: true,
      fileName: file.name,
      size: file.size,
      extractedText,
      charCount: extractedText.length,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
