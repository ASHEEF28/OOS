import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { ParticleBackground } from '../components/common/ParticleBackground';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#080B14] text-[#F1F5F9] flex flex-col relative selection:bg-cyan-500/20 selection:text-cyan-200">
      <ParticleBackground />
      <Navbar />
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
