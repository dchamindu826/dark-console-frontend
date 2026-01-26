import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Terms = () => {
  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <Header />
      <div className="max-w-4xl mx-auto py-32 px-4">
        <h1 className="text-4xl font-black uppercase mb-6 text-[var(--gta-green)]">Terms & Conditions</h1>
        <div className="space-y-4 text-zinc-400 leading-relaxed">
          <p><strong>1. Service Delivery:</strong> All services are digital. Delivery times may vary based on server status.</p>
          <p><strong>2. Refunds:</strong> Refunds are only issued if we fail to deliver the service within the agreed timeframe.</p>
          <p><strong>3. User Conduct:</strong> Any abusive behavior towards our staff or community members will result in an immediate ban.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default Terms;