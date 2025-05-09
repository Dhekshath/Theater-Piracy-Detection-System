import React from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface SystemStatusProps {
  status: {
    camera: 'online' | 'offline' | 'warning';
    detection: 'online' | 'offline' | 'warning';
    database: 'online' | 'offline' | 'warning';
    lastUpdated: string;
  };
}

const SystemStatus: React.FC<SystemStatusProps> = ({ status }) => {
  const getStatusIcon = (status: 'online' | 'offline' | 'warning') => {
    switch (status) {
      case 'online':
        return <CheckCircle size={18} className="text-green-500" />;
      case 'offline':
        return <XCircle size={18} className="text-red-500" />;
      case 'warning':
        return <AlertTriangle size={18} className="text-yellow-500" />;
    }
  };

  const getStatusText = (status: 'online' | 'offline' | 'warning') => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      case 'warning':
        return 'Warning';
    }
  };

  const getStatusClass = (status: 'online' | 'offline' | 'warning') => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800';
      case 'offline':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900">System Status</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Last updated: {status.lastUpdated}
        </p>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {getStatusIcon(status.camera)}
              <span className="ml-2 text-sm font-medium text-gray-700">Camera System</span>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(status.camera)}`}>
              {getStatusText(status.camera)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {getStatusIcon(status.detection)}
              <span className="ml-2 text-sm font-medium text-gray-700">Detection Module</span>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(status.detection)}`}>
              {getStatusText(status.detection)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {getStatusIcon(status.database)}
              <span className="ml-2 text-sm font-medium text-gray-700">Database Connection</span>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(status.database)}`}>
              {getStatusText(status.database)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;