import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <Header />
      <div className="max-w-4xl mx-auto py-32 px-4">
        <h1 className="text-4xl font-black uppercase mb-6 text-[var(--gta-green)]">About Us</h1>
        <div className="space-y-4 text-zinc-400 leading-relaxed">
          <p>Welcome to Dark Console, Sri Lanka's premier gaming service provider dedicated to the GTA V Online community.</p>
          <p>Founded in 2024, we started with a simple mission: to provide secure, fast, and reliable boosting services for gamers who want to enjoy the game without the grind. Today, we have grown into a full-scale platform hosting tournaments, community events, and offering top-tier digital services.</p>
          <p>Our team consists of professional gamers and developers who are passionate about creating the best ecosystem for our players.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default AboutUs;