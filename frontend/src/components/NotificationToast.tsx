import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationToast: React.FC = () => {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (socket) {
      socket.on('orderStatusChanged', (data: any) => {
        const id = Date.now();
        setNotifications((prev) => [...prev, { ...data, toastId: id }]);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.toastId !== id));
        }, 5000);
      });
    }

    return () => {
      if (socket) socket.off('orderStatusChanged');
    };
  }, [socket]);

  const removeNotification = (toastId: number) => {
    setNotifications((prev) => prev.filter((n) => n.toastId !== toastId));
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.toastId}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className="bg-white border-l-4 border-primary-500 shadow-2xl rounded-lg p-4 flex items-start gap-3 min-w-[300px]"
          >
            <div className="bg-primary-100 p-2 rounded-full text-primary-600">
              <Bell size={20} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-800">Pembaruan Pesanan</h4>
              <p className="text-sm text-slate-600">{n.message}</p>
            </div>
            <button
              onClick={() => removeNotification(n.toastId)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationToast;
