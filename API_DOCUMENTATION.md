# API Documentation - Esia Mvetsetsa

This document provides comprehensive information about the Translation and Document Summarization APIs implemented for the Esia Mvetsetsa application.

## Overview

The application provides three main API services:
1. **Translation API** - Translates text from English to Chichewa
2. **Summarization API** - Creates summaries of environmental impact assessment documents
3. **Document Processing API** - Handles document upload, text extraction, and export

## Table of Contents

- [Setup](#setup)
- [Translation API](#translation-api)
- [Summarization API](#summarization-api)
- [Document Processing API](#document-processing-api)
- [React Hooks](#react-hooks)
- [API Routes](#api-routes)
- [Error Handling](#error-handling)

---

## Setup

### Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Google Cloud Translation API (Required for translation)
GOOGLE_TRANSLATE_API_KEY=your_google_translate_api_key_here
VITE_GOOGLE_TRANSLATE_API_KEY=your_google_translate_api_key_here

# OpenAI API (Required for AI-powered summarization)
OPENAI_API_KEY=your_openai_api_key_here
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Anthropic Claude API (Optional - alternative to OpenAI)
ANTHROPIC_API_KEY=your_anthropic_api_key_here
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### Getting API Keys

1. **Google Cloud Translation API**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the Cloud Translation API
   - Create credentials (API Key)
   - Copy the API key to your `.env` file

2. **OpenAI API**
   - Visit [OpenAI Platform](https://platform.openai.com/)
   - Create an account and add payment method
   - Generate an API key from the API keys section
   - Copy the API key to your `.env` file

3. **Anthropic Claude API** (Optional)
   - Visit [Anthropic Console](https://console.anthropic.com/)
   - Create an account and get API access
   - Generate an API key
   - Copy the API key to your `.env` file

---

## Translation API

### Functions

#### `translateText(text, targetLang, sourceLang)`

Translates a single text string.

**Parameters:**
- `text` (string): The text to translate
- `targetLang` (string, optional): Target language code (default: "ny" for Chichewa)
- `sourceLang` (string, optional): Source language code (default: "en" for English)

**Returns:** `Promise<TranslationResponse>`

**Example:**
```typescript
import { translateText } from "@/api/translation";

const result = await translateText("Hello, how are you?", "ny", "en");
console.log(result.translatedText); // Chichewa translation
```

#### `translateDocument(text, targetLang, sourceLang, chunkSize)`

Translates large documents by breaking them into chunks.

**Parameters:**
- `text` (string): The document text to translate
- `targetLang` (string, optional): Target language code (default: "ny")
- `sourceLang` (string, optional): Source language code (default: "en")
- `chunkSize` (number, optional): Maximum characters per chunk (default: 5000)

**Returns:** `Promise<TranslationResponse>`

**Example:**
```typescript
import { translateDocument } from "@/api/translation";

const result = await translateDocument(longDocumentText);
console.log(result.translatedText); // Full document translated
```

#### `batchTranslate(texts, targetLang, sourceLang)`

Translates multiple strings in a single API call.

**Parameters:**
- `texts` (string[]): Array of texts to translate
- `targetLang` (string, optional): Target language code (default: "ny")
- `sourceLang` (string, optional): Source language code (default: "en")

**Returns:** `Promise<TranslationResponse[]>`

**Example:**
```typescript
import { batchTranslate } from "@/api/translation";

const results = await batchTranslate([
  "Environmental impact",
  "Community assessment",
  "Sustainability report"
]);
```

### TypeScript Interfaces

```typescript
interface TranslationResponse {
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  error?: string;
}
```

---

## Summarization API

### Functions

#### `summarizeDocument(text, maxLength, language, provider)`

Summarizes a document using AI.

**Parameters:**
- `text` (string): The document text to summarize
- `maxLength` (number, optional): Maximum summary length in characters (default: 500)
- `language` (string, optional): Language for summary (default: "en")
- `provider` ("openai" | "claude" | "extractive", optional): AI provider (default: "openai")

**Returns:** `Promise<SummarizationResponse>`

**Example:**
```typescript
import { summarizeDocument } from "@/api/summarization";

const result = await summarizeDocument(documentText, 500, "en", "openai");
console.log(result.summary);
```

#### `summarizeWithOpenAI(text, maxLength, language)`

Summarizes using OpenAI GPT models.

**Parameters:**
- `text` (string): The text to summarize
- `maxLength` (number, optional): Maximum summary length (default: 500)
- `language` (string, optional): Language code (default: "en")

**Returns:** `Promise<SummarizationResponse>`

#### `summarizeWithClaude(text, maxLength, language)`

Summarizes using Anthropic Claude models.

**Parameters:**
- `text` (string): The text to summarize
- `maxLength` (number, optional): Maximum summary length (default: 500)
- `language` (string, optional): Language code (default: "en")

**Returns:** `Promise<SummarizationResponse>`

#### `extractiveSummarize(text, numSentences)`

Simple extractive summarization without external APIs.

**Parameters:**
- `text` (string): The text to summarize
- `numSentences` (number, optional): Number of sentences to extract (default: 5)

**Returns:** `SummarizationResponse`

#### `generateStructuredSummary(text, language)`

Creates a structured summary with key points, findings, and recommendations.

**Parameters:**
- `text` (string): The document text
- `language` (string, optional): Language code (default: "en")

**Returns:** `Promise<StructuredSummary>`

**Example:**
```typescript
import { generateStructuredSummary } from "@/api/summarization";

const result = await generateStructuredSummary(documentText, "en");
console.log(result.keyPoints);        // Array of key points
console.log(result.mainFindings);     // Main findings text
console.log(result.recommendations);  // Recommendations text
```

### TypeScript Interfaces

```typescript
interface SummarizationResponse {
  summary: string;
  originalLength: number;
  summaryLength: number;
  error?: string;
}

interface StructuredSummary {
  keyPoints: string[];
  mainFindings: string;
  recommendations: string;
  error?: string;
}
```

---

## Document Processing API

### Functions

#### `processDocument(file)`

Extracts text from uploaded documents (PDF, DOCX, TXT).

**Parameters:**
- `file` (File): The uploaded file

**Returns:** `Promise<ProcessedDocument>`

**Example:**
```typescript
import { processDocument } from "@/api/document-processor";

const handleFileUpload = async (file: File) => {
  const result = await processDocument(file);
  console.log(result.text);      // Extracted text
  console.log(result.wordCount); // Word count
};
```

#### `extractTextFromPDF(file)`

Extracts text specifically from PDF files.

**Parameters:**
- `file` (File | ArrayBuffer): PDF file or array buffer

**Returns:** `Promise<ProcessedDocument>`

#### `extractTextFromWord(file)`

Extracts text from Word (.docx) files.

**Parameters:**
- `file` (File | ArrayBuffer): Word file or array buffer

**Returns:** `Promise<ProcessedDocument>`

#### `extractTextFromPlainText(file)`

Extracts text from plain text files.

**Parameters:**
- `file` (File): Text file

**Returns:** `Promise<ProcessedDocument>`

#### `exportDocument(options)`

Exports content to PDF or Word format.

**Parameters:**
- `options` (DocumentExportOptions): Export configuration

**Returns:** `Promise<Blob>`

**Example:**
```typescript
import { exportDocument } from "@/api/document-processor";

const blob = await exportDocument({
  format: "pdf",
  title: "Environmental Impact Assessment",
  content: translatedText,
  originalContent: originalText,
  metadata: {
    author: "Esia Mvetsetsa",
    subject: "Translation and Summary",
    createdDate: new Date()
  }
});
```

#### `downloadDocument(blob, fileName)`

Triggers browser download of the exported document.

**Parameters:**
- `blob` (Blob): Document blob
- `fileName` (string): Desired file name

**Returns:** `void`

### TypeScript Interfaces

```typescript
interface ProcessedDocument {
  text: string;
  fileName: string;
  fileType: string;
  pageCount?: number;
  wordCount: number;
  error?: string;
}

interface DocumentExportOptions {
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
```

---

## React Hooks

### `useTranslation()`

Hook for translation functionality.

**Returns:**
```typescript
{
  translate: (text: string, targetLang?: string, sourceLang?: string) => Promise<TranslationResponse | null>;
  translateDoc: (text: string, targetLang?: string, sourceLang?: string) => Promise<TranslationResponse | null>;
  isTranslating: boolean;
  error: string | null;
}
```

**Example:**
```typescript
import { useTranslation } from "@/hooks/useTranslation";

function MyComponent() {
  const { translate, isTranslating, error } = useTranslation();
  
  const handleTranslate = async () => {
    const result = await translate("Hello world");
    if (result) {
      console.log(result.translatedText);
    }
  };
  
  return (
    <button onClick={handleTranslate} disabled={isTranslating}>
      {isTranslating ? "Translating..." : "Translate"}
    </button>
  );
}
```

### `useSummarization()`

Hook for summarization functionality.

**Returns:**
```typescript
{
  summarize: (text: string, maxLength?: number, language?: string, provider?: string) => Promise<SummarizationResponse | null>;
  summarizeStructured: (text: string, language?: string) => Promise<StructuredSummary | null>;
  isSummarizing: boolean;
  error: string | null;
}
```

### `useDocumentProcessor()`

Hook for document processing.

**Returns:**
```typescript
{
  process: (file: File) => Promise<ProcessedDocument | null>;
  exportDoc: (options: DocumentExportOptions, fileName?: string) => Promise<boolean>;
  isProcessing: boolean;
  isExporting: boolean;
  error: string | null;
}
```

---

## API Routes

### POST /api/translate

Translate text via HTTP endpoint.

**Request Body:**
```json
{
  "text": "Hello world",
  "sourceLang": "en",
  "targetLang": "ny",
  "mode": "single"
}
```

**Modes:**
- `"single"` - Single text translation
- `"document"` - Large document translation
- `"batch"` - Multiple texts (use `texts` array instead of `text`)

**Response:**
```json
{
  "success": true,
  "data": {
    "translatedText": "Moni dziko",
    "sourceLang": "en",
    "targetLang": "ny"
  }
}
```

### POST /api/summarize

Summarize text via HTTP endpoint.

**Request Body:**
```json
{
  "text": "Long document text...",
  "maxLength": 500,
  "language": "en",
  "provider": "openai",
  "mode": "simple"
}
```

**Modes:**
- `"simple"` - Simple summary
- `"structured"` - Structured summary with key points

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": "This document discusses...",
    "originalLength": 5000,
    "summaryLength": 450
  }
}
```

### POST /api/process-document

Process uploaded document via HTTP endpoint.

**Request:** `multipart/form-data` with `file` field

**Response:**
```json
{
  "success": true,
  "data": {
    "text": "Extracted document text...",
    "fileName": "report.pdf",
    "fileType": "pdf",
    "pageCount": 25,
    "wordCount": 5432
  }
}
```

---

## Error Handling

All API functions follow consistent error handling:

1. **Return Value Errors**: Functions return objects with an `error` property
2. **Thrown Exceptions**: Wrapped in try-catch blocks
3. **HTTP Status Codes**: API routes return appropriate status codes

**Example Error Handling:**
```typescript
const result = await translateText("Hello");

if (result.error) {
  console.error("Translation failed:", result.error);
  // Handle error
} else {
  console.log("Translation:", result.translatedText);
  // Use translation
}
```

---

## Usage Example: Complete Workflow

```typescript
import { useDocumentProcessor } from "@/hooks/useDocumentProcessor";
import { useTranslation } from "@/hooks/useTranslation";
import { useSummarization } from "@/hooks/useSummarization";

function DocumentTranslator() {
  const { process, exportDoc } = useDocumentProcessor();
  const { translateDoc } = useTranslation();
  const { summarize } = useSummarization();
  
  const handleDocument = async (file: File) => {
    // 1. Extract text from document
    const doc = await process(file);
    if (!doc) return;
    
    // 2. Translate to Chichewa
    const translation = await translateDoc(doc.text);
    if (!translation) return;
    
    // 3. Generate summary in Chichewa
    const summary = await summarize(
      translation.translatedText,
      500,
      "ny"
    );
    
    // 4. Export as PDF
    await exportDoc({
      format: "pdf",
      title: "Translated Environmental Report",
      content: summary?.summary || "",
      originalContent: translation.translatedText
    });
  };
  
  return (
    <input
      type="file"
      onChange={(e) => e.target.files?.[0] && handleDocument(e.target.files[0])}
    />
  );
}
```

---

## Language Codes

- **English**: `en`
- **Chichewa (Nyanja)**: `ny`

For additional languages, refer to [ISO 639-1 Language Codes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes).

---

## API Limits and Costs

### Google Cloud Translation API
- Free tier: 500,000 characters per month
- Cost: $20 per million characters after free tier
- Rate limit: Varies by project

### OpenAI API
- Cost: Varies by model (GPT-4o-mini is cost-effective)
- Rate limit: Depends on account tier
- Recommended for production use

### Anthropic Claude API
- Cost: Competitive with OpenAI
- Rate limit: Depends on account tier
- Good alternative to OpenAI

---

## Best Practices

1. **Caching**: Cache translations to avoid redundant API calls
2. **Chunking**: Break large documents into smaller chunks
3. **Error Recovery**: Implement retry logic for failed requests
4. **Rate Limiting**: Respect API rate limits
5. **User Feedback**: Show progress indicators for long operations
6. **Offline Fallback**: Use extractive summarization when AI APIs are unavailable

---

## Troubleshooting

### Translation not working
- Verify `GOOGLE_TRANSLATE_API_KEY` is set correctly
- Check if API is enabled in Google Cloud Console
- Verify billing is enabled for your project

### Summarization not working
- Verify `OPENAI_API_KEY` is set correctly
- Check account has credits available
- Try fallback to `extractive` provider

### Document processing errors
- Verify file format is supported (PDF, DOCX, TXT)
- Check file size is reasonable (<10MB recommended)
- Ensure file is not password-protected

---

## Support

For issues or questions, please refer to:
- Google Cloud Translation: https://cloud.google.com/translate/docs
- OpenAI API: https://platform.openai.com/docs
- Project repository: Check README.md

---

**Last Updated:** 2024
**Version:** 1.0.0
