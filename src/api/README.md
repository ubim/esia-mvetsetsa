# API Modules - Esia Mvetsetsa

This directory contains all API modules for translation, summarization, and document processing.

## 📁 Directory Structure

```
src/api/
├── index.ts                    # Main exports
├── translation.ts              # Translation API
├── summarization.ts            # Document summarization API
├── document-processor.ts       # Document processing & export
├── routes/                     # API route handlers
│   ├── translate.ts           # POST /api/translate
│   ├── summarize.ts           # POST /api/summarize
│   └── process-document.ts    # POST /api/process-document
└── README.md                   # This file
```

## 🔧 Modules Overview

### 1. Translation API (`translation.ts`)

Handles text translation from English to Chichewa using Google Cloud Translation API.

**Key Functions:**
- `translateText()` - Translate single text
- `translateDocument()` - Translate large documents in chunks
- `batchTranslate()` - Translate multiple texts at once

**Usage:**
```typescript
import { translateText } from "@/api/translation";

const result = await translateText("Hello", "ny", "en");
```

### 2. Summarization API (`summarization.ts`)

Creates summaries of environmental impact assessment documents using AI.

**Key Functions:**
- `summarizeDocument()` - Main summarization function
- `summarizeWithOpenAI()` - Use OpenAI GPT models
- `summarizeWithClaude()` - Use Anthropic Claude
- `extractiveSummarize()` - Simple extraction (no API needed)
- `generateStructuredSummary()` - Get key points, findings, recommendations

**Usage:**
```typescript
import { summarizeDocument } from "@/api/summarization";

const result = await summarizeDocument(text, 500, "en", "openai");
```

### 3. Document Processor API (`document-processor.ts`)

Handles document upload, text extraction, and format conversion.

**Key Functions:**
- `processDocument()` - Extract text from PDF/DOCX/TXT
- `extractTextFromPDF()` - PDF text extraction
- `extractTextFromWord()` - Word document extraction
- `exportDocument()` - Export to PDF or DOCX
- `exportToPDF()` - Create PDF from content
- `exportToWord()` - Create Word document
- `downloadDocument()` - Trigger browser download

**Usage:**
```typescript
import { processDocument, exportDocument } from "@/api/document-processor";

// Extract text
const doc = await processDocument(file);

// Export to PDF
const blob = await exportDocument({
  format: "pdf",
  title: "My Document",
  content: "Document content..."
});
```

## 🔌 API Routes

API routes are designed for TanStack Start and handle HTTP requests.

### POST /api/translate

Translate text via HTTP endpoint.

**Request:**
```json
{
  "text": "Hello world",
  "sourceLang": "en",
  "targetLang": "ny",
  "mode": "single"
}
```

### POST /api/summarize

Summarize text via HTTP endpoint.

**Request:**
```json
{
  "text": "Long document...",
  "maxLength": 500,
  "language": "en",
  "provider": "openai"
}
```

### POST /api/process-document

Process uploaded document.

**Request:** `multipart/form-data` with `file` field

## 🎣 React Hooks

Corresponding React hooks are available in `src/hooks/`:

- `useTranslation()` - Translation hook
- `useSummarization()` - Summarization hook
- `useDocumentProcessor()` - Document processing hook

**Example:**
```typescript
import { useTranslation } from "@/hooks/useTranslation";

function MyComponent() {
  const { translate, isTranslating, error } = useTranslation();
  
  const handleClick = async () => {
    const result = await translate("Hello");
    console.log(result?.translatedText);
  };
  
  return <button onClick={handleClick}>Translate</button>;
}
```

## ⚙️ Configuration

All API modules require environment variables to be set in `.env`:

```bash
# Google Cloud Translation
GOOGLE_TRANSLATE_API_KEY="your_key"
VITE_GOOGLE_TRANSLATE_API_KEY="your_key"

# OpenAI
OPENAI_API_KEY="your_key"
VITE_OPENAI_API_KEY="your_key"

# Anthropic Claude (optional)
ANTHROPIC_API_KEY="your_key"
VITE_ANTHROPIC_API_KEY="your_key"
```

## 🚀 Getting Started

1. **Install dependencies** (already done if you ran `npm install`)
2. **Get API keys** from Google Cloud and OpenAI
3. **Configure `.env`** with your API keys
4. **Import and use** the APIs in your components

## 📖 Documentation

- **Quick Start:** See [API_QUICKSTART.md](../../API_QUICKSTART.md)
- **Full Documentation:** See [API_DOCUMENTATION.md](../../API_DOCUMENTATION.md)

## 🔒 Security Notes

- Never commit `.env` file to version control
- API keys are sensitive - keep them secure
- Use server-side routes for sensitive operations
- Implement rate limiting in production
- Monitor API usage and costs

## 🧪 Testing

To test the APIs:

```typescript
// Test translation
import { translateText } from "@/api/translation";
const result = await translateText("test", "ny", "en");
console.log(result);

// Test summarization
import { summarizeDocument } from "@/api/summarization";
const summary = await summarizeDocument("Long text...", 500);
console.log(summary);

// Test document processing
import { processDocument } from "@/api/document-processor";
const doc = await processDocument(myFile);
console.log(doc.text);
```

## 🐛 Error Handling

All API functions return objects with an optional `error` property:

```typescript
const result = await translateText("Hello");

if (result.error) {
  console.error("Error:", result.error);
} else {
  console.log("Success:", result.translatedText);
}
```

## 📊 Response Types

All modules export TypeScript interfaces for type safety:

```typescript
import type {
  TranslationResponse,
  SummarizationResponse,
  ProcessedDocument,
  DocumentExportOptions
} from "@/api";
```

## 🎯 Best Practices

1. **Use hooks in React components** for automatic state management
2. **Cache translations** to avoid redundant API calls
3. **Handle errors gracefully** with user-friendly messages
4. **Show loading states** during API calls
5. **Implement retry logic** for failed requests
6. **Monitor API costs** in production

## 🔄 Version History

- **v1.0.0** - Initial implementation with translation, summarization, and document processing

## 📞 Support

For issues or questions:
1. Check the documentation files
2. Review error messages in console
3. Verify API keys and configuration
4. Test with smaller documents first

---

**Happy coding!** 🚀
