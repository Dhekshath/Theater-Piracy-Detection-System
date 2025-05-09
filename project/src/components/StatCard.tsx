import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  change?: {
    value: string;
    positive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, change }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
        <div className="ml-5">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
      {change && (
        <div className="mt-4">
          <div className={`flex items-center text-sm ${change.positive ? 'text-green-600' : 'text-red-600'}`}>
            <span>{change.positive ? '↑' : '↓'}</span>
            <span className="ml-1">{change.value} from yesterday</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatCard;