import React, { useState, useEffect } from 'react';
import {
  Search, Star, Phone, Check, Scissors, PartyPopper, ChevronDown, UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../api';


const categorizedGarments = {
  "Ceremonial & Ethnic": [
    "Bridal Lehenga",
    "Sherwani",
    "Anarkali Suit",
    "Indo-Western Set",
    "Nehru Jacket / Bandhgala",
    "Sharara / Gharara Set",
    "Traditional Kurta Pajama",
    "Designer Saree Blouse"
  ],
  "Western Formal & Tailoring": [
    "Three-Piece Suit",
    "Tuxedo",
    "Double-Breasted Blazer",
    "Evening Gown",
    "Formal Shirt",
    "Trousers / Chinos",
    "Tailored Waistcoat"
  ],
  "Outerwear & Couture": [
    "Overcoat / Trench Coat",
    "Bespoke Corset",
    "Custom Leather Jacket",
    "Kaftan",
    "Other Custom Creation"
  ]
};

const ReviewSearch = ({ autoPhone }: { autoPhone?: string }) => {
  const [phone, setPhone] = useState("");
  const [foundTailor, setFoundTailor] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [garment, setGarment] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (autoPhone) {
      const cleaned = autoPhone.replace(/\D/g, "").slice(-10);

      if (cleaned.length === 10) {
        console.log("Auto-searching for:", cleaned);
        setPhone(cleaned);

        const trigger = async () => {
          const loadingToast = toast.loading("Auto-verifying Artisan...");
          try {
            const resp = await API.post(`/tailor/search`, {
              contactNo: cleaned
            });
            if (resp.data.status) {
              setFoundTailor(resp.data.data);
              setHasSearched(true);
              toast.success("Identity Verified", { id: loadingToast });
            }
          } catch (err) {
            toast.error("Auto-sync failed. Please search manually.", { id: loadingToast });
          }
        };

        trigger();
      }
    }
  }, [autoPhone]);

  const handleSearch = async (e: React.FormEvent | null, directPhone?: string) => {
    if (e) e.preventDefault();

    const searchNumber = directPhone || phone;
    setHasSearched(true);

    if (searchNumber.length !== 10) {
      toast.error("Please enter a valid 10-digit contact number");
      return;
    }

    const loadingToast = toast.loading("Verifying Artisan Credentials...");

    try {
      const resp = await API.post(`/tailor/search`, { contactNo: searchNumber });

      if (resp.data.status) {
        setFoundTailor(resp.data.data);
        toast.success("Identity Verified", { id: loadingToast });
      }
    } catch (err: any) {
      setFoundTailor(null);
      toast.error("Artisan not found in Registry", { id: loadingToast });
    }
  };

  const submitReview = async () => {
    if (rating === 0 || !garment) {
      toast.error("Please complete all required fields");
      return;
    }

    const savingToast = toast.loading("Syncing with Global Ledger...");

    try {
      const response = await API.post("/tailor/savereview", {
        tailorEmail: foundTailor.email,
        garmentType: garment,
        rating: rating,
        comment: comment,
        phone: phone
      });

      if (response.data.status) {
        toast.success("Legacy Updated", { id: savingToast });
        setShowSuccess(true);
      }
    } catch (error: any) {
      toast.error("Registry Sync Failure", { id: savingToast });
    }
  };

  const handleReset = () => {
    setShowSuccess(false);
    setFoundTailor(null);
    setPhone("");
    setRating(0);
    setComment("");
    setGarment("");
    setHasSearched(false);
  };

  return (
    <div className="w-full font-['Cormorant_Garamond'] text-[#2C2C2C] selection:bg-[#D4AF37]/20">

      {showSuccess && (
        <div className="py-20 text-center animate-in fade-in zoom-in duration-1000">
          <div className="relative inline-block mb-12">
            <div className="absolute inset-0 bg-[#D4AF37]/20 rounded-full blur-3xl animate-pulse" />
            <PartyPopper size={64} className="text-[#D4AF37] relative z-10 mx-auto" strokeWidth={0.5} />
          </div>
          <h2 className="text-6xl font-['Playfair_Display'] italic mb-4">Mastery Acknowledged.</h2>
          <p className="text-[10px] uppercase tracking-[0.6em] opacity-40 mb-12">Your testimonial has been etched into the artisan's history.</p>
          <button onClick={handleReset} className="px-16 py-5 bg-[#2C2C2C] text-white text-[10px] font-black uppercase tracking-[0.5em] hover:bg-[#D4AF37] transition-all shadow-2xl">
            Register Another Experience
          </button>
        </div>
      )}

      {!showSuccess && (
        <div className="max-w-5xl mx-auto">
          {!foundTailor && (
            <section className="animate-in fade-in slide-in-from-top-4 duration-700 mb-12">
              <div className="bg-white border border-[#E5E1DA] p-10 flex flex-col md:flex-row items-center gap-10">
                <div className="flex-1 space-y-2 text-left">
                  <h3 className="text-2xl font-['Playfair_Display'] italic">Identify the Artisan</h3>
                  <p className="text-[10px] uppercase tracking-[0.3em] opacity-40 font-black">Search via Registered Contact</p>
                </div>
                <form onSubmit={(e) => handleSearch(e)} className="flex-[1.5] w-full flex gap-4">
                  <div className="relative flex-1 text-left">
                    <input
                      type="text"
                      placeholder="987 654 3210"
                      value={phone}
                      maxLength={10}
                      onChange={(e) => {
                        const cleanNum = e.target.value.replace(/\D/g, "");
                        setPhone(cleanNum.slice(0, 10));
                      }}
                      className="w-full bg-[#F9F6F2] border-none p-5 outline-none italic text-2xl focus:ring-1 focus:ring-[#D4AF37]/30 transition-all"
                    />
                    <Phone className="absolute right-6 top-6 text-[#D4AF37] opacity-30" size={18} />
                  </div>
                  <button type="submit" className="px-8 bg-[#2C2C2C] text-white hover:bg-[#D4AF37] transition-all group shadow-lg">
                    <Search size={18} className="group-hover:scale-125 transition-transform" />
                  </button>
                </form>
              </div>
            </section>
          )}

          {foundTailor && (
            <div className="animate-in slide-in-from-bottom-10 duration-1000">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-1 bg-white border border-[#E5E1DA] shadow-2xl overflow-hidden">

                <div className="lg:col-span-4 bg-[#2C2C2C] text-white p-12 flex flex-col justify-between relative text-left">
                  <Scissors className="absolute -bottom-10 -left-10 text-white/5 rotate-45" size={200} />
                  <div className="relative z-10 space-y-6">
                    <div className="w-10 h-10 border border-[#D4AF37] rounded-full flex items-center justify-center">
                      <UserCheck size={18} className="text-[#D4AF37]" />
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.5em] text-[#D4AF37] font-black">Identity Confirmed</p>
                    <h4 className="text-5xl font-['Playfair_Display'] italic leading-tight">{foundTailor.fullName}</h4>
                    <p className="text-base italic opacity-50">{foundTailor.city} Atelier</p>
                  </div>

                  {!autoPhone && (
                    <button onClick={() => setFoundTailor(null)} className="relative z-10 text-[9px] uppercase font-black tracking-widest opacity-30 hover:opacity-100 transition-all self-start underline">Change Identification</button>
                  )}
                </div>

                <div className="lg:col-span-8 p-12 md:p-20 space-y-12 bg-white text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                      <label className="text-[10px] uppercase tracking-[0.4em] font-black opacity-30">Garment Origin</label>
                      <div className="relative border-b border-[#E5E1DA] group">
                        <select
                          value={garment}
                          onChange={(e) => setGarment(e.target.value)}
                          className="w-full bg-transparent py-4 outline-none italic text-2xl appearance-none cursor-pointer"
                        >
                          <option value="" disabled>Select Work Type...</option>
                          {Object.entries(categorizedGarments).map(([category, items]) => (
                            <optgroup key={category} label={category} className="font-sans text-xs uppercase tracking-widest text-[#D4AF37] bg-[#2C2C2C] my-2">
                              {items.map((item) => (
                                <option key={item} value={item} className="text-black font-serif italic text-base py-1">
                                  {item}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-0 top-6 text-[#D4AF37] pointer-events-none group-hover:translate-y-1 transition-transform" size={16} />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] uppercase tracking-[0.4em] font-black opacity-30">Mastery Rating</label>
                      <div className="flex gap-4 pt-4">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button key={s} onClick={() => setRating(s)} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)} className="transition-transform hover:scale-125">
                            <Star size={28} fill={(hover || rating) >= s ? "#D4AF37" : "none"} className={(hover || rating) >= s ? "text-[#D4AF37]" : "text-[#E5E1DA]"} strokeWidth={0.5} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-[0.4em] font-black opacity-30">The Testimonial</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Discuss the precision of the fit..."
                      rows={4}
                      className="w-full bg-[#F9F6F2] border-none p-8 outline-none italic text-xl focus:ring-1 focus:ring-[#D4AF37]/20 transition-all resize-none leading-relaxed"
                    />
                  </div>

                  <button onClick={submitReview} className="w-full py-6 bg-[#2C2C2C] text-white text-[10px] font-black uppercase tracking-[0.6em] flex items-center justify-center gap-6 hover:bg-[#D4AF37] transition-all shadow-xl group">
                    Commit to Ledger <Check size={18} className="group-hover:scale-150 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewSearch;