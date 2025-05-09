import React from 'react';
import { format } from 'date-fns';
import { AlertTriangle, Clock } from 'lucide-react';

interface EventCardProps {
  event: {
    id: string;
    timestamp: string;
    detection_duration: string;
    face_image_path: string;
    status: string;
  };
  onClick: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  const formattedDate = format(new Date(event.timestamp), 'MMM dd, yyyy');
  const formattedTime = format(new Date(event.timestamp), 'HH:mm:ss');

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
      onClick={onClick}
    >
      <div className="relative">
        <img 
          src={event.face_image_path} 
          alt="Detected face" 
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
          <AlertTriangle size={12} className="mr-1" />
          {event.status}
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Detection Event</h3>
            <p className="text-sm text-gray-500">{formattedDate}</p>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock size={14} className="mr-1" />
            <span className="text-sm">{formattedTime}</span>
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span className="font-medium">Duration:</span>
          <span className="ml-1">{event.detection_duration}</span>
        </div>
      </div>
    </div>
  );
};

export default EventCard;