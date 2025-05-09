import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { Save, Bell, Camera, Database, AlertTriangle } from 'lucide-react';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    emailAddress: 'admin@theatre.com',
    phoneNumber: '',
  });
  
  const [detectionSettings, setDetectionSettings] = useState({
    detectionThreshold: 5,
    captureImages: true,
    autoResolveTimeout: 30,
  });
  
  const [systemSettings, setSystemSettings] = useState({
    cameraDevice: 'default',
    databaseBackupEnabled: true,
    backupFrequency: 'daily',
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDetectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setDetectionSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value
    }));
  };

  const handleSystemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setSystemSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save settings to API
      const response = await fetch('http://localhost:3000/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          notifications: notificationSettings,
          detection: detectionSettings,
          system: systemSettings
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
      
      setSaveSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Configure system and notification preferences</p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-medium text-gray-900">System Configuration</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your security system settings and preferences
          </p>
        </div>

        <div className="p-6 space-y-8">
          {/* Notification Settings */}
          <div>
            <h3 className="text-md font-medium text-gray-900 flex items-center mb-4">
              <Bell size={18} className="mr-2 text-blue-500" />
              Notification Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="emailNotifications"
                  name="emailNotifications"
                  type="checkbox"
                  checked={notificationSettings.emailNotifications}
                  onChange={handleNotificationChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-700">
                  Enable email notifications
                </label>
              </div>
              
              {notificationSettings.emailNotifications && (
                <div>
                  <label htmlFor="emailAddress" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="emailAddress"
                    id="emailAddress"
                    value={notificationSettings.emailAddress}
                    onChange={handleNotificationChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              )}
              
              <div className="flex items-center">
                <input
                  id="smsNotifications"
                  name="smsNotifications"
                  type="checkbox"
                  checked={notificationSettings.smsNotifications}
                  onChange={handleNotificationChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="smsNotifications" className="ml-2 block text-sm text-gray-700">
                  Enable SMS notifications
                </label>
              </div>
              
              {notificationSettings.smsNotifications && (
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    id="phoneNumber"
                    value={notificationSettings.phoneNumber}
                    onChange={handleNotificationChange}
                    placeholder="+1 (555) 123-4567"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Detection Settings */}
          <div>
            <h3 className="text-md font-medium text-gray-900 flex items-center mb-4">
              <AlertTriangle size={18} className="mr-2 text-blue-500" />
              Detection Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="detectionThreshold" className="block text-sm font-medium text-gray-700 mb-1">
                  Detection Threshold (seconds)
                </label>
                <input
                  type="number"
                  name="detectionThreshold"
                  id="detectionThreshold"
                  min="1"
                  max="30"
                  value={detectionSettings.detectionThreshold}
                  onChange={handleDetectionChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Number of seconds a phone must be detected before triggering an alert
                </p>
              </div>
              
              <div className="flex items-center">
                <input
                  id="captureImages"
                  name="captureImages"
                  type="checkbox"
                  checked={detectionSettings.captureImages}
                  onChange={handleDetectionChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="captureImages" className="ml-2 block text-sm text-gray-700">
                  Capture suspect images on detection
                </label>
              </div>
              
              <div>
                <label htmlFor="autoResolveTimeout" className="block text-sm font-medium text-gray-700 mb-1">
                  Auto-resolve Timeout (minutes)
                </label>
                <input
                  type="number"
                  name="autoResolveTimeout"
                  id="autoResolveTimeout"
                  min="0"
                  max="120"
                  value={detectionSettings.autoResolveTimeout}
                  onChange={handleDetectionChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Time after which alerts are automatically resolved (0 to disable)
                </p>
              </div>
            </div>
          </div>
          
          {/* System Settings */}
          <div>
            <h3 className="text-md font-medium text-gray-900 flex items-center mb-4">
              <Camera size={18} className="mr-2 text-blue-500" />
              System Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="cameraDevice" className="block text-sm font-medium text-gray-700 mb-1">
                  Camera Device
                </label>
                <select
                  id="cameraDevice"
                  name="cameraDevice"
                  value={systemSettings.cameraDevice}
                  onChange={handleSystemChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="default">Default Camera</option>
                  <option value="usb">USB Camera</option>
                  <option value="ip">IP Camera</option>
                </select>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 flex items-center mb-2">
                  <Database size={16} className="mr-1 text-gray-500" />
                  Database Backup
                </h4>
                <div className="flex items-center mb-2">
                  <input
                    id="databaseBackupEnabled"
                    name="databaseBackupEnabled"
                    type="checkbox"
                    checked={systemSettings.databaseBackupEnabled}
                    onChange={handleSystemChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="databaseBackupEnabled" className="ml-2 block text-sm text-gray-700">
                    Enable automatic database backups
                  </label>
                </div>
                
                {systemSettings.databaseBackupEnabled && (
                  <div>
                    <label htmlFor="backupFrequency" className="block text-sm font-medium text-gray-700 mb-1">
                      Backup Frequency
                    </label>
                    <select
                      id="backupFrequency"
                      name="backupFrequency"
                      value={systemSettings.backupFrequency}
                      onChange={handleSystemChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Save Button */}
          <div className="pt-5 border-t">
            <div className="flex justify-end">
              {saveSuccess && (
                <div className="mr-4 flex items-center text-green-600">
                  <span className="text-sm">Settings saved successfully!</span>
                </div>
              )}
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={isSaving}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isSaving ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                <Save size={16} className="mr-2" />
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;