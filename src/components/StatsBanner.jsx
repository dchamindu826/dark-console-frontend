import React from 'react';
import { Users, DollarSign, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const StatItem = ({ icon: Icon, value, label, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: delay, duration: 0.5 }}
    className="flex flex-col md:flex-row items-center gap-4 p-4 md:px-8 relative group"
  >
    {/* Icon Container with Glow */}
    <div className="relative">
      <div className="absolute inset-0 bg-[var(--gta-green)] blur-lg opacity-20 group-hover:opacity-50 transition-all duration-500 rounded-full"></div>
      <div className="w-12 h-12 rounded-full border border-white/10 bg-black/60 flex items-center justify-center relative z-10 backdrop-blur-md group-hover:border-[var(--gta-green)] group-hover:scale-110 transition-all duration-300">
        <Icon className="w-5 h-5 text-[var(--gta-green)]" />
      </div>
    </div>
    
    {/* Text Info */}
    <div className="text-center md:text-left">
      <h3 className="text-2xl md:text-3xl font-black text-white leading-none tracking-tight group-hover:text-[var(--gta-green)] transition-colors">
        {value}
      </h3>
      <p className="text-zinc-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.15em] mt-1">
        {label}
      </p>
    </div>

    {/* Right Divider (Visible only on Desktop) */}
    <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-8 bg-gradient-to-b from-transparent via-white/10 to-transparent last:hidden"></div>
  </motion.div>
);

const StatsBanner = () => {
  return (
    <div className="relative z-40 w-full px-4 md:px-0 -mt-16 md:-mt-24 mb-20">
      <div className="max-w-7xl mx-auto">
        {/* Glass Container */}
        <div className="bg-[#09090b]/60 backdrop-blur-xl border-t border-white/10 md:rounded-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)] overflow-hidden">
          
          {/* Green Line Top */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--gta-green)] to-transparent opacity-50"></div>

          <div className="grid grid-cols-2 md:grid-cols-4 divide-y divide-white/5 md:divide-y-0">
            <StatItem icon={Users} value="15.4K+" label="Gang Members" delay={0.1} />
            <StatItem icon={DollarSign} value="$50B+" label="Cash Delivered" delay={0.2} />
            <StatItem icon={ShieldCheck} value="Lifetime" label="Ban Warranty" delay={0.3} />
            <StatItem icon={Zap} value="Instant" label="Delivery Time" delay={0.4} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsBanner;