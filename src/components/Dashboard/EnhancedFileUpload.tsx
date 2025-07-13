import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { generateDashboard } from '../../config/gemini';
import toast from 'react-hot-toast';

interface FileWithPreview extends File {
  preview?: string;
  id: string;
}

const EnhancedFileUpload: React.FC = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ [key: string]: number }>({});

  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
  const ACCEPTED_FORMATS = {
    'text/csv': ['.csv'],
    'application/pdf': ['.pdf'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'text/plain': ['.txt'],
    'application/json': ['.json']
  };

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    rejectedFiles.forEach(({ file, errors }) => {
      errors.forEach((error: any) => {
        if (error.code === 'file-too-large') {
          toast.error(`${file.name} is too large. Maximum size is 2MB.`);
        } else if (error.code === 'file-invalid-type') {
          toast.error(`${file.name} is not a supported file type.`);
        }
      });
    });

    // Handle accepted files
    const newFiles = acceptedFiles.map(file => ({
      ...file,
      id: Math.random().toString(36).substr(2, 9),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));

    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FORMATS,
    maxSize: MAX_FILE_SIZE,
    multiple: true
  });

  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const uploadFiles = async () => {
    if (!user || files.length === 0) return;

    setUploading(true);
    const newProgress: { [key: string]: number } = {};

    try {
      for (const file of files) {
        newProgress[file.id] = 0;
        setProgress({ ...newProgress });

        // Convert to base64
        newProgress[file.id] = 25;
        setProgress({ ...newProgress });
        const base64 = await convertToBase64(file);

        // Generate AI insights
        newProgress[file.id] = 50;
        setProgress({ ...newProgress });
        const aiResponse = await generateDashboard(base64, file.name, file.type);

        // Save to Firestore
        newProgress[file.id] = 75;
        setProgress({ ...newProgress });
        
        await addDoc(collection(db, 'dashboards'), {
          uid: user.uid,
          title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          base64: base64,
          aiSummary: aiResponse,
          charts: [],
          metrics: [],
          createdAt: new Date(),
          views: 0,
          rating: 0
        });

        newProgress[file.id] = 100;
        setProgress({ ...newProgress });
        
        toast.success(`${file.name} uploaded successfully!`);
      }

      // Clear files after successful upload
      setTimeout(() => {
        setFiles([]);
        setProgress({});
      }, 2000);

    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <motion.div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
          }
        `}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          <motion.div
            animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
            className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center"
          >
            <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </motion.div>
          
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {isDragActive ? 'Drop files here' : 'Upload your data files'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Drag & drop files or click to browse
            </p>
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p>Supported formats: CSV, PDF, Excel, TXT, JSON</p>
            <p>Maximum file size: 2MB per file</p>
          </div>
        </div>
      </motion.div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Files to Upload ({files.length})
            </h3>
            
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-gray-700/50"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Progress */}
                  {progress[file.id] !== undefined && (
                    <div className="flex items-center space-x-2">
                      {progress[file.id] === 100 ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : progress[file.id] > 0 ? (
                        <Loader className="h-5 w-5 text-blue-500 animate-spin" />
                      ) : null}
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {progress[file.id]}%
                      </span>
                    </div>
                  )}

                  {/* Remove Button */}
                  {!uploading && (
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Upload Button */}
            <div className="flex justify-end">
              <button
                onClick={uploadFiles}
                disabled={uploading || files.length === 0}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploading && <Loader className="h-4 w-4 animate-spin" />}
                <span>{uploading ? 'Uploading...' : 'Upload Files'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedFileUpload;