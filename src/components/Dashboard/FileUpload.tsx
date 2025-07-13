import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { generateDashboard } from '../../config/gemini';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { Dashboard } from '../../types';
import useFileValidation from '../../hooks/useFileValidation';
import useUploadLimit from '../../hooks/useUploadLimit';
import toast from 'react-hot-toast';
import LoadingSpinner from '../UI/LoadingSpinner';

const FileUpload: React.FC = () => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const { validateFile, isValidating } = useFileValidation({
    maxSize: 2 * 1024 * 1024, // 2MB instead of 10MB
    allowedTypes: [
      'text/csv',
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/json'
    ]
  });
  const { canUpload, remainingUploads, checkUploadLimit, incrementUploadCount, loading: limitLoading } = useUploadLimit();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    // Check upload limit
    const canProceed = await checkUploadLimit();
    if (!canProceed) return;

    setUploading(true);
    setProgress(0);

    try {
      setProgress(25);
      const base64 = await convertToBase64(file);
      
      setProgress(50);
      const aiResponse = await generateDashboard(base64, file.name, file.type);
      
      setProgress(75);
      const dashboardData: Omit<Dashboard, 'id'> = {
        uid: user.uid,
        title: file.name,
        fileName: file.name,
        fileType: file.type,
        base64: base64,
        aiSummary: aiResponse,
        charts: [],
        metrics: [],
        createdAt: new Date()
      };

      await addDoc(collection(db, 'dashboards'), dashboardData);
      await incrementUploadCount();
      
      setProgress(100);
      setFile(null);
      toast.success('File uploaded and dashboard generated successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  if (limitLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center">
          <LoadingSpinner />
          <span className="ml-2 text-gray-600 dark:text-gray-300">Checking upload limits...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Data File</h2>
      
      {/* Upload Limit Info */}
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm text-blue-800 dark:text-blue-200">
            {remainingUploads} uploads remaining today
          </span>
        </div>
      </div>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <input
          type="file"
          onChange={handleFileChange}
          accept=".csv,.pdf,.xlsx,.xls,.txt"
          className="hidden"
          id="file-upload"
          disabled={!canUpload || uploading || isValidating}
        />
        
        {!file ? (
          <label 
            htmlFor="file-upload" 
            className={`cursor-pointer ${!canUpload ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              {canUpload ? 'Click to upload or drag and drop' : 'Daily upload limit reached'}
            </p>
            <p className="text-xs text-gray-500">
              CSV, PDF, Excel, or TXT files only
            </p>
          </label>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <FileText className="h-6 w-6 text-blue-500" />
              <span className="text-sm text-gray-700">{file.name}</span>
              <button
                onClick={() => setFile(null)}
                className="text-red-500 hover:text-red-700"
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {uploading && (
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600">
                  {progress < 25 ? 'Uploading...' : 
                   progress < 50 ? 'Processing...' : 
                   progress < 75 ? 'Generating insights...' : 
                   'Finalizing...'}
                </p>
              </div>
            )}
            
            <button
              onClick={handleUpload}
              disabled={uploading || !canUpload || isValidating}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {uploading && <LoadingSpinner size="sm" />}
              <span>{uploading ? 'Processing...' : 'Upload & Generate Dashboard'}</span>
            </button>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>Supported formats: CSV, PDF, Excel (.xlsx, .xls), Text (.txt), JSON</p>
        <p>Max file size: 2MB</p>
        <p>Daily upload limit: 10 files per day</p>
      </div>
    </div>
  );
};

export default FileUpload;