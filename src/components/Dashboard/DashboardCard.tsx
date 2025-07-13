import React from 'react';
import { Dashboard } from '../../types';
import { FileText, Calendar, BarChart } from 'lucide-react';

interface DashboardCardProps {
  dashboard: Dashboard;
  onClick: (dashboard: Dashboard) => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ dashboard, onClick }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div
      onClick={() => onClick(dashboard)}
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border border-gray-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <BarChart className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{dashboard.title}</h3>
            <p className="text-sm text-gray-600">{dashboard.fileName}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            {formatDate(dashboard.createdAt)}
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex items-center text-sm text-gray-600">
          <FileText className="h-4 w-4 mr-1" />
          {dashboard.fileType}
        </div>
        
        {dashboard.metrics.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-4">
            {dashboard.metrics.slice(0, 4).map((metric, index) => (
              <div key={index} className="text-center">
                <div className="text-lg font-semibold text-gray-900">{metric.value}</div>
                <div className="text-xs text-gray-500">{metric.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;