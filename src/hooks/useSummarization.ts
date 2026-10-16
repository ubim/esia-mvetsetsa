/**
 * React Hook for Summarization API
 */

import { useState } from "react";
import { summarizeDocument, generateStructuredSummary, SummarizationResponse } from "../api/summarization";

export function useSummarization() {
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summarize = async (
    text: string,
    maxLength: number = 500,
    language: string = "en",
    provider: "huggingface" | "extractive" = "extractive"
  ): Promise<SummarizationResponse | null> => {
    setIsSummarizing(true);
    setError(null);

    try {
      const result = await summarizeDocument(text, maxLength, language, provider);
      
      if (result.error) {
        setError(result.error);
        return null;
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Summarization failed";
      setError(errorMessage);
      return null;
    } finally {
      setIsSummarizing(false);
    }
  };

  const summarizeStructured = async (
    text: string,
    language: string = "en"
  ): Promise<{
    keyPoints: string[];
    mainFindings: string;
    recommendations: string;
    error?: string;
  } | null> => {
    setIsSummarizing(true);
    setError(null);

    try {
      const result = await generateStructuredSummary(text, language);
      
      if (result.error) {
        setError(result.error);
        return null;
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Structured summarization failed";
      setError(errorMessage);
      return null;
    } finally {
      setIsSummarizing(false);
    }
  };

  return {
    summarize,
    summarizeStructured,
    isSummarizing,
    error,
  };
}
