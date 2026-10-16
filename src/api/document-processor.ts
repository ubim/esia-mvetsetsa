/**
 * Document Processing API
 * Handles document upload, text extraction, and format conversion
 */

import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";

export interface ProcessedDocument {
  text: string;
  fileName: string;
  fileType: string;
  pageCount?: number;
  wordCount: number;
  error?: string;
}

export interface DocumentExportOptions {
  format: "pdf" | "docx";
  title: string;
  content: string;
  originalContent?: string;
  metadata?: {
    author?: string;
    subject?: string;
    keywords?: string[];
    createdDate?: Date;
  };
}

/**
 * Extract text from PDF file
 */
export async function extractTextFromPDF(file: File | ArrayBuffer): Promise<ProcessedDocument> {
  try {
    const arrayBuffer = file instanceof File ? await file.arrayBuffer() : file;
    
    // Set up PDF.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    const textParts: string[] = [];
    const pageCount = pdf.numPages;
    
    // Extract text from each page
    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      textParts.push(pageText);
    }
    
    const text = textParts.join("\n\n");
    const wordCount = text.split(/\s+/).length;
    
    return {
      text,
      fileName: file instanceof File ? file.name : "document.pdf",
      fileType: "pdf",
      pageCount,
      wordCount,
    };
  } catch (error) {
    console.error("PDF extraction error:", error);
    return {
      text: "",
      fileName: file instanceof File ? file.name : "document.pdf",
      fileType: "pdf",
      wordCount: 0,
      error: error instanceof Error ? error.message : "Failed to extract text from PDF",
    };
  }
}

/**
 * Extract text from Word document (.docx)
 */
export async function extractTextFromWord(file: File | ArrayBuffer): Promise<ProcessedDocument> {
  try {
    const arrayBuffer = file instanceof File ? await file.arrayBuffer() : file;
    
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value;
    const wordCount = text.split(/\s+/).length;
    
    return {
      text,
      fileName: file instanceof File ? file.name : "document.docx",
      fileType: "docx",
      wordCount,
    };
  } catch (error) {
    console.error("Word extraction error:", error);
    return {
      text: "",
      fileName: file instanceof File ? file.name : "document.docx",
      fileType: "docx",
      wordCount: 0,
      error: error instanceof Error ? error.message : "Failed to extract text from Word document",
    };
  }
}

/**
 * Extract text from plain text file
 */
export async function extractTextFromPlainText(file: File): Promise<ProcessedDocument> {
  try {
    const text = await file.text();
    const wordCount = text.split(/\s+/).length;
    
    return {
      text,
      fileName: file.name,
      fileType: "txt",
      wordCount,
    };
  } catch (error) {
    console.error("Text extraction error:", error);
    return {
      text: "",
      fileName: file.name,
      fileType: "txt",
      wordCount: 0,
      error: error instanceof Error ? error.message : "Failed to extract text from file",
    };
  }
}

/**
 * Process uploaded document and extract text
 */
export async function processDocument(file: File): Promise<ProcessedDocument> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();
  
  if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
    return await extractTextFromPDF(file);
  } else if (
    fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileName.endsWith(".docx")
  ) {
    return await extractTextFromWord(file);
  } else if (fileType === "text/plain" || fileName.endsWith(".txt")) {
    return await extractTextFromPlainText(file);
  } else {
    return {
      text: "",
      fileName: file.name,
      fileType: "unknown",
      wordCount: 0,
      error: `Unsupported file type: ${fileType}. Please upload PDF, DOCX, or TXT files.`,
    };
  }
}

/**
 * Export document as PDF
 */
export async function exportToPDF(options: DocumentExportOptions): Promise<Blob> {
  const { default: jsPDF } = await import("jspdf");
  
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  
  // Add title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(options.title, margin, margin);
  
  let yPosition = margin + 15;
  
  // Add metadata if provided
  if (options.metadata) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    if (options.metadata.author) {
      doc.text(`Author: ${options.metadata.author}`, margin, yPosition);
      yPosition += 7;
    }
    
    if (options.metadata.createdDate) {
      doc.text(`Date: ${options.metadata.createdDate.toLocaleDateString()}`, margin, yPosition);
      yPosition += 7;
    }
    
    yPosition += 5;
  }
  
  // Add content
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  
  const lines = doc.splitTextToSize(options.content, maxWidth);
  
  for (const line of lines) {
    if (yPosition > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
    
    doc.text(line, margin, yPosition);
    yPosition += 7;
  }
  
  // Add original content section if provided
  if (options.originalContent) {
    doc.addPage();
    yPosition = margin;
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Original Content", margin, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    const originalLines = doc.splitTextToSize(options.originalContent, maxWidth);
    
    for (const line of originalLines) {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      
      doc.text(line, margin, yPosition);
      yPosition += 7;
    }
  }
  
  return doc.output("blob");
}

/**
 * Export document as Word (.docx)
 */
export async function exportToWord(options: DocumentExportOptions): Promise<Blob> {
  const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer } = await import("docx");
  
  const paragraphs: any[] = [];
  
  // Add title
  paragraphs.push(
    new Paragraph({
      text: options.title,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );
  
  // Add metadata if provided
  if (options.metadata) {
    if (options.metadata.author) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Author: ${options.metadata.author}`,
              italics: true,
            }),
          ],
          spacing: { after: 200 },
        })
      );
    }
    
    if (options.metadata.createdDate) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Date: ${options.metadata.createdDate.toLocaleDateString()}`,
              italics: true,
            }),
          ],
          spacing: { after: 400 },
        })
      );
    }
  }
  
  // Add content paragraphs
  const contentParagraphs = options.content.split("\n\n");
  for (const para of contentParagraphs) {
    if (para.trim()) {
      paragraphs.push(
        new Paragraph({
          text: para.trim(),
          spacing: { after: 200 },
        })
      );
    }
  }
  
  // Add original content section if provided
  if (options.originalContent) {
    paragraphs.push(
      new Paragraph({
        text: "Original Content",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 600, after: 400 },
      })
    );
    
    const originalParagraphs = options.originalContent.split("\n\n");
    for (const para of originalParagraphs) {
      if (para.trim()) {
        paragraphs.push(
          new Paragraph({
            text: para.trim(),
            spacing: { after: 200 },
          })
        );
      }
    }
  }
  
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });
  
  return await Packer.toBlob(doc);
}

/**
 * Export document in specified format
 */
export async function exportDocument(options: DocumentExportOptions): Promise<Blob> {
  if (options.format === "pdf") {
    return await exportToPDF(options);
  } else if (options.format === "docx") {
    return await exportToWord(options);
  } else {
    throw new Error(`Unsupported export format: ${options.format}`);
  }
}

/**
 * Download exported document
 */
export function downloadDocument(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
