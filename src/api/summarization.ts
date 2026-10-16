/**
 * Document Summarization API
 * Handles summarizing documents using FREE APIs and local algorithms
 */

export interface SummarizationRequest {
  text: string;
  maxLength?: number;
  language?: string;
}

export interface SummarizationResponse {
  summary: string;
  originalLength: number;
  summaryLength: number;
  error?: string;
}

/**
 * Summarize text using Hugging Face Inference API (FREE)
 * No API key required for basic usage
 */
export async function summarizeWithHuggingFace(
  text: string,
  maxLength: number = 500,
  language: string = "en"
): Promise<SummarizationResponse> {
  try {
    // Use Facebook's BART model for summarization (free)
    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: text.substring(0, 1024), // Limit input for free tier
          parameters: {
            max_length: Math.min(maxLength, 500),
            min_length: 50,
          },
        }),
      }
    );

    if (!response.ok) {
      // Model might be loading, try alternative
      throw new Error("Hugging Face API temporarily unavailable");
    }

    const data = await response.json();
    
    // Handle model loading state
    if (data.error && data.error.includes("loading")) {
      // Use extractive summarization as fallback
      return extractiveSummarize(text, 5);
    }

    const summary = data[0]?.summary_text || "";

    return {
      summary,
      originalLength: text.length,
      summaryLength: summary.length,
    };
  } catch (error) {
    console.error("Hugging Face summarization error:", error);
    // Fallback to extractive summarization
    return extractiveSummarize(text, 5);
  }
}

/**
 * Extractive summarization - extracts key sentences
 * This is FREE and doesn't require external APIs
 * Uses TF-IDF and sentence position scoring
 */
export function extractiveSummarize(
  text: string,
  numSentences: number = 5
): SummarizationResponse {
  try {
    // Split into sentences
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    
    if (sentences.length === 0) {
      throw new Error("No sentences found in text");
    }

    // If document is short, return first few sentences
    if (sentences.length <= numSentences) {
      const summary = sentences.join(" ").trim();
      return {
        summary,
        originalLength: text.length,
        summaryLength: summary.length,
      };
    }

    // Calculate word frequencies for TF-IDF-like scoring
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const wordFreq = new Map<string, number>();
    
    // Common stop words to ignore
    const stopWords = new Set([
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
      'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
      'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
      'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their'
    ]);
    
    words.forEach(word => {
      if (!stopWords.has(word) && word.length > 3) {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      }
    });

    // Score each sentence
    const scoredSentences = sentences.map((sentence, index) => {
      const sentenceWords = sentence.toLowerCase().match(/\b\w+\b/g) || [];
      
      // Calculate score based on word importance
      let wordScore = 0;
      sentenceWords.forEach(word => {
        if (wordFreq.has(word)) {
          wordScore += wordFreq.get(word)!;
        }
      });
      
      // Normalize by sentence length
      const avgWordScore = sentenceWords.length > 0 
        ? wordScore / sentenceWords.length 
        : 0;
      
      // Position score - first and last sentences are more important
      const totalSentences = sentences.length;
      let positionScore = 0;
      if (index < 3) {
        positionScore = 1.0; // First 3 sentences
      } else if (index >= totalSentences - 2) {
        positionScore = 0.8; // Last 2 sentences
      } else {
        positionScore = 0.5; // Middle sentences
      }
      
      // Length preference - not too short, not too long
      const words = sentenceWords.length;
      const lengthScore = words >= 10 && words <= 30 ? 1.0 : 0.7;
      
      // Keyword score - environmental, impact, assessment, etc.
      const keywords = ['environmental', 'impact', 'assessment', 'community', 'project', 
                       'significant', 'analysis', 'recommend', 'conclusion', 'finding'];
      const keywordScore = sentenceWords.some(w => keywords.includes(w)) ? 1.2 : 1.0;
      
      // Combined score
      const score = avgWordScore * positionScore * lengthScore * keywordScore;
      
      return { sentence: sentence.trim(), score, index };
    });

    // Sort by score and take top N
    const topSentences = scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, numSentences)
      .sort((a, b) => a.index - b.index) // Re-order by original position
      .map(s => s.sentence);

    const summary = topSentences.join(" ");

    return {
      summary,
      originalLength: text.length,
      summaryLength: summary.length,
    };
  } catch (error) {
    console.error("Extractive summarization error:", error);
    return {
      summary: "",
      originalLength: text.length,
      summaryLength: 0,
      error: error instanceof Error ? error.message : "Extractive summarization failed",
    };
  }
}

