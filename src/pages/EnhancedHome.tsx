import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, getDocs, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import Layout from '../components/Layout/Layout';
import PremiumBackground from '../components/UI/PremiumBackground';
import StatsOverview from '../components/Dashboard/StatsOverview';
import FeaturedContent from '../components/Dashboard/FeaturedContent';
import AdvancedFilters from '../components/Dashboard/AdvancedFilters';
import SEOHead from '../components/SEO/SEOHead';
import { ArrowRight, Sparkles, TrendingUp, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const EnhancedHome: React.FC = () => {
  const { user } = useAuth();
  const [featuredItems, setFeaturedItems] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedContent();
  }, []);

  const fetchFeaturedContent = async () => {
    try {
      // Fetch featured dashboards
      const dashboardsQuery = query(
        collection(db, 'dashboards'),
        orderBy('createdAt', 'desc'),
        limit(6)
      );
      const dashboardsSnapshot = await getDocs(dashboardsQuery);
      
      // Fetch featured blogs
      const blogsQuery = query(
        collection(db, 'blogs'),
        where('published', '==', true),
        orderBy('createdAt', 'desc'),
        limit(3)
      );
      const blogsSnapshot = await getDocs(blogsQuery);

      const dashboards = dashboardsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        type: 'dashboard',
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        views: doc.data().views || 0,
        rating: doc.data().rating || 4.5,
        author: 'DataCruxx AI'
      }));

      const blogs = blogsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        type: 'blog',
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        views: Math.floor(Math.random() * 1000) + 100,
        rating: 4.5 + Math.random() * 0.5,
        description: doc.data().summary || doc.data().content?.substring(0, 150) + '...'
      }));

      setFeaturedItems([...dashboards, ...blogs]);
    } catch (error) {
      console.error('Error fetching featured content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (filters: any) => {
    console.log('Filters changed:', filters);
    // Implement filtering logic here
  };

  const handleFeaturedItemClick = (item: any) => {
    if (item.type === 'dashboard') {
      // Navigate to dashboard view
      console.log('Navigate to dashboard:', item.id);
    } else if (item.type === 'blog') {
      // Navigate to blog post
      window.location.href = `/blog/${item.id}`;
    }
  };

  return (
    <Layout>
      <SEOHead
        title="DataCruxx - AI-Powered Analytics Platform"
        description="Transform your data into actionable insights with DataCruxx's AI-powered analytics platform. Upload files, generate dashboards, and discover intelligent insights."
        keywords="data analytics, AI dashboard, business intelligence, data visualization, CSV analysis, PDF analysis"
      />
      
      <PremiumBackground variant="gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-20 text-center"
          >
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-6"
              >
                <span className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium">
                  <Sparkles className="h-4 w-4" />
                  <span>AI-Powered Analytics</span>
                </span>
              </motion.div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
                Transform Your
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  {' '}Data Story
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Upload any data file and watch our AI create stunning dashboards, 
                extract insights, and tell your data's story in seconds.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <span>Open Dashboard</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/signup"
                      className="inline-flex items-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <span>Start Free Trial</span>
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                    <Link
                      to="/blogs"
                      className="inline-flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white px-8 py-4 rounded-xl font-semibold hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 border border-gray-200/50 dark:border-gray-700/50"
                    >
                      <span>Explore Insights</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.section>

          {/* Stats Overview */}
          {user && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="py-12"
            >
              <StatsOverview stats={[]} />
            </motion.section>
          )}

          {/* Advanced Filters */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="py-8"
          >
            <AdvancedFilters
              onFiltersChange={handleFiltersChange}
              categories={['Analytics', 'Finance', 'Marketing', 'Sales', 'Operations']}
            />
          </motion.section>

          {/* Featured Content */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="py-12"
          >
            <FeaturedContent
              items={featuredItems}
              onItemClick={handleFeaturedItemClick}
            />
          </motion.section>

          {/* Features Grid */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="py-20"
          >
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Why Choose DataCruxx?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Experience the future of data analytics with our AI-powered platform
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Zap className="h-8 w-8" />,
                  title: 'Lightning Fast',
                  description: 'Generate comprehensive dashboards in seconds, not hours',
                  color: 'yellow'
                },
                {
                  icon: <TrendingUp className="h-8 w-8" />,
                  title: 'AI-Powered Insights',
                  description: 'Advanced AI analyzes your data and provides actionable insights',
                  color: 'blue'
                },
                {
                  icon: <Users className="h-8 w-8" />,
                  title: 'Team Collaboration',
                  description: 'Share dashboards and collaborate with your team seamlessly',
                  color: 'green'
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="text-center p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300"
                >
                  <div className={`inline-flex p-4 rounded-xl mb-4 ${
                    feature.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                    feature.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                    'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  }`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* CTA Section */}
          {!user && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="py-20 text-center"
            >
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to Transform Your Data?
                </h2>
                <p className="text-xl mb-8 opacity-90">
                  Join thousands of businesses using DataCruxx to make data-driven decisions
                </p>
                <Link
                  to="/signup"
                  className="inline-flex items-center space-x-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </motion.section>
          )}
        </div>
      </PremiumBackground>
    </Layout>
  );
};

export default EnhancedHome;