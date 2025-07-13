import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Dashboard as DashboardType } from '../types';
import Layout from '../components/Layout/Layout';
import SEOHead from '../components/SEO/SEOHead';
import FileUpload from '../components/Dashboard/FileUpload';
import DashboardCard from '../components/Dashboard/DashboardCard';
import DashboardView from '../components/Dashboard/DashboardView';
import DashboardSkeleton from '../components/Dashboard/DashboardSkeleton';
import Skeleton from '../components/UI/Skeleton';
import EnhancedFileUpload from '../components/Dashboard/EnhancedFileUpload';
import PremiumBackground from '../components/UI/PremiumBackground';
import { Plus, BarChart3 } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboards, setDashboards] = useState<DashboardType[]>([]);
  const [selectedDashboard, setSelectedDashboard] = useState<DashboardType | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboards();
    }
  }, [user]);

  const fetchDashboards = async () => {
    if (!user) return;
    
    try {
      const q = query(
        collection(db, 'dashboards'),
        where('uid', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const dashboardsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      } as DashboardType));
      setDashboards(dashboardsData);
    } catch (error) {
      console.error('Error fetching dashboards:', error);
    } finally {
      setLoading(false);
    }
  };

  if (selectedDashboard) {
    return (
      <Layout>
        <SEOHead
          title={`${selectedDashboard.title} Dashboard`}
          description={`View analytics dashboard for ${selectedDashboard.fileName}`}
          url={`/dashboard/${selectedDashboard.id}`}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <DashboardSkeleton />
          ) : (
            <DashboardView
              dashboard={selectedDashboard}
              onBack={() => setSelectedDashboard(null)}
            />
          )}
        </div>
      </Layout>
    );
  }

  const DashboardCardSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div>
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-4 w-16 mb-3" />
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="text-center">
            <Skeleton className="h-6 w-12 mx-auto mb-1" />
            <Skeleton className="h-3 w-16 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <Layout>
      <SEOHead
        title="My Dashboards"
        description="View and manage your AI-generated data dashboards and analytics"
        url="/dashboard"
      />
      <PremiumBackground variant="mesh">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Dashboards</h1>
              <p className="text-gray-600 dark:text-gray-300">Upload data files and generate AI-powered insights</p>
            </div>
            <button
              onClick={() => setShowUpload(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 focus-visible:focus"
              aria-label="Upload new data file"
            >
              <Plus className="h-5 w-5" />
              <span>Upload Data</span>
            </button>
          </div>

          {showUpload && (
            <div className="mb-8">
              <EnhancedFileUpload />
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowUpload(false)}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <DashboardCardSkeleton key={i} />
              ))}
            </div>
          ) : dashboards.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No dashboards yet</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">Upload your first data file to get started</p>
              <button
                onClick={() => setShowUpload(true)}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors focus-visible:focus"
              >
                Upload Data File
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboards.map((dashboard) => (
                <DashboardCard
                  key={dashboard.id}
                  dashboard={dashboard}
                  onClick={setSelectedDashboard}
                />
              ))}
            </div>
          )}
        </div>
      </PremiumBackground>
    </Layout>
  );
};

export default Dashboard;