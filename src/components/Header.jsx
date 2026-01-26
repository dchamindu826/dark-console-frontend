import React, { useState, useEffect } from 'react';
import { Menu, X, LogIn } from 'lucide-react';
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollScrolled, setScrollScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    const handleScroll = () => setScrollScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    return () => {
      unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login Failed", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <header className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${scrollScrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/5 py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
          <span className="text-[var(--gta-green)] text-3xl">Dark</span>Console
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-zinc-400">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <Link to="/services" className="hover:text-white transition-colors">Services</Link>
          {user && <Link to="/profile" className="hover:text-white transition-colors">My Orders</Link>}
        </nav>

        {/* Auth Section */}
        <div className="hidden md:block">
          {user ? (
            <div className="flex items-center gap-4">
               {/* Click Profile -> Go to /profile page directly */}
               <Link to="/profile" className="flex items-center gap-3 cursor-pointer p-1 pr-4 rounded-full border border-white/10 hover:border-[var(--gta-green)] transition-all bg-white/5">
                  <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full object-cover" />
                  <span className="text-sm font-bold text-white max-w-[100px] truncate">{user.displayName}</span>
               </Link>
               <button onClick={handleLogout} className="text-xs font-bold text-red-500 hover:text-white uppercase">Logout</button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="flex items-center gap-2 bg-[var(--gta-green)] hover:bg-green-500 text-black px-5 py-2 rounded-full font-bold text-sm uppercase tracking-wide transition-all shadow-[0_0_15px_rgba(34,197,94,0.4)]"
            >
              <LogIn size={16} /> Login
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8 md:hidden">
            <Link to="/" className="text-2xl font-black uppercase text-white" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/services" className="text-2xl font-black uppercase text-white" onClick={() => setIsMenuOpen(false)}>Services</Link>
            {user && <Link to="/profile" className="text-2xl font-black uppercase text-white" onClick={() => setIsMenuOpen(false)}>My Orders</Link>}
            
            {user ? (
               <button onClick={handleLogout} className="text-red-500 font-bold uppercase">Logout</button>
            ) : (
              <button onClick={() => { setIsMenuOpen(false); handleLogin(); }} className="text-[var(--gta-green)] text-xl font-bold uppercase">Login with Google</button>
            )}
        </div>
      )}
    </header>
  );
};

export default Header;