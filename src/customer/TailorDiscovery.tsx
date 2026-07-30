import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, Filter, MapPin, RotateCcw, Scissors, Sparkles, Award, ListFilter } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../api';

const TailorDiscovery = () => {
  const navigate = useNavigate();
  const [allTailors, setAllTailors] = useState<any[]>([]);
  const [filteredTailors, setFilteredTailors] = useState<any[]>([]);
  const [availableSpecs, setAvailableSpecs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [speciality, setSpeciality] = useState("");
  const [minExp, setMinExp] = useState("");
  const [sortBy, setSortBy] = useState("rank"); 
  
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 6;

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [tailorRes, specRes] = await Promise.all([
          API.get("/tailor/all"),
          API.get("/tailor/specialities")
        ]);
        if (tailorRes.data.status) {
          setAllTailors(tailorRes.data.data);
          setFilteredTailors(tailorRes.data.data);
        }
        if (specRes.data.status) setAvailableSpecs(specRes.data.data);
      } catch (err) {
        toast.error("Registry connection failed");
      } finally {
        setTimeout(() => setIsLoading(false), 800);
      }
    };
    loadData();
  }, []);

  const handleSearch = () => {
    let results = [...allTailors];
    if (category !== "All") 
      results = results.filter(t => t.category === category || t.category === "All");
    if (speciality) results = results.filter(t => t.speciality === speciality);
    if (minExp) {
      const currentYear = new Date().getFullYear();
      results = results.filter(t => (currentYear - parseInt(t.since)) >= parseInt(minExp));
    }
    setFilteredTailors(results);
    setCurrentPage(1);
    toast.success(`${results.length} Artisans Located`);
  };

  const resetFilters = () => {
    setCategory("All");
    setSpeciality("");
    setMinExp("");
    setSortBy("rank");
    setFilteredTailors(allTailors);
    setCurrentPage(1);
    toast("Registry Reset", { icon: '🔄' });
  };


  const getSortedCards = () => {
    let sorted = [...filteredTailors];
    if (sortBy === "experience") {
      sorted.sort((a, b) => parseInt(a.since) - parseInt(b.since));
    } else if (sortBy === "rating") {
      sorted.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
    } else {
      sorted.sort((a, b) => (a.marketRank || 999) - (b.marketRank || 999));
    }
    return sorted.slice((currentPage - 1) * cardsPerPage, currentPage * cardsPerPage);
  };

  const totalPages = Math.ceil(filteredTailors.length / cardsPerPage);
  const currentCards = getSortedCards();

  const SkeletonCard = () => (
    <div className="space-y-6 animate-pulse">
      <div className="aspect-[4/5] bg-[#F2EDE4] border border-[#E5E1DA]" />
      <div className="space-y-3">
        <div className="h-8 bg-[#F2EDE4] w-3/4" />
        <div className="h-3 bg-[#F2EDE4] w-1/2" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col md:flex-row font-['Cormorant_Garamond']">
      <div className="w-full md:w-1/4 bg-[#F2EDE4] p-10 border-r border-[#E5E1DA] md:h-screen md:sticky md:top-0 flex flex-col justify-between text-left relative z-10">
        <button onClick={() => navigate('/customer-dashboard')} className="absolute top-8 left-8 group flex items-center gap-1 text-[9px] uppercase tracking-[0.3em] font-black opacity-30 hover:opacity-100 hover:text-[#D4AF37] transition-all">
          <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Hub</span>
        </button>

        <div className="space-y-12 pt-12">
          <div className="space-y-2">
            <h2 className="text-[10px] tracking-[0.5em] uppercase font-['Montserrat'] font-black text-[#D4AF37]">The Atelier</h2>
            <h1 className="text-5xl font-['Playfair_Display'] italic text-[#2C2C2C] leading-none">Artisan <br /> Search.</h1>
            <div className="w-12 h-[1px] bg-[#D4AF37] mt-4" />
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-[9px] uppercase tracking-[0.3em] font-black opacity-30">Clientele Preference</label>
              <div className="flex flex-wrap gap-2">
                {["All", "Men", "Women", "Children"].map(cat => (
                  <button key={cat} onClick={() => setCategory(cat)} className={`px-4 py-2 text-[9px] uppercase tracking-widest font-black border transition-all duration-300 ${category === cat ? 'bg-[#2C2C2C] text-white border-[#2C2C2C]' : 'border-[#2C2C2C]/10 hover:border-[#D4AF37]'}`}>{cat}</button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[9px] uppercase tracking-[0.3em] font-black opacity-30">Mastery Domain</label>
              <div className="relative border-b border-[#2C2C2C]/10 focus-within:border-[#D4AF37] transition-all">
                <select value={speciality} onChange={(e) => setSpeciality(e.target.value)} className="w-full bg-transparent py-4 outline-none italic text-2xl appearance-none cursor-pointer">
                  <option value="">All Masteries</option>
                  {availableSpecs.map(s => <option key={s} value={s} className="not-italic text-sm">{s}</option>)}
                </select>
                <Filter className="absolute right-0 top-5 text-[#D4AF37]" size={16} />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[9px] uppercase tracking-[0.3em] font-black opacity-30">Years of Practice</label>
              <div className="relative border-b border-[#2C2C2C]/10 focus-within:border-[#D4AF37] transition-all">
                <select value={minExp} onChange={(e) => setMinExp(e.target.value)} className="w-full bg-transparent py-4 outline-none italic text-2xl appearance-none cursor-pointer">
                  <option value="">Any Experience</option>
                  <option value="5" className="not-italic text-sm">5+ Years of Mastery</option>
                  <option value="10" className="not-italic text-sm">10+ Years of Mastery</option>
                  <option value="20" className="not-italic text-sm">Legacy (20+ Years)</option>
                </select>
                <Award className="absolute right-0 top-5 text-[#D4AF37]" size={16} />
              </div>
            </div>

            <div className="space-y-4 pt-6">
              <button onClick={handleSearch} className="w-full bg-[#2C2C2C] text-white py-6 text-[11px] tracking-[0.5em] uppercase font-black hover:bg-[#D4AF37] transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 duration-200">Scan Registry <Search size={14} /></button>
              <button onClick={resetFilters} className="w-full flex items-center justify-center gap-2 text-[9px] uppercase tracking-widest font-black opacity-40 hover:opacity-100 transition-all pt-2"><RotateCcw size={12} /> Reset Parameters</button>
            </div>
          </div>
        </div>
        <div className="opacity-20 flex items-center gap-3 pt-10"><Scissors size={14} /><span className="text-[8px] uppercase tracking-[0.4em] font-black">StitchConnect System v2.0</span></div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="flex-1 p-12 md:p-20 bg-[#FDFCFB] overflow-y-auto">
        
        {/* --- SORT LEDGER --- */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 pb-6 border-b border-[#F2EDE4]">
          <div className="space-y-1 text-left">
            <p className="text-[10px] uppercase tracking-[0.4em] font-black opacity-30">Artisan Registry</p>
            <p className="text-sm italic opacity-60">Showing {filteredTailors.length} results in the guild</p>
          </div>

          <div className="flex items-center gap-8 mt-6 md:mt-0">
            <div className="flex items-center gap-4">
              <label className="text-[9px] uppercase tracking-widest font-black opacity-30 flex items-center gap-2">
                <ListFilter size={12} /> Sort By:
              </label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent outline-none italic text-lg cursor-pointer hover:text-[#D4AF37] transition-colors"
              >
                <option value="rank">Market Rank</option>
                <option value="experience">Seniority (Legacy)</option>
                <option value="rating">Highest Rating</option>
              </select>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filteredTailors.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
            <Search size={48} strokeWidth={1} /><h2 className="text-4xl italic font-['Playfair_Display']">No artisans found.</h2>
            <button onClick={resetFilters} className="text-[10px] uppercase tracking-widest font-black underline underline-offset-8">Clear Search</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {currentCards.map((t) => (
              <div key={t._id} onClick={() => navigate(`/artisan/${t._id}`, { state: { from: 'search' } })} className="group cursor-pointer space-y-6">
                <div className="aspect-[4/5] bg-[#F9F6F2] overflow-hidden relative border border-[#E5E1DA] group-hover:border-[#D4AF37] transition-all duration-700 shadow-sm group-hover:shadow-2xl">
                  <img src={t.picurl || "https://images.unsplash.com/photo-1598501479155-90b512335046?q=80&w=2030&auto=format&fit=crop"} alt={t.fullName} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105 grayscale-[40%] group-hover:grayscale-0" />
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <div className="bg-[#2C2C2C] text-white text-[8px] px-3 py-1 font-black uppercase tracking-widest shadow-lg">Rank #{t.marketRank || "N/A"}</div>
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center"><span className="text-white text-[10px] font-black uppercase tracking-[0.5em] border border-white/30 px-6 py-3 backdrop-blur-sm scale-90 group-hover:scale-100 transition-transform">Consult Dossier</span></div>
                </div>

                <div className="text-left space-y-2 relative">
                  <div className="flex justify-between items-start">
                    <h3 className="text-3xl font-['Playfair_Display'] italic leading-tight group-hover:text-[#D4AF37] transition-colors">{t.fullName}</h3>
                    <Sparkles size={14} className="text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0" />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] uppercase tracking-[0.3em] font-black opacity-40">Specializing in {t.speciality}</p>
                    <span className="text-[10px] italic opacity-40">{new Date().getFullYear() - parseInt(t.since)}yrs Exp.</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm italic opacity-60 pt-2"><MapPin size={14} className="text-[#D4AF37]" /> {t.city}, {t.state}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- PAGINATION --- */}
        {!isLoading && totalPages > 1 && (
          <div className="mt-24 flex items-center justify-center gap-12 pt-12 border-t border-[#E5E1DA]">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="group flex items-center gap-3 text-[10px] uppercase tracking-widest font-black disabled:opacity-10 hover:text-[#D4AF37] transition-all">
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> Prev
            </button>
            <div className="text-center">
              <span className="text-3xl font-['Playfair_Display'] italic">{currentPage}</span>
              <span className="mx-3 opacity-20">/</span>
              <span className="text-xl opacity-40 font-['Playfair_Display'] italic">{totalPages}</span>
            </div>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="group flex items-center gap-3 text-[10px] uppercase tracking-widest font-black disabled:opacity-10 hover:text-[#D4AF37] transition-all">
              Next <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform"/>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TailorDiscovery;