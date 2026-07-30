import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Star, ChevronLeft, Scissors } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../api';

const LeaveReview = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { tailorName, tailorEmail } = location.state || {};

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [garmentType, setGarmentType] = useState("Bespoke Suit");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const customerEmail = localStorage.getItem("userEmail");

        try {
            const res = await API.post("/customer/add-review", {
                tailorEmail,
                customerEmail,
                rating,
                comment,
                garmentType
            });

            if (res.data.status) {
                toast.success(`Review recorded for ${tailorName}`);
                navigate('/customer-dashboard');
            }
        } catch (err) {
            toast.error("Failed to update ledger");
        }
    };

    return (
        <div className="min-h-screen bg-[#F9F6F2] py-20 px-6 font-['Cormorant_Garamond']">
            <div className="max-w-2xl mx-auto bg-white border border-[#E5E1DA] p-12 shadow-2xl relative">
                <button onClick={() => navigate(-1)} className="absolute top-8 left-8 opacity-30 hover:opacity-100 transition-opacity">
                    <ChevronLeft size={20} />
                </button>

                <header className="text-center mb-12 space-y-4">
                    <div className="w-12 h-12 bg-[#2C2C2C] rounded-full flex items-center justify-center text-white mx-auto mb-6">
                        <Scissors size={20} />
                    </div>
                    <h2 className="text-4xl font-['Playfair_Display'] italic">The Ledger Entry</h2>
                    <p className="text-[10px] uppercase font-black tracking-[0.4em] opacity-40">Reviewing: {tailorName}</p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-10">
                    {/* STAR RATING */}
                    <div className="flex flex-col items-center gap-4">
                        <p className="text-[10px] uppercase font-black tracking-[0.2em] opacity-30">Quality of Craftsmanship</p>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((num) => (
                                <button key={num} type="button" onClick={() => setRating(num)}>
                                    <Star 
                                        size={24} 
                                        fill={num <= rating ? "#D4AF37" : "none"} 
                                        className={num <= rating ? "text-[#D4AF37]" : "text-[#E5E1DA]"} 
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* GARMENT TYPE */}
                    <div className="space-y-3">
                        <label className="text-[10px] uppercase font-black tracking-[0.2em] opacity-30">Garment Type</label>
                        <input 
                            type="text" 
                            value={garmentType} 
                            onChange={(e) => setGarmentType(e.target.value)}
                            className="w-full bg-[#F9F6F2] border-none p-4 text-xl italic font-['Playfair_Display'] focus:ring-1 focus:ring-[#D4AF37]"
                            placeholder="e.g. Wedding Sherwani"
                        />
                    </div>

                    {/* COMMENT */}
                    <div className="space-y-3">
                        <label className="text-[10px] uppercase font-black tracking-[0.2em] opacity-30">Testimonial</label>
                        <textarea 
                            rows={4}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full bg-[#F9F6F2] border-none p-4 text-lg italic font-light focus:ring-1 focus:ring-[#D4AF37]"
                            placeholder="Describe your bespoke experience..."
                            required
                        />
                    </div>

                    <button className="w-full py-5 bg-[#2C2C2C] text-white text-[10px] font-black uppercase tracking-[0.5em] hover:bg-[#D4AF37] transition-all">
                        Commit to Ledger
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LeaveReview;