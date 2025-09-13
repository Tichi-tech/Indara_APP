import React, { useState, useEffect } from 'react';
import { Wifi } from 'lucide-react';

const StatusBar: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="status-bar">
      <div className="flex items-center">
        <span>{formatTime(currentTime)}</span>
      </div>
      
      <div className="flex items-center gap-1">
        <div className="signal-bars">
          <div className="signal-bar"></div>
          <div className="signal-bar"></div>
          <div className="signal-bar"></div>
          <div className="signal-bar"></div>
        </div>
        <Wifi className="wifi-icon" />
        <div className="battery">
          <div className="battery-fill"></div>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;