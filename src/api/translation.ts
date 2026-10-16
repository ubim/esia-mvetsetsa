/**
 * Translation API
 * Handles translation from English to Chichewa using FREE APIs
 */

import { json } from "@tanstack/react-start";

export interface TranslationRequest {
  text: string;
  sourceLang?: string;
  targetLang?: string;
}

export interface TranslationResponse {
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  error?: string;
}

/**
 * Translate text using LibreTranslate (FREE, open-source)
 * Multiple public instances available
 */
export async function translateText(
  text: string,
  targetLang: string = "ny", // Chichewa language code
  sourceLang: string = "en"
): Promise<TranslationResponse> {
  try {
    // Try multiple LibreTranslate instances in order
    const instances = [
      "https://libretranslate.com/translate",
      "https://translate.argosopentech.com/translate",
      "https://translate.terraprint.co/translate",
    ];

    let lastError: Error | null = null;

    for (const instance of instances) {
      try {
        const response = await fetch(instance, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            q: text,
            source: sourceLang,
            target: targetLang,
            format: "text",
          }),
        });

        if (!response.ok) {
          continue; // Try next instance
        }

        const data = await response.json();
        const translatedText = data.translatedText;

        return {
          translatedText,
          sourceLang,
          targetLang,
        };
      } catch (err) {
        lastError = err instanceof Error ? err : new Error("Translation failed");
        continue; // Try next instance
      }
    }

    // If all instances failed, throw the last error
    throw lastError || new Error("All translation services unavailable");
  } catch (error) {
    console.error("Translation error:", error);
    return {
      translatedText: "",
      sourceLang,
      targetLang,
      error: error instanceof Error ? error.message : "Translation failed",
    };
  }
}

/**
 * Translate using MyMemory Translation API (FREE, no API key needed)
 * Good fallback option with 10,000 words/day limit per IP
 */
export async function translateWithMyMemory(
  text: string,
  targetLang: string = "ny",
  sourceLang: string = "en"
): Promise<TranslationResponse> {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("MyMemory translation failed");
    }

    const data = await response.json();
    
    if (data.responseStatus !== 200) {
      throw new Error(data.responseDetails || "Translation failed");
    }

    const translatedText = data.responseData.translatedText;

    return {
      translatedText,
      sourceLang,
      targetLang,
    };
  } catch (error) {
    console.error("MyMemory translation error:", error);
    return {
      translatedText: "",
      sourceLang,
      targetLang,
      error: error instanceof Error ? error.message : "Translation failed",
    };
  }
}

/**
 * Translate large documents in chunks to avoid API limits
 * Automatically uses free APIs with delays to respect rate limits
 */
export async function translateDocument(
  text: string,
  targetLang: string = "ny",
  sourceLang: string = "en",
  chunkSize: number = 500 // Smaller chunks for free APIs
): Promise<TranslationResponse> {
  try {
    // Split text into chunks if it's too long
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.substring(i, i + chunkSize));
    }

    // Translate each chunk with delay to avoid rate limiting
    const translatedChunks: string[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      // Add delay between requests (1 second) to avoid rate limiting
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const result = await translateText(chunk, targetLang, sourceLang);
      if (result.error) {
        // Try MyMemory as fallback
        const fallback = await translateWithMyMemory(chunk, targetLang, sourceLang);
        if (fallback.error) {
          throw new Error(result.error);
        }
        translatedChunks.push(fallback.translatedText);
      } else {
        translatedChunks.push(result.translatedText);
      }
    }

    return {
      translatedText: translatedChunks.join(" "),
      sourceLang,
      targetLang,
    };
  } catch (error) {
    console.error("Document translation error:", error);
    return {
      translatedText: "",
      sourceLang,
      targetLang,
      error: error instanceof Error ? error.message : "Document translation failed",
    };
  }
}

/**
 * Batch translate multiple strings using free APIs
 */
export async function batchTranslate(
  texts: string[],
  targetLang: string = "ny",
  sourceLang: string = "en"
): Promise<TranslationResponse[]> {
  try {
    const results: TranslationResponse[] = [];
    
    for (let i = 0; i < texts.length; i++) {
      // Add delay between requests
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const result = await translateText(texts[i], targetLang, sourceLang);
      results.push(result);
    }
    
    return results;
  } catch (error) {
    console.error("Batch translation error:", error);
    return texts.map(() => ({
      translatedText: "",
      sourceLang,
      targetLang,
      error: error instanceof Error ? error.message : "Batch translation failed",
    }));
  }
}
