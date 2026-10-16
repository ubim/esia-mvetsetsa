/**
 * React Hook for Translation API
 */

import { useState } from "react";
import { translateText, translateDocument, TranslationResponse } from "../api/translation";

export function useTranslation() {
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translate = async (
    text: string,
    targetLang: string = "ny",
    sourceLang: string = "en"
  ): Promise<TranslationResponse | null> => {
    setIsTranslating(true);
    setError(null);

    try {
      const result = await translateText(text, targetLang, sourceLang);
      
      if (result.error) {
        setError(result.error);
        return null;
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Translation failed";
      setError(errorMessage);
      return null;
    } finally {
      setIsTranslating(false);
    }
  };

  const translateDoc = async (
    text: string,
    targetLang: string = "ny",
    sourceLang: string = "en"
  ): Promise<TranslationResponse | null> => {
    setIsTranslating(true);
    setError(null);

    try {
      const result = await translateDocument(text, targetLang, sourceLang);
      
      if (result.error) {
        setError(result.error);
        return null;
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Document translation failed";
      setError(errorMessage);
      return null;
    } finally {
      setIsTranslating(false);
    }
  };

  return {
    translate,
    translateDoc,
    isTranslating,
    error,
  };
}
