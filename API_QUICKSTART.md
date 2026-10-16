# API Quick Start Guide - Esia Mvetsetsa

This guide will help you quickly set up and start using the Translation and Summarization APIs.

## 📋 Prerequisites

1. Node.js and npm installed
2. API keys for the services you want to use

## 🔑 Step 1: Get Your API Keys

### Google Cloud Translation API (Required for Translation)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the "Cloud Translation API"
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy your API key

### OpenAI API (Required for AI Summarization)

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Add a payment method (required)
4. Go to "API Keys" and create a new key
5. Copy your API key

### Anthropic Claude API (Optional Alternative)

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up for API access
3. Create an API key
4. Copy your API key

## 🔧 Step 2: Configure Environment Variables

Open the `.env` file in the project root and add your API keys:

```bash
# Translation API - Google Cloud Translation
GOOGLE_TRANSLATE_API_KEY="your_google_key_here"
VITE_GOOGLE_TRANSLATE_API_KEY="your_google_key_here"

# AI Summarization - OpenAI
OPENAI_API_KEY="your_openai_key_here"
VITE_OPENAI_API_KEY="your_openai_key_here"

# AI Summarization - Anthropic Claude (Optional)
ANTHROPIC_API_KEY="your_anthropic_key_here"
VITE_ANTHROPIC_API_KEY="your_anthropic_key_here"
```

**Important:** Both the regular and `VITE_` prefixed versions are needed for server-side and client-side usage.

## 🚀 Step 3: Quick Usage Examples

### Example 1: Translate Text

```typescript
import { translateText } from "@/api/translation";

// Translate English to Chichewa
const result = await translateText(
  "Environmental impact assessment",
  "ny", // Chichewa
  "en"  // English
);

console.log(result.translatedText); // Chichewa translation
```

### Example 2: Summarize Document

```typescript
import { summarizeDocument } from "@/api/summarization";

const summary = await summarizeDocument(
  longDocumentText,
  500,      // Max 500 characters
  "en",     // English
  "openai"  // Use OpenAI
);

console.log(summary.summary);
```

### Example 3: Process Uploaded File

```typescript
import { processDocument } from "@/api/document-processor";

const handleUpload = async (file: File) => {
  const doc = await processDocument(file);
  console.log(doc.text);      // Extracted text
  console.log(doc.wordCount); // Word count
};
```

### Example 4: Complete Workflow (React Component)

```typescript
import { useState } from "react";
import { useDocumentProcessor } from "@/hooks/useDocumentProcessor";
import { useTranslation } from "@/hooks/useTranslation";
import { useSummarization } from "@/hooks/useSummarization";
import { Button } from "@/components/ui/button";

function DocumentTranslator() {
  const [result, setResult] = useState<string>("");
  const { process, exportDoc, isProcessing } = useDocumentProcessor();
  const { translateDoc, isTranslating } = useTranslation();
  const { summarize, isSummarizing } = useSummarization();

  const handleFile = async (file: File) => {
    // 1. Extract text
    const doc = await process(file);
    if (!doc) return;

    // 2. Translate to Chichewa
    const translation = await translateDoc(doc.text, "ny", "en");
    if (!translation) return;

    // 3. Summarize
    const summary = await summarize(
      translation.translatedText,
      500,
      "ny"
    );

    if (summary) {
      setResult(summary.summary);
      
      // 4. Export as PDF
      await exportDoc({
        format: "pdf",
        title: "Environmental Assessment - Chichewa",
        content: summary.summary,
        originalContent: translation.translatedText
      });
    }
  };

  const isLoading = isProcessing || isTranslating || isSummarizing;

  return (
    <div>
      <input
        type="file"
        accept=".pdf,.docx,.txt"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        disabled={isLoading}
      />
      {isLoading && <p>Processing...</p>}
      {result && <div>{result}</div>}
    </div>
  );
}
```

## 🧪 Step 4: Test the APIs

### Test Translation
```bash
# Create a test file: test-translation.ts
import { translateText } from "./src/api/translation";

async function test() {
  const result = await translateText("Hello world", "ny", "en");
  console.log(result);
}

test();
```

### Test Summarization
```bash
# Create a test file: test-summarization.ts
import { summarizeDocument } from "./src/api/summarization";

async function test() {
  const text = "Your long environmental assessment text here...";
  const result = await summarizeDocument(text, 300, "en", "openai");
  console.log(result);
}

test();
```

## 📊 API Response Examples

### Translation Response
```json
{
  "translatedText": "Kuwunika zakukhudza chilengedwe",
  "sourceLang": "en",
  "targetLang": "ny"
}
```

### Summarization Response
```json
{
  "summary": "This environmental impact assessment evaluates...",
  "originalLength": 15000,
  "summaryLength": 450
}
```

### Document Processing Response
```json
{
  "text": "Extracted document content...",
  "fileName": "report.pdf",
  "fileType": "pdf",
  "pageCount": 25,
  "wordCount": 5432
}
```

## 🔍 Common Issues and Solutions

### Issue: "Translation API key not configured"
**Solution:** Make sure both `GOOGLE_TRANSLATE_API_KEY` and `VITE_GOOGLE_TRANSLATE_API_KEY` are set in `.env`

### Issue: "OpenAI API key not configured"
**Solution:** Make sure both `OPENAI_API_KEY` and `VITE_OPENAI_API_KEY` are set in `.env`

### Issue: API calls failing with 401 Unauthorized
**Solution:** Check that your API keys are valid and have proper billing enabled

### Issue: Large documents failing to translate
**Solution:** Use `translateDocument()` instead of `translateText()` for documents over 5000 characters

### Issue: Rate limit errors
**Solution:** Implement delays between API calls or use batch processing

## 💰 Cost Estimation

### Google Translation API
- **Free tier:** 500,000 characters/month
- **After free tier:** $20 per million characters
- **Example:** 100-page document (~50,000 words) ≈ $1-2

### OpenAI API (GPT-4o-mini)
- **Cost:** ~$0.15 per million input tokens
- **Example:** Summarizing 100-page document ≈ $0.10-0.20

### Total Cost Example
Translating and summarizing a typical environmental impact assessment (200 pages):
- Translation: ~$2-4
- Summarization: ~$0.20-0.40
- **Total: ~$2.20-4.40 per document**

## 🎯 Next Steps

1. ✅ Configure your API keys in `.env`
2. ✅ Test the APIs with sample data
3. ✅ Integrate into your React components
4. ✅ Add error handling and user feedback
5. ✅ Implement caching for frequently translated content
6. ✅ Monitor API usage and costs

## 📚 Additional Resources

- [Full API Documentation](./API_DOCUMENTATION.md)
- [Google Cloud Translation Docs](https://cloud.google.com/translate/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [React Hooks Guide](https://react.dev/reference/react)

## 🆘 Need Help?

If you encounter issues:
1. Check the console for error messages
2. Verify API keys are correct
3. Check API quota and billing
4. Review the full API documentation
5. Test with smaller documents first

---

**Ready to go!** Your translation and summarization APIs are now set up and ready to use. 🎉
