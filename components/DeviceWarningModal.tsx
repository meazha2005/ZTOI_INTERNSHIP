import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Laptop, X } from 'lucide-react';

const BRAND = '#FF4D00';

export default function DeviceWarningModal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hasSeenWarning = localStorage.getItem('hasSeenDeviceWarning');
    const isMobileDevice = window.innerWidth < 1024; // Target screens smaller than typical laptops

    if (!hasSeenWarning && isMobileDevice) {
      // Small delay for better UX after navigation
      const timer = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('hasSeenDeviceWarning', 'true');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-sm w-full text-center relative"
          >
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `${BRAND}15` }}>
              <Laptop size={28} style={{ color: BRAND }} />
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-michroma)' }}>
              Better on Desktop
            </h2>
            
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              For the best experience while working on tasks, chatting, or managing the portal, we highly recommend using a laptop or desktop computer.
            </p>

            <button
              onClick={handleClose}
              className="w-full py-3 rounded-lg text-white font-semibold text-sm transition-all hover:opacity-90 tracking-wider"
              style={{ background: BRAND, fontFamily: 'var(--font-michroma)' }}
            >
              GOT IT
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
