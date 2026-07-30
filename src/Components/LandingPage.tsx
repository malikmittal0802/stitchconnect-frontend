import { useNavigate } from 'react-router-dom';
import { Scissors, ArrowRight, MousePointer2, ShieldCheck, Globe, Star } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-['Cormorant_Garamond'] text-[#2C2C2C] overflow-x-hidden">
      
      {/* --- MINIMALIST NAV --- */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 md:px-20 py-10 mix-blend-difference text-white lg:text-[#2C2C2C] lg:mix-blend-normal">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#2C2C2C] rounded-full flex items-center justify-center text-white">
            <Scissors size={14} />
          </div>
          <span className="text-[10px] font-black tracking-[0.5em] uppercase">StitchConnect</span>
        </div>
        
        <div className="hidden md:flex items-center gap-12 text-[9px] uppercase tracking-[0.3em] font-black">
          <button onClick={() => navigate('/marketplace')} className="hover:text-[#D4AF37] transition-colors">The Marketplace</button>
          <button onClick={() => navigate('/login')} className="px-8 py-3 bg-[#2C2C2C] text-white hover:bg-[#D4AF37] transition-all shadow-xl">Enter Registry</button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Mood Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=2080&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-[0.15] scale-110"
            alt="Textile Texture"
          />
        </div>

        <div className="relative z-10 text-center space-y-12 max-w-5xl px-6">
          <div className="flex flex-col items-center gap-4">
             <div className="h-[1px] w-20 bg-[#D4AF37]" />
             <span className="text-[11px] uppercase tracking-[0.8em] font-['Montserrat'] font-black text-[#D4AF37]">The Premier Artisan Guild</span>
          </div>

          <h1 className="text-7xl md:text-9xl font-['Playfair_Display'] italic leading-tight tracking-tighter text-[#2C2C2C]">
            Bespoke <br /> 
            <span className="not-italic">Connections.</span>
          </h1>

          <p className="text-xl md:text-2xl italic opacity-60 max-w-2xl mx-auto leading-relaxed font-light">
            "A digital atelier where master tailors and discerning clients converge to craft the perfect fit."
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 pt-8">
            <button 
              onClick={() => navigate('/signup')}
              className="group relative px-16 py-6 bg-[#2C2C2C] text-white text-[11px] tracking-[0.5em] font-black uppercase hover:bg-[#D4AF37] transition-all duration-500 shadow-2xl flex items-center gap-4"
            >
              Join the Guild
              <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </button>
            <button 
              onClick={() => navigate('/marketplace')}
              className="text-[11px] tracking-[0.5em] uppercase font-black border-b border-[#2C2C2C]/20 pb-2 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all"
            >
              Explore Artisans
            </button>
          </div>
        </div>

        {/* Decorative Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-30">
          <span className="text-[8px] uppercase tracking-[0.4em] font-black vertical-text">Scroll to Discover</span>
          <div className="w-[1px] h-12 bg-[#2C2C2C] animate-pulse" />
        </div>
      </section>

      {/* --- SPLIT FEATURE SECTION --- */}
      <section className="py-32 px-8 md:px-20 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="relative aspect-[4/5] bg-[#F2EDE4] overflow-hidden group">
          <img 
            src="https://images.unsplash.com/photo-1520004434532-668416a08753?q=80&w=2070&auto=format&fit=crop" 
            className="w-full h-full object-cover grayscale-[50%] group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
            alt="Artisan workspace"
          />
          <div className="absolute inset-0 border-[20px] border-white/10 pointer-events-none" />
        </div>

        <div className="text-left space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-['Playfair_Display'] italic leading-tight">Mastery in <br /> Every Stitch.</h2>
            <p className="text-xl italic opacity-50 max-w-md">Our registry hosts the world's most talented artisans, from heritage tailors to modern designers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {[
              { icon: <ShieldCheck size={20}/>, title: "Verified Registry", desc: "Every artisan is vetted for quality and legacy." },
              { icon: <Globe size={20}/>, title: "Global Reach", desc: "Connect with tailors across the Indian subcontinent." },
              { icon: <Star size={20}/>, title: "Starred Work", desc: "Browse portfolios of real masterpieces." },
              { icon: <MousePointer2 size={20}/>, title: "Seamless Hire", desc: "Book appointments with a single click." }
            ].map((item, i) => (
              <div key={i} className="space-y-3">
                <div className="text-[#D4AF37]">{item.icon}</div>
                <h4 className="text-[10px] uppercase font-black tracking-widest">{item.title}</h4>
                <p className="text-sm italic opacity-60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-35 bg-[#2C2C2C] text-white text-center space-y-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
        
        <h2 className="text-5xl md:text-7xl font-['Playfair_Display'] italic relative z-10">Ready to redefine your <br /> wardrobe?</h2>
        
        <div className="flex justify-center pt-8 relative z-10">
          <button 
            onClick={() => navigate('/signup')}
            className="px-20 py-6 bg-white text-[#2C2C2C] text-[11px] tracking-[0.5em] font-black uppercase hover:bg-[#D4AF37] hover:text-white transition-all shadow-2xl"
          >
            Start Your Journey
          </button>
        </div>

        <div className="pt-20 opacity-60 text-[9px] uppercase tracking-[0.6em] font-black">
          StitchConnect © 2026 • Crafted with Excellence
        </div>
      </section>

    </div>
  );
};

export default LandingPage;