/**
 * Main summarization function with FREE options
 */
export async function summarizeDocument(
  text: string,
  maxLength: number = 500,
  language: string = "en",
  provider: "huggingface" | "extractive" = "extractive"
): Promise<SummarizationResponse> {
  switch (provider) {
    case "huggingface":
      return await summarizeWithHuggingFace(text, maxLength, language);
    case "extractive":
    default:
      return extractiveSummarize(text);
  }
}

/**
 * Generate a summary with key points using FREE methods
 * Uses advanced extractive techniques
 */
export async function generateStructuredSummary(
  text: string,
  language: string = "en"
): Promise<{
  keyPoints: string[];
  mainFindings: string;
  recommendations: string;
  error?: string;
}> {
  try {
    // Extract sentences and categorize them
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    
    if (sentences.length === 0) {
      throw new Error("No sentences found in text");
    }

    // Find key points (important sentences with keywords)
    const keywordPatterns = {
      keyPoints: ['significant', 'important', 'key', 'major', 'critical', 'essential', 'primary'],
      findings: ['found', 'showed', 'indicated', 'revealed', 'demonstrated', 'observed', 'analysis'],
      recommendations: ['recommend', 'suggest', 'should', 'propose', 'advise', 'must', 'necessary']
    };

    const categorizedSentences = {
      keyPoints: [] as string[],
      findings: [] as string[],
      recommendations: [] as string[]
    };

    sentences.forEach(sentence => {
      const lowerSentence = sentence.toLowerCase();
      
      // Categorize based on keywords
      if (keywordPatterns.recommendations.some(kw => lowerSentence.includes(kw))) {
        categorizedSentences.recommendations.push(sentence.trim());
      } else if (keywordPatterns.findings.some(kw => lowerSentence.includes(kw))) {
        categorizedSentences.findings.push(sentence.trim());
      } else if (keywordPatterns.keyPoints.some(kw => lowerSentence.includes(kw))) {
        categorizedSentences.keyPoints.push(sentence.trim());
      }
    });

    // If categories are empty, use extractive summarization to fill them
    if (categorizedSentences.keyPoints.length === 0) {
      const summary = extractiveSummarize(text, 5);
      const summarySentences = summary.summary.match(/[^.!?]+[.!?]+/g) || [];
      categorizedSentences.keyPoints = summarySentences.slice(0, 5).map(s => s.trim());
    }

    if (categorizedSentences.findings.length === 0) {
      // Take middle sentences as findings
      const middleStart = Math.floor(sentences.length * 0.3);
      const middleEnd = Math.floor(sentences.length * 0.6);
      categorizedSentences.findings = sentences.slice(middleStart, middleEnd)
        .slice(0, 3)
        .map(s => s.trim());
    }

    if (categorizedSentences.recommendations.length === 0) {
      // Take last few sentences as recommendations
      categorizedSentences.recommendations = sentences
        .slice(-3)
        .map(s => s.trim());
    }

    return {
      keyPoints: categorizedSentences.keyPoints.slice(0, 5),
      mainFindings: categorizedSentences.findings.slice(0, 3).join(" "),
      recommendations: categorizedSentences.recommendations.slice(0, 3).join(" "),
    };
  } catch (error) {
    console.error("Structured summary error:", error);
    return {
      keyPoints: [],
      mainFindings: "",
      recommendations: "",
      error: error instanceof Error ? error.message : "Structured summarization failed",
    };
  }
}
