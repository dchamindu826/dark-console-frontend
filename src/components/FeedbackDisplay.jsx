import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import apiClient from '../api/client';

const FeedbackDisplay = () => {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
      apiClient.get('/feedbacks').then(res => setFeedbacks(res.data)).catch(()=>{});
  }, []);

  if (feedbacks.length === 0) return null;

  return (
    <section className="py-20 border-t border-zinc-900 bg-black overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 text-center mb-12">
            <h2 className="text-3xl font-black uppercase text-white">Client <span className="text-[var(--gta-green)]">Stories</span></h2>
        </div>

        {/* Marquee Effect */}
        <div className="flex w-full overflow-hidden mask-fade-sides">
            <motion.div 
                className="flex gap-6 px-6"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
                style={{ width: "fit-content" }}
            >
                {/* Duplicate list to make it seamless loop */}
                {[...feedbacks, ...feedbacks].map((fb, index) => (
                    <div key={index} className="w-[300px] flex-shrink-0 bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl relative hover:border-[var(--gta-green)] transition-colors">
                        <Quote className="absolute top-4 right-4 text-zinc-700 rotate-180" size={24}/>
                        <div className="flex items-center gap-3 mb-4">
                            <img src={fb.avatar} className="w-10 h-10 rounded-full object-cover border border-zinc-700"/>
                            <div>
                                <h4 className="text-white font-bold text-sm">{fb.name}</h4>
                                <div className="flex text-yellow-500 gap-0.5">
                                    {[...Array(fb.rating)].map((_,i)=><Star key={i} size={10} fill="currentColor"/>)}
                                </div>
                            </div>
                        </div>
                        <p className="text-zinc-400 text-xs leading-relaxed italic">"{fb.message}"</p>
                    </div>
                ))}
            </motion.div>
        </div>
    </section>
  );
};

export default FeedbackDisplay;