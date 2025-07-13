import { useState } from 'react';
import toast from 'react-hot-toast';

interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
}

interface UseFileValidationReturn {
  validateFile: (file: File) => boolean;
  isValidating: boolean;
  error: string | null;
}

const useFileValidation = (options: FileValidationOptions = {}): UseFileValidationReturn => {
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = [
      'text/csv',
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ]
  } = options;

  const validateFile = (file: File): boolean => {
    setIsValidating(true);
    setError(null);

    try {
      // Check file size
      if (file.size > maxSize) {
        const maxSizeMB = maxSize / (1024 * 1024);
        const errorMsg = `File size exceeds ${maxSizeMB}MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`;
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }

      // Check file type
      if (!allowedTypes.includes(file.type)) {
        const errorMsg = `File type not supported. Allowed types: ${allowedTypes.join(', ')}`;
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }

      // Check file name for security
      const dangerousChars = /[<>:"/\\|?*]/;
      if (dangerousChars.test(file.name)) {
        const errorMsg = 'File name contains invalid characters';
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }

      // Check if file is empty
      if (file.size === 0) {
        const errorMsg = 'File is empty';
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }

      toast.success('File validation passed');
      return true;
    } catch (err) {
      const errorMsg = 'File validation failed';
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  return {
    validateFile,
    isValidating,
    error
  };
};

export default useFileValidation;