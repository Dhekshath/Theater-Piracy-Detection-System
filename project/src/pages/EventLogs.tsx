import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import Layout from '../components/Layout';
import EventTable from '../components/EventTable';
import EventModal from '../components/EventModal';
import { Calendar, ChevronDown } from 'lucide-react';

interface Event {
  id: string;
  timestamp: string;
  detection_duration: string;
  face_image_path: string;
  status: string;
}

const EventLogs: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const { socket } = useSocket();

  useEffect(() => {
    fetchEvents();

    if (socket) {
      socket.on('newEvent', (event: Event) => {
        setEvents(prevEvents => [event, ...prevEvents]);
      });

      return () => {
        socket.off('newEvent');
      };
    }
  }, [socket, dateFilter, statusFilter]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      let url = 'http://localhost:3000/api/events';
      const params = new URLSearchParams();
      
      if (dateFilter !== 'all') {
        params.append('date', dateFilter);
      }
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  const handleDateFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDateFilter(e.target.value);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Event Logs</h1>
        <p className="text-gray-600">View and manage all detection events</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
          <div className="mb-4 md:mb-0">
            <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <div className="relative">
              <select
                id="dateFilter"
                value={dateFilter}
                onChange={handleDateFilterChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <ChevronDown size={16} className="text-gray-400" />
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <div className="relative">
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="all">All Statuses</option>
                <option value="alerted">Alerted</option>
                <option value="resolved">Resolved</option>
                <option value="false_alarm">False Alarm</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <ChevronDown size={16} className="text-gray-400" />
              </div>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 md:ml-auto">
            <button
              onClick={fetchEvents}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Event Table */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <EventTable events={events} onViewEvent={handleViewEvent} />
      )}

      {/* Event Modal */}
      <EventModal event={selectedEvent} onClose={handleCloseModal} />
    </Layout>
  );
};

export default EventLogs;