import React, { useState } from 'react';
import { MessageCircle, X, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SupportWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  // 🔥 මෙතනට ඔයාගේ ලින්ක් දාන්න
  const whatsappLink = "https://wa.me/94764696933"; 
  const discordLink = "https://discord.gg/naRBV7dwbF"; 

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex flex-col gap-3"
          >
            {/* Discord Button */}
            <a href={discordLink} target="_blank" rel="noopener noreferrer" 
               className="flex items-center gap-3 bg-[#5865F2] text-white px-4 py-3 rounded-full shadow-lg hover:brightness-110 transition-all font-bold">
               <span className="text-sm">Join Discord</span>
               <MessageCircle size={20} fill="currentColor"/>
            </a>

            {/* WhatsApp Button */}
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" 
               className="flex items-center gap-3 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-lg hover:brightness-110 transition-all font-bold">
               <span className="text-sm">WhatsApp Us</span>
               <MessageCircle size={20} fill="currentColor"/>
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[var(--gta-green)] text-black rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:scale-110 transition-transform font-bold"
      >
        {isOpen ? <X size={24} /> : <HelpCircle size={28} />}
      </button>
    </div>
  );
};

export default SupportWidget;