import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-black border-t border-zinc-900 py-12 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div>
          <h3 className="text-2xl font-black text-white uppercase mb-4">Dark<span className="text-[var(--gta-green)]">Console</span></h3>
          <p className="text-zinc-500 text-sm">The ultimate platform for GTA V online services, tournaments, and community events.</p>
        </div>
        
        <div>
          <h4 className="text-white font-bold uppercase mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li><Link to="/" className="hover:text-[var(--gta-green)]">Home</Link></li>
            <li><Link to="/services" className="hover:text-[var(--gta-green)]">Store</Link></li>
            <li><Link to="/events" className="hover:text-[var(--gta-green)]">Tournaments</Link></li>
            <li><Link to="/profile" className="hover:text-[var(--gta-green)]">My Profile</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold uppercase mb-4">Support</h4>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li><Link to="/about" className="hover:text-[var(--gta-green)]">About Us</Link></li>
            <li><Link to="/privacy" className="hover:text-[var(--gta-green)]">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-[var(--gta-green)]">Terms & Conditions</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold uppercase mb-4">Connect</h4>
          <p className="text-zinc-500 text-sm mb-2">Join our Discord community for daily updates.</p>
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-zinc-800 rounded-full"></div>
            <div className="w-8 h-8 bg-zinc-800 rounded-full"></div>
            <div className="w-8 h-8 bg-zinc-800 rounded-full"></div>
          </div>
        </div>
      </div>
      
      <div className="text-center pt-8 border-t border-zinc-900">
        <p className="text-zinc-600 text-xs uppercase font-bold tracking-widest">
          Dark Console &copy; 2026. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;