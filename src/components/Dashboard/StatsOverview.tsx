import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, BarChart3, Users, FileText, Activity } from 'lucide-react';
import AnimatedCard from '../UI/AnimatedCard';

interface StatItem {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

interface StatsOverviewProps {
  stats: StatItem[];
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  const defaultStats: StatItem[] = [
    {
      title: 'Total Dashboards',
      value: '24',
      change: '+12%',
      trend: 'up',
      icon: <BarChart3 className="h-6 w-6" />,
      color: 'blue'
    },
    {
      title: 'Active Users',
      value: '1,234',
      change: '+8%',
      trend: 'up',
      icon: <Users className="h-6 w-6" />,
      color: 'green'
    },
    {
      title: 'Blog Posts',
      value: '56',
      change: '+3%',
      trend: 'up',
      icon: <FileText className="h-6 w-6" />,
      color: 'purple'
    },
    {
      title: 'Data Processed',
      value: '2.4GB',
      change: '-2%',
      trend: 'down',
      icon: <Activity className="h-6 w-6" />,
      color: 'orange'
    }
  ];

  const displayStats = stats.length > 0 ? stats : defaultStats;

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20',
      green: 'bg-green-500 text-green-600 bg-green-50 dark:bg-green-900/20',
      purple: 'bg-purple-500 text-purple-600 bg-purple-50 dark:bg-purple-900/20',
      orange: 'bg-orange-500 text-orange-600 bg-orange-50 dark:bg-orange-900/20'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {displayStats.map((stat, index) => {
        const colorClasses = getColorClasses(stat.color).split(' ');
        return (
          <AnimatedCard key={index} delay={index * 0.1} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-lg ${colorClasses[2]} ${colorClasses[3]}`}>
                  <div className={colorClasses[1]}>
                    {stat.icon}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`flex items-center text-sm ${
                  stat.trend === 'up' 
                    ? 'text-green-600 dark:text-green-400' 
                    : stat.trend === 'down'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {stat.trend === 'up' && <TrendingUp className="h-4 w-4 mr-1" />}
                  {stat.trend === 'down' && <TrendingDown className="h-4 w-4 mr-1" />}
                  {stat.change}
                </div>
              </div>
            </div>
          </AnimatedCard>
        );
      })}
    </div>
  );
};

export default StatsOverview;