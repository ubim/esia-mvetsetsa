/**
 * API Index
 * Central export for all API modules
 */

// Translation API
export {
  translateText,
  translateWithMyMemory,
  translateDocument,
  batchTranslate,
  type TranslationRequest,
  type TranslationResponse,
} from "./translation";

// Summarization API
export {
  summarizeDocument,
  summarizeWithHuggingFace,
  extractiveSummarize,
  generateStructuredSummary,
  type SummarizationRequest,
  type SummarizationResponse,
} from "./summarization";

// Document Processing API
export {
  processDocument,
  extractTextFromPDF,
  extractTextFromWord,
  extractTextFromPlainText,
  exportDocument,
  exportToPDF,
  exportToWord,
  downloadDocument,
  type ProcessedDocument,
  type DocumentExportOptions,
} from "./document-processor";
