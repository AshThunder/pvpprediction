import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((msg, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className={`pointer-events-auto p-4 border-2 shadow-[4px_4px_0px_0px_#000] flex items-start gap-3 w-80 text-sm font-bold bg-white
                ${toast.type === 'success' ? 'border-green-600 outline outline-4 outline-green-100 text-green-900' : 
                  toast.type === 'error' ? 'border-red-600 outline outline-4 outline-red-100 text-red-900' : 
                  'border-blue-600 outline outline-4 outline-blue-100 text-blue-900'}`
              }
            >
              <div className="mt-0.5">
                {toast.type === 'success' && <CheckCircle2 className="text-green-600" size={18} />}
                {toast.type === 'error' && <AlertCircle className="text-red-600" size={18} />}
                {toast.type === 'info' && <Info className="text-blue-600" size={18} />}
              </div>
              <div className="flex-1 break-words leading-tight">{toast.msg}</div>
              <button onClick={() => removeToast(toast.id)} className="opacity-50 hover:opacity-100 transition-opacity">
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
