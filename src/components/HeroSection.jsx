import React, { useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three/src/loaders/TextureLoader';
import { motion } from 'framer-motion';

// Images (Ensure paths are correct)
import charGroupImg from '../assets/images/characters-group.png';
import moneyTexImg from '../assets/images/money-bill.png'; 
import gtaBgImg from '../assets/images/gta-city-night.jpg';

// ... (MoneyBill & FallingMoneyScene components ehemama thiyanna) ...
// (Udak code eke thibba MoneyBill saha FallingMoneyScene components tika methanata ganna)

const MoneyBill = ({ texture, isHovering }) => {
    // ... (Old code logic)
    const [pos, setPos] = useState({
        x: (Math.random() - 0.5) * 20,
        y: Math.random() * 10 + 5,
        z: (Math.random() - 0.5) * 5,
        rotX: Math.random() * Math.PI,
        rotY: Math.random() * Math.PI,
        rotZ: Math.random() * Math.PI,
      });
    
      const [speeds] = useState({
        y: Math.random() * 0.05 + 0.02,
        rotX: Math.random() * 0.02,
        rotY: Math.random() * 0.02,
        rotZ: Math.random() * 0.01,
      });
    
      useFrame(() => {
        setPos((prev) => {
          let newY = prev.y - (isHovering ? speeds.y * 2 : speeds.y);
          if (newY < -8) newY = 8;
    
          return {
            ...prev,
            y: newY,
            rotX: prev.rotX + speeds.rotX,
            rotY: prev.rotY + speeds.rotY,
            rotZ: prev.rotZ + speeds.rotZ,
          };
        });
      });
    
      return (
        <mesh position={[pos.x, pos.y, pos.z]} rotation={[pos.rotX, pos.rotY, pos.rotZ]}>
          <planeGeometry args={[0.6, 0.3]} />
          <meshBasicMaterial map={texture} transparent side={2} opacity={0.9} />
        </mesh>
      );
};

const FallingMoneyScene = ({ isHovering }) => {
    const moneyTexture = useLoader(TextureLoader, moneyTexImg);
    return (
      <group>
        {Array(50).fill().map((_, i) => (
          <MoneyBill key={i} texture={moneyTexture} isHovering={isHovering} />
        ))}
      </group>
    );
};

const HeroSection = () => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <section 
      // CHANGE: h-[65vh] for mobile, h-screen for desktop
      className="relative h-[65vh] md:h-screen w-full overflow-hidden flex flex-col justify-center items-center bg-black"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
          <img src={gtaBgImg} alt="GTA City" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-black/50 to-transparent z-10"></div>
      </div>

      {/* 3D Money */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 10] }} gl={{ alpha: true }}>
          <ambientLight intensity={1} />
          <FallingMoneyScene isHovering={isHovering} />
        </Canvas>
      </div>

      {/* Content */}
      <div className="relative z-30 text-center px-4 w-full h-full flex flex-col justify-center pt-20 md:pt-20">
        <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="text-4xl md:text-8xl font-black uppercase tracking-tighter mb-2 text-white drop-shadow-lg"
        >
          Welcome to <br/> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--gta-green)] to-emerald-800 drop-shadow-[0_0_15px_rgba(34,197,94,0.6)]">
            Dark console
          </span>
        </motion.h1>

        <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-zinc-300 text-[10px] md:text-xl max-w-2xl mx-auto mb-2 md:mb-6 font-medium uppercase tracking-wide px-4"
        >
          The #1 Source for Modded Accounts, Cash Drops, and Gang Warfare.
        </motion.p>

        {/* Character Image - Mobile Height Reduced */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          // CHANGE: h-[35vh] for mobile, h-[60vh] for desktop
          className="relative mx-auto w-full max-w-6xl h-[35vh] md:h-[60vh] flex items-end justify-center"
        >
            <div className="absolute bottom-0 w-[60%] h-[60%] bg-[var(--gta-green)] blur-[100px] opacity-20 z-0"></div>
            <img 
                src={charGroupImg} 
                alt="GTA Crew" 
                className="h-full object-contain drop-shadow-2xl z-20 relative object-bottom" 
            />
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-24 md:h-32 bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-transparent z-40"></div>
    </section>
  );
};

export default HeroSection;