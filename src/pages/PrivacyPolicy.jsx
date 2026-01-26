import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <Header />
      <div className="max-w-4xl mx-auto py-32 px-4">
        <h1 className="text-4xl font-black uppercase mb-6 text-[var(--gta-green)]">Privacy Policy</h1>
        <div className="space-y-4 text-zinc-400 leading-relaxed">
          <p><strong>1. Information We Collect:</strong> We collect only necessary information such as your name, contact details, and game ID to process your orders.</p>
          <p><strong>2. How We Use Information:</strong> Your data is used solely for service delivery and communication regarding your orders.</p>
          <p><strong>3. Data Security:</strong> We implement strict security measures. We never share your personal details with third parties.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default PrivacyPolicy;