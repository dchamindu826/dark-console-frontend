import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, CreditCard, Tag, X, LogIn } from 'lucide-react';
import Header from '../components/Header';
import apiClient from '../api/client';
import { formatLKR } from '../utils/currency';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

const Services = () => {
  const [services, setServices] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Mod Accounts");
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Auth & Nav
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Checkout States
  const [platform, setPlatform] = useState("Steam");
  const [version, setVersion] = useState("Enhanced");
  const [contact, setContact] = useState("");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [slipImage, setSlipImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchServices();
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const fetchServices = async () => {
    try {
      const { data } = await apiClient.get('/services');
      setServices(data);
    } catch (error) { console.error("Failed load services"); }
  };

  const handleGoogleLogin = async () => {
      try { await signInWithPopup(auth, googleProvider); } catch (error) { alert("Login Failed"); }
  };

  const handleApplyCoupon = async () => {
    try {
        const { data } = await apiClient.post('/coupons/validate', { code: coupon });
        if(data.success) {
            setDiscount(data.discount);
            alert(`Coupon Applied! ${data.discount}% OFF`);
        }
    } catch (err) {
        alert("Invalid Coupon Code");
        setDiscount(0);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSlipImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePlaceOrder = async () => {
    if(!contact || !slipImage) return alert("Please enter WhatsApp number and upload slip!");
    if(!user) return alert("Please login to place an order!"); // Safety check
    
    setIsSubmitting(true);
    const finalPrice = selectedProduct.price * ((100 - discount) / 100);

    const orderData = {
        userId: user.uid, // 🔥🔥 ADDED: This links the order to the user profile
        orderType: 'service',
        customer: { name: user.displayName, contact: contact },
        packageDetails: {
            title: selectedProduct.title,
            price: finalPrice,
            platform: activeCategory !== 'Mod Accounts' ? platform : 'N/A',
            version: activeCategory !== 'Mod Accounts' ? version : 'N/A'
        },
        paymentSlip: slipImage
    };

    try {
        await apiClient.post('/orders', orderData);
        alert("Order Placed Successfully!");
        
        // Clear & Redirect
        setSelectedProduct(null);
        setSlipImage(null);
        navigate('/profile'); 
        
    } catch (error) {
        console.error("Order Error:", error);
        alert("Order Failed. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const filteredProducts = services.filter(p => p.category === activeCategory);

  return (
    <div className="bg-[#09090b] min-h-screen text-white pt-24 pb-20">
      <Header />
      
      {/* Scrollbar Hide CSS */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
           <h1 className="text-4xl md:text-5xl font-black uppercase mb-4 tracking-tight">
              Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--gta-green)] to-emerald-800">Store</span>
           </h1>
           <p className="text-zinc-400 uppercase tracking-widest text-sm font-bold">Select your category below</p>
        </div>

        <div className="flex justify-center gap-4 mb-16 flex-wrap">
            {["Mod Accounts", "Boost", "Packages"].map(cat => (
                <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-8 py-3 rounded-full font-black uppercase tracking-wider text-sm transition-all duration-300 border ${
                      activeCategory === cat 
                      ? 'bg-[var(--gta-green)] text-black border-[var(--gta-green)] shadow-[0_0_20px_rgba(34,197,94,0.4)] scale-105' 
                      : 'bg-black/50 border-zinc-800 text-zinc-500 hover:border-zinc-500 hover:text-white'
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map(product => (
                <motion.div 
                  key={product._id} 
                  layout 
                  className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 group hover:border-[var(--gta-green)] transition-all duration-300 hover:shadow-2xl hover:shadow-green-900/20 flex flex-col h-full"
                >
                    <div className="aspect-video w-full bg-black relative overflow-hidden">
                         <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                         <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent opacity-80"></div>
                         <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-xl font-black uppercase text-white leading-tight drop-shadow-md">{product.title}</h3>
                         </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                        <div className="mb-6 flex-1">
                          <p className="text-zinc-400 text-sm line-clamp-3">{product.description}</p>
                        </div>
                        <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                            <div>
                                <p className="text-xs text-zinc-500 uppercase font-bold">Price</p>
                                <p className="text-2xl font-sans font-bold text-[var(--gta-green)]">{formatLKR(product.price)}</p>
                            </div>
                            <button onClick={() => setSelectedProduct(product)} className="bg-white hover:bg-[var(--gta-green)] text-black font-black uppercase py-3 px-6 rounded-lg transition-colors text-sm tracking-wide">
                                Buy Now
                            </button>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
      </div>

      {/* --- CHECKOUT MODAL --- */}
      {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
              <div className="bg-[#09090b] border border-zinc-700 w-full max-w-4xl rounded-2xl overflow-hidden relative shadow-2xl flex flex-col md:flex-row my-8">
                  <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 z-50 bg-black/50 p-2 rounded-full text-white hover:bg-red-500 transition-colors"><X size={20}/></button>
                  
                  {/* Left Side: Product Info */}
                  <div className="w-full md:w-1/3 bg-zinc-900 p-8 flex flex-col">
                      <div className="w-full aspect-video rounded-xl overflow-hidden mb-6 border border-zinc-700">
                          <img src={selectedProduct.image} className="w-full h-full object-cover" />
                      </div>
                      <h2 className="text-2xl font-black uppercase text-white mb-2 leading-none">{selectedProduct.title}</h2>
                      <p className="text-[var(--gta-green)] font-sans font-bold text-2xl mb-4">{formatLKR(selectedProduct.price)}</p>
                      
                      <p className="text-zinc-400 text-sm whitespace-pre-wrap max-h-[200px] overflow-y-auto scrollbar-hide">
                          {selectedProduct.description}
                      </p>
                  </div>

                  {/* Right Side: Form */}
                  <div className="w-full md:w-2/3 p-8">
                      <h3 className="text-xl font-black uppercase mb-6 flex items-center gap-2"><CreditCard className="text-[var(--gta-green)]"/> Secure Checkout</h3>

                      <div className="space-y-4">
                          {/* Platform (Conditional) */}
                          {activeCategory !== "Mod Accounts" && (
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">Platform</label>
                                      <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full bg-black border border-zinc-700 p-2 rounded-lg text-white text-sm focus:border-[var(--gta-green)] outline-none">
                                          <option>Steam</option>
                                          <option>Epic Games</option>
                                          <option>Rockstar Launcher</option>
                                      </select>
                                  </div>
                                  <div>
                                      <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">Version</label>
                                      <select value={version} onChange={(e) => setVersion(e.target.value)} className="w-full bg-black border border-zinc-700 p-2 rounded-lg text-white text-sm focus:border-[var(--gta-green)] outline-none">
                                          <option>Enhanced (Next-Gen)</option>
                                          <option>Legacy (Old Gen)</option>
                                      </select>
                                  </div>
                              </div>
                          )}
                          
                          <div>
                              <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">WhatsApp Number</label>
                              <input type="text" value={contact} onChange={e => setContact(e.target.value)} placeholder="+94 7X..." className="w-full bg-black border border-zinc-700 p-3 rounded-lg text-white text-sm focus:border-[var(--gta-green)] outline-none" />
                          </div>

                          <div className="flex gap-2">
                              <input type="text" placeholder="Coupon Code" value={coupon} onChange={e => setCoupon(e.target.value)} className="flex-1 bg-black border border-zinc-700 p-3 rounded-lg text-white uppercase text-sm" />
                              <button onClick={handleApplyCoupon} className="bg-zinc-800 px-4 rounded-lg font-bold uppercase text-xs hover:text-[var(--gta-green)]"><Tag size={16}/></button>
                          </div>

                          {/* PAYMENT OPTIONS */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Bank Details */}
                              <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                                  <p className="text-xs font-bold text-zinc-400 uppercase border-b border-zinc-800 pb-2 mb-2">Local Bank Transfer</p>
                                  <div className="space-y-2">
                                      <div><p className="text-[10px] text-zinc-500 uppercase">Bank</p><p className="text-white text-xs font-bold">Peoples Bank</p></div>
                                      <div><p className="text-[10px] text-zinc-500 uppercase">Branch</p><p className="text-white text-xs font-bold">Kahawatta</p></div>
                                      <div><p className="text-[10px] text-zinc-500 uppercase">Acc Name</p><p className="text-white text-xs font-bold">Yomal Diloshana</p></div>
                                      <div><p className="text-[10px] text-zinc-500 uppercase">Acc No</p><p className="text-[var(--gta-green)] font-mono font-bold text-sm">155200110073882</p></div>
                                  </div>
                              </div>
                              
                              {/* Crypto Details */}
                              <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                                  <p className="text-xs font-bold text-zinc-400 uppercase border-b border-zinc-800 pb-2 mb-2">Crypto Payment</p>
                                  <div className="space-y-4">
                                      <div>
                                          <p className="text-[10px] text-zinc-500 uppercase">Binance Pay ID</p>
                                          <p className="text-[var(--gta-green)] font-mono font-bold text-sm">577115246</p>
                                      </div>
                                      <div>
                                          <p className="text-[10px] text-zinc-500 uppercase">USDT (TRC20)</p>
                                          <p className="text-white text-[10px] break-all font-mono">TDhVpGzM6s6u8T4osAUR9Yqh14o5Hgoj8u</p>
                                      </div>
                                      <p className="text-[10px] text-yellow-500 italic mt-2">* Send screenshot of transaction.</p>
                                  </div>
                              </div>
                          </div>

                          <label className={`block w-full border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${slipImage ? 'border-[var(--gta-green)] bg-green-900/10' : 'border-zinc-700 hover:border-zinc-500'}`}>
                              <Upload className={`mx-auto mb-2 ${slipImage ? 'text-[var(--gta-green)]' : 'text-zinc-500'}`} />
                              <span className="text-xs font-bold uppercase text-zinc-400">{slipImage ? "Slip Attached" : "Upload Bank/Crypto Slip"}</span>
                              <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                          </label>

                          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                              <div>
                                  {discount > 0 && <span className="block text-xs text-red-500 line-through">{formatLKR(selectedProduct.price)}</span>}
                                  <span className="text-2xl font-sans font-black text-[var(--gta-green)]">{formatLKR(selectedProduct.price * ((100-discount)/100))}</span>
                              </div>
                              
                              {user ? (
                                <button onClick={handlePlaceOrder} disabled={isSubmitting} className="bg-[var(--gta-green)] hover:bg-emerald-500 text-black font-black uppercase py-3 px-8 rounded-xl transition-all">
                                    {isSubmitting ? "Processing..." : "Confirm Order"}
                                </button>
                              ) : (
                                <button onClick={handleGoogleLogin} className="bg-white hover:bg-zinc-200 text-black font-black uppercase py-3 px-8 rounded-xl transition-all flex items-center gap-2">
                                    <LogIn size={18} /> Login to Order
                                </button>
                              )}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
export default Services;