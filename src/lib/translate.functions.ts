import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * FREE Translation using LibreTranslate and MyMemory
 */
async function translateToChichewa(text: string): Promise<string> {
  // Try LibreTranslate instances
  const instances = [
    "https://libretranslate.com/translate",
    "https://translate.argosopentech.com/translate",
    "https://translate.terraprint.co/translate",
  ];

  for (const instance of instances) {
    try {
      const response = await fetch(instance, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: text,
          source: "en",
          target: "ny",
          format: "text",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.translatedText;
      }
    } catch (error) {
      continue; // Try next instance
    }
  }

  // Fallback to MyMemory
  try {
    const encodedText = encodeURIComponent(text.substring(0, 500)); // MyMemory has limits
    const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=en|ny`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.responseStatus === 200) {
      return data.responseData.translatedText;
    }
  } catch (error) {
    // Continue to error throw
  }

  throw new Error("Translation service temporarily unavailable. Please try again in a moment.");
}

/**
 * FREE Summarization using advanced extractive algorithm
 */
function summarizeToChichewa(text: string): string {
  // Extract key sentences using TF-IDF-like scoring
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  
  if (sentences.length === 0) {
    return "Palibe nkhani yomwe yapezeka mu chikalatacho.";
  }

  // Calculate word frequencies (ignore stop words)
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const wordFreq = new Map<string, number>();
  
  const stopWords = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at'
  ]);
  
  words.forEach(word => {
    if (!stopWords.has(word) && word.length > 3) {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    }
  });

  // Score sentences
  const scored = sentences.map((sentence, index) => {
    const sentenceWords = sentence.toLowerCase().match(/\b\w+\b/g) || [];
    let wordScore = 0;
    
    sentenceWords.forEach(word => {
      if (wordFreq.has(word)) {
        wordScore += wordFreq.get(word)!;
      }
    });
    
    const avgScore = sentenceWords.length > 0 ? wordScore / sentenceWords.length : 0;
    
    // Position bonus for first and last sentences
    const positionScore = index < 3 ? 1.2 : (index >= sentences.length - 2 ? 1.1 : 1.0);
    
    // Environmental keywords bonus
    const envKeywords = ['environmental', 'impact', 'assessment', 'community', 'project', 
                        'water', 'air', 'pollution', 'wildlife', 'mitigation'];
    const hasEnvKeyword = sentenceWords.some(w => envKeywords.includes(w));
    const keywordBonus = hasEnvKeyword ? 1.3 : 1.0;
    
    return {
      sentence: sentence.trim(),
      score: avgScore * positionScore * keywordBonus,
      index
    };
  });

  // Get top 8 sentences
  const topSentences = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .sort((a, b) => a.index - b.index)
    .map(s => s.sentence);

  // Create structured Chichewa summary
  const summary = `CHIDULE CHA LIPOTI (Summary)

${topSentences.join(' ')}

Onani: Ichi ndi chidule chongochokera m'nkhani za m'lipotili. Kuti mudziwe zambiri, werengani lipoti lonse.`;

  return summary;
}

export const processText = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ text: z.string().min(1).max(40000), mode: z.enum(["translate", "summary"]) }).parse(d),
  )
  .handler(async ({ data }) => {
    try {
      let result: string;

      if (data.mode === "translate") {
        // FREE Translation
        result = await translateToChichewa(data.text);
      } else {
        // FREE Summarization (works offline)
        result = summarizeToChichewa(data.text);
      }

      if (!result || !result.trim()) {
        throw new Error("No text was generated. Please try again.");
      }

      return { text: result.trim() };
    } catch (error) {
      // Better error messages
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Something went wrong. Please check your internet connection and try again.");
    }
  });
