import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

interface UploadLimit {
  date: string;
  count: number;
  maxDaily: number;
}

interface UseUploadLimitReturn {
  canUpload: boolean;
  remainingUploads: number;
  checkUploadLimit: () => Promise<boolean>;
  incrementUploadCount: () => Promise<void>;
  loading: boolean;
}

const useUploadLimit = (maxDailyUploads: number = 10): UseUploadLimitReturn => {
  const { user } = useAuth();
  const [uploadLimit, setUploadLimit] = useState<UploadLimit | null>(null);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (user) {
      fetchUploadLimit();
    }
  }, [user]);

  const fetchUploadLimit = async () => {
    if (!user) return;

    try {
      const limitDoc = await getDoc(doc(db, 'uploadLimits', user.uid));
      
      if (limitDoc.exists()) {
        const data = limitDoc.data() as UploadLimit;
        
        // Reset count if it's a new day
        if (data.date !== today) {
          const newLimit = { date: today, count: 0, maxDaily: maxDailyUploads };
          await updateDoc(doc(db, 'uploadLimits', user.uid), newLimit);
          setUploadLimit(newLimit);
        } else {
          setUploadLimit(data);
        }
      } else {
        // Create new limit document
        const newLimit = { date: today, count: 0, maxDaily: maxDailyUploads };
        await setDoc(doc(db, 'uploadLimits', user.uid), newLimit);
        setUploadLimit(newLimit);
      }
    } catch (error) {
      console.error('Error fetching upload limit:', error);
      toast.error('Failed to check upload limit');
    } finally {
      setLoading(false);
    }
  };

  const checkUploadLimit = async (): Promise<boolean> => {
    if (!uploadLimit) {
      await fetchUploadLimit();
      return false;
    }

    const canUpload = uploadLimit.count < uploadLimit.maxDaily;
    
    if (!canUpload) {
      toast.error(`Daily upload limit reached (${uploadLimit.maxDaily} files per day)`);
    }

    return canUpload;
  };

  const incrementUploadCount = async () => {
    if (!user || !uploadLimit) return;

    try {
      const newCount = uploadLimit.count + 1;
      const updatedLimit = { ...uploadLimit, count: newCount };
      
      await updateDoc(doc(db, 'uploadLimits', user.uid), updatedLimit);
      setUploadLimit(updatedLimit);
    } catch (error) {
      console.error('Error updating upload count:', error);
    }
  };

  return {
    canUpload: uploadLimit ? uploadLimit.count < uploadLimit.maxDaily : false,
    remainingUploads: uploadLimit ? Math.max(0, uploadLimit.maxDaily - uploadLimit.count) : 0,
    checkUploadLimit,
    incrementUploadCount,
    loading
  };
};

export default useUploadLimit;