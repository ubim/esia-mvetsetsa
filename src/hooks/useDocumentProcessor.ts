/**
 * React Hook for Document Processing
 */

import { useState } from "react";
import { 
  processDocument, 
  exportDocument, 
  downloadDocument,
  ProcessedDocument,
  DocumentExportOptions 
} from "../api/document-processor";

export function useDocumentProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const process = async (file: File): Promise<ProcessedDocument | null> => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await processDocument(file);
      
      if (result.error) {
        setError(result.error);
        return null;
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Document processing failed";
      setError(errorMessage);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const exportDoc = async (
    options: DocumentExportOptions,
    fileName?: string
  ): Promise<boolean> => {
    setIsExporting(true);
    setError(null);

    try {
      const blob = await exportDocument(options);
      
      const defaultFileName = fileName || 
        `${options.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${options.format}`;
      
      downloadDocument(blob, defaultFileName);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Document export failed";
      setError(errorMessage);
      return false;
    } finally {
      setIsExporting(false);
    }
  };

  return {
    process,
    exportDoc,
    isProcessing,
    isExporting,
    error,
  };
}
