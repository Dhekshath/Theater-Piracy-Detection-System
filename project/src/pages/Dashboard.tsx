import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import EventCard from '../components/EventCard';
import SystemStatus from '../components/SystemStatus';
import EventModal from '../components/EventModal';
import { 
  AlertTriangle, 
  Clock, 
  Calendar, 
  BarChart3 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

interface Event {
  id: string;
  timestamp: string;
  detection_duration: string;
  face_image_path: string;
  status: string;
}

const Dashboard: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [stats, setStats] = useState({
    totalEvents: 0,
    todayEvents: 0,
    averageDuration: '0s',
    peakTime: '00:00'
  });
  const [systemStatus, setSystemStatus] = useState({
    camera: 'online' as const,
    detection: 'online' as const,
    database: 'online' as const,
    lastUpdated: new Date().toLocaleTimeString()
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const { socket } = useSocket();

  useEffect(() => {
    // Fetch initial data
    fetchEvents();
    fetchStats();
    fetchSystemStatus();

    // Set up socket listeners
    if (socket) {
      socket.on('newEvent', (event: Event) => {
        setEvents(prevEvents => [event, ...prevEvents]);
        setRecentEvents(prevEvents => {
          const updated = [event, ...prevEvents];
          return updated.slice(0, 4);
        });
        updateStats();
      });

      socket.on('systemStatusUpdate', (status: typeof systemStatus) => {
        setSystemStatus(status);
      });

      return () => {
        socket.off('newEvent');
        socket.off('systemStatusUpdate');
      };
    }
  }, [socket]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/events?limit=100', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setEvents(data);
      setRecentEvents(data.slice(0, 4));
      
      // Generate chart data
      generateChartData(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchSystemStatus = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/system/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setSystemStatus(data);
    } catch (error) {
      console.error('Error fetching system status:', error);
    }
  };

  const updateStats = async () => {
    await fetchStats();
  };

  const generateChartData = (eventData: Event[]) => {
    // Daily data for the past week
    const dailyData: Record<string, number> = {};
    const hourlyData: Record<string, number> = {};
    
    // Initialize hourly data
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, '0');
      hourlyData[hour] = 0;
    }
    
    // Process events
    eventData.forEach(event => {
      const date = new Date(event.timestamp);
      const dateStr = date.toISOString().split('T')[0];
      const hour = date.getHours().toString().padStart(2, '0');
      
      // Update daily counts
      if (dailyData[dateStr]) {
        dailyData[dateStr]++;
      } else {
        dailyData[dateStr] = 1;
      }
      
      // Update hourly counts
      hourlyData[hour]++;
    });
    
    // Convert to chart format
    const chartData = Object.entries(dailyData).map(([date, count]) => ({
      date,
      count
    })).sort((a, b) => a.date.localeCompare(b.date));
    
    const hourlyChartData = Object.entries(hourlyData).map(([hour, count]) => ({
      hour: `${hour}:00`,
      count
    })).sort((a, b) => a.hour.localeCompare(b.hour));
    
    setChartData(chartData);
    setHourlyData(hourlyChartData);
  };

  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Security Dashboard</h1>
        <p className="text-gray-600">Monitor and manage theatre security events</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Detections" 
          value={stats.totalEvents} 
          icon={<AlertTriangle size={24} className="text-white" />} 
          color="bg-red-500"
          change={{ value: '+5', positive: true }}
        />
        <StatCard 
          title="Today's Alerts" 
          value={stats.todayEvents} 
          icon={<Calendar size={24} className="text-white" />} 
          color="bg-blue-500"
          change={{ value: '+2', positive: true }}
        />
        <StatCard 
          title="Average Duration" 
          value={stats.averageDuration} 
          icon={<Clock size={24} className="text-white" />} 
          color="bg-green-500"
        />
        <StatCard 
          title="Peak Detection Time" 
          value={stats.peakTime} 
          icon={<BarChart3 size={24} className="text-white" />} 
          color="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Charts */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Detection Trends (Last 7 Days)</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#93c5fd" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Status */}
        <div className="lg:col-span-1">
          <SystemStatus status={systemStatus} />
        </div>
      </div>

      {/* Hourly Distribution */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Hourly Detection Distribution</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={hourlyData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Detections" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Events */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Detections</h2>
          <button 
            onClick={() => window.location.href = '/events'}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View all
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentEvents.length > 0 ? (
            recentEvents.map(event => (
              <EventCard 
                key={event.id} 
                event={event} 
                onClick={() => handleViewEvent(event)} 
              />
            ))
          ) : (
            <div className="col-span-4 text-center py-8 text-gray-500">
              No recent detection events
            </div>
          )}
        </div>
      </div>

      {/* Event Modal */}
      <EventModal event={selectedEvent} onClose={handleCloseModal} />
    </Layout>
  );
};

export default Dashboard;