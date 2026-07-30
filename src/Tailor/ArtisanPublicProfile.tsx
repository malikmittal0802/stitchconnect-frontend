import { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
    Scissors, Star, MapPin, Plus, ChevronLeft, Heart, Quote, Zap, CheckCircle
} from 'lucide-react';

import toast from 'react-hot-toast';
import API from '../api';

const ArtisanPublicProfile = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();
    const [profile, setProfile] = useState<any>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [userFavs, setUserFavs] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<any>(null);
    const isStarred = selectedImage ? userFavs.includes(selectedImage.publicId) : false;

    const scrollToLedger = () => {
        const ledger = document.getElementById('ledger-section');
        ledger?.scrollIntoView({ behavior: 'smooth' });
    };
    const goBack = () => {
        const origin = location.state?.from;

        if (origin === 'search') {
            navigate('/marketplace');
        } else if (origin === 'dashboard') {
            navigate('/customer-dashboard');
        } else {
            navigate('/marketplace');
        }
    };
    const handleRequestLook = (e: React.MouseEvent) => {
        const customerEmail = localStorage.getItem("userEmail");
        const customerName = localStorage.getItem("userName") || "A Client";

        if (!customerEmail) {
            e.preventDefault();
            toast.error("Please login to request this look ");
            return;
        }

        const message = `Greetings ${profile.fullName}, 

I am ${customerName} and I am absolutely captivated by this specific masterpiece from your *StitchConnect* showroom. 

I would like to request a consultation for this look:
*Design Link:* ${selectedImage.url}
*Estimated Price:* ₹${selectedImage.price}

Are you available to discuss measurements?`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${profile.contactNo}?text=${encodedMessage}`;

        toast.success("Sending design to Atelier...");
        window.open(whatsappUrl, '_blank');
    };

    const handleToggleFavorite = async (item: any) => {
        const customerEmail = localStorage.getItem("userEmail");
        if (!customerEmail) return toast.error("Please login first");

        try {
            const res = await API.post("/customer/toggle-fav", {
                customerEmail,
                tailorEmail: profile.email,
                tailorName: profile.fullName,
                imageUrl: item.url,
                publicId: item.publicId,
                price: item.price
            });

            if (res.data.status) {
                toast.success(res.data.msg);

                if (res.data.action === "removed") {
                    setUserFavs(prev => prev.filter(id => id !== item.publicId));
                } else {
                    setUserFavs(prev => [...prev, item.publicId]);
                }
            }
        } catch (err) {
            toast.error("Registry sync failed");
        }
    };

    const handleHireEngagement = async () => {
        const customerEmail = localStorage.getItem("userEmail");
        const customerName = localStorage.getItem("userName") || "A Client";

        if (!customerEmail) {
            toast.error("Please login to contact this artisan");
            return;
        }

        const loadingToast = toast.loading("Preparing WhatsApp Registry...");

        try {
            await API.post("/tailor/log-hiring-intent", {
                customerEmail,
                tailorEmail: profile.email,
                tailorName: profile.fullName,
                tailorId: id,
                category: profile.category,
                city: profile.city,
                contactNo: profile.contactNo

            });

            // 2. Construct the WhatsApp Message
            const message = `Greetings ${profile.fullName}, I discovered your artistry on *StitchConnect*. 

I am ${customerName}, and I am interested in collaborating with you for a bespoke project. Could we discuss the details?

*Registry Ref:* ${customerEmail.split('@')[0]}`;

            // 3. Encode and Redirect
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/${profile.contactNo}?text=${encodedMessage}`;

            toast.success("Redirecting to Atelier WhatsApp", { id: loadingToast });

            // Open in a new tab so they don't lose the showroom page
            window.open(whatsappUrl, '_blank');

        } catch (err) {
            toast.error("Registry connection lost", { id: loadingToast });
        }
    };

    const handleDirectCall = (e: React.MouseEvent) => {
        const customerEmail = localStorage.getItem("userEmail");

        if (!customerEmail) {
            e.preventDefault();
            toast.error("Please login to access artisan contact details");
            return;
        }
        toast.success("Initiating secure line to Atelier...");
    };

    useEffect(() => {
        const fetchPublicData = async () => {
            setProfile(null);
            setReviews([]);
            setLoading(true);

            try {
                const res = await API.get(`/tailor/public-profile/${id}`);
                setProfile(res.data.profile);
                setReviews(res.data.reviews);
            } catch (err) {
                console.error("Fetch failed.");
                toast.error("Showroom is currently offline");
            } finally {
                setLoading(false);
            }
        };
        fetchPublicData();
    }, [id]); // id remains here to trigger the refresh on navigation

    useEffect(() => {
        const email = localStorage.getItem("userEmail");
        if (email) {
            API.get(`/customer/dashboard-stats/${email}`)
                .then(res => {
                    const favIds = res.data.favorites.map((f: any) => f.publicId);
                    setUserFavs(favIds);
                });
        }
    }, [id]);

    if (loading) return (
        <div className="h-screen bg-[#F9F6F2] flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] uppercase tracking-[0.4em] font-black opacity-20">Opening Showroom...</p>
        </div>
    );

    if (!profile) return <div className="h-screen flex items-center justify-center font-black uppercase tracking-widest italic opacity-20">Artisan Showroom Offline</div>;


    const yearsExp = new Date().getFullYear() - profile.since;

    return (

        <div className="min-h-screen bg-[#F9F6F2] font-['Cormorant_Garamond'] text-[#2C2C2C] selection:bg-[#D4AF37]/20 relative">
            <div className="fixed inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

            {/* --- NAVIGATION --- */}
            <nav className="p-8 md:px-16 flex justify-between items-center border-b border-[#E5E1DA] bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-8">
                    {/* NEW BACK BUTTON */}
                    <button
                        onClick={goBack} // Takes them exactly where they came from
                        className="group flex items-center gap-2 text-[9px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all"
                    >
                        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back
                    </button>

                    <button
                        onClick={() => navigate('/customer-dashboard')}
                        className="hidden sm:flex items-center gap-3 border-l border-[#E5E1DA] pl-8 group cursor-pointer"
                    >
                        <div className="w-8 h-8 bg-[#2C2C2C] group-hover:bg-[#D4AF37] rounded-full flex items-center justify-center text-white transition-colors">
                            <Scissors size={14} />
                        </div>
                        <span className="text-[10px] font-black tracking-[0.5em] uppercase group-hover:opacity-100 opacity-60 transition-opacity">
                            Showroom
                        </span>
                    </button>
                </div>


                <div className="flex items-center gap-6">
                    {profile.isavail ? (
                        <a
                            href={localStorage.getItem("userEmail") ? `tel:${profile.contactNo}` : "#"}
                            onClick={handleDirectCall}
                            className="..."
                        >
                            Direct Contact
                        </a>
                    ) : (
                        <span className="hidden md:block text-[9px] font-black uppercase tracking-widest opacity-20 cursor-not-allowed">
                            Contact Paused
                        </span>
                    )}

                    <button
                        onClick={profile.isavail ? scrollToLedger : undefined}
                        className={`px-8 py-3 text-[9px] font-black uppercase tracking-[0.3em] transition-all shadow-xl ${profile.isavail
                            ? 'bg-[#2C2C2C] text-white hover:bg-[#D4AF37]'
                            : 'bg-[#F2EDE4] text-[#2C2C2C]/20 cursor-not-allowed'
                            }`}
                    >
                        {profile.isavail ? "Inquire Now" : "Fully Booked"}
                    </button>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 md:px-12 py-20 relative z-10">
                {/* --- PROFILE HERO --- */}
                <header className="mb-32 text-center space-y-10">
                    <div className="relative inline-block group">
                        <div className="absolute inset-0 bg-[#D4AF37] rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
                        <img src={profile.picurl} className="w-48 h-48 md:w-64 md:h-64 rounded-full object-cover border-2 border-[#D4AF37] p-2 relative z-10 shadow-2xl" alt="" />
                        <div className="absolute bottom-2 right-4 bg-white p-2 rounded-full shadow-lg border border-[#E5E1DA] z-20">
                            <CheckCircle size={22} className="text-emerald-500" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-center gap-3 opacity-30">
                            <div className="h-[1px] w-12 bg-[#2C2C2C]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.6em]">Master Artisan</span>
                            <div className="h-[1px] w-12 bg-[#2C2C2C]" />
                        </div>
                        <h1 className="text-8xl md:text-[10rem] font-['Playfair_Display'] italic leading-[0.75] tracking-tighter">
                            {profile.fullName}
                        </h1>
                        <div className="flex flex-wrap justify-center items-center gap-8 text-[10px] font-black uppercase tracking-[0.4em] pt-6">
                            <span className="flex items-center gap-2"><MapPin size={12} className="text-[#D4AF37]" /> {profile.city}</span>
                            <span className="flex items-center gap-2"><Zap size={12} className="text-[#D4AF37]" /> {yearsExp}y Legacy</span>
                            <span className="flex items-center gap-2"><Star size={12} className="text-[#D4AF37]" /> {profile.category} specialist</span>
                        </div>
                    </div>
                </header>

                {/* --- COLLECTION GRID --- */}
                <section className="mb-40">
                    <div className="flex items-end justify-between mb-16 border-b border-[#F2EDE4] pb-6 text-left">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#D4AF37] mb-2">Portfolio</p>
                            <h2 className="text-5xl font-['Playfair_Display'] italic">The Catalog</h2>
                        </div>
                        <p className="text-[10px] font-black uppercase opacity-20 hidden md:block">Scroll to explore work</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {profile.gallery?.length > 0 ? profile.gallery.map((item: any, i: number) => (
                            <div key={i} className="group text-left">
                                <div className="aspect-[3/4] overflow-hidden bg-white border border-[#E5E1DA] mb-6 relative shadow-sm">
                                    <img src={item.url} className="w-full h-full object-cover transition-all duration-1000 grayscale-[40%] group-hover:grayscale-0 group-hover:scale-105" alt="" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
                                        <button
                                            onClick={() => setSelectedImage(item)}
                                            className="bg-white text-[9px] font-black uppercase tracking-widest px-8 py-4 shadow-2xl">View Masterpiece</button>
                                    </div>
                                </div>
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2">
                                        <p className="text-xl font-['Playfair_Display'] italic">Design No. {i + 1}</p>
                                        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest">
                                            <span className="text-[#D4AF37]">₹ {item.price || "Contact for Price"}</span>
                                            <span className=" opacity-20">/</span>
                                            <span className="opacity-40">{item.estimatedDays || "?"} Days Delivery</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-20 border border-dashed border-[#E5E1DA] text-center opacity-20">
                                <p className="text-[10px] font-black uppercase tracking-[0.5em]">Atelier Collection coming soon</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* --- THE LEDGER (REVIEWS) --- */}
                <section id="ledger-section" className="bg-[#2C2C2C] text-white p-12 md:p-24 relative overflow-hidden text-left">
                    <Quote className="absolute -top-10 -right-10 text-white/5 rotate-12" size={300} />
                    <div className="relative z-10 max-w-4xl">
                        <div className="flex items-center gap-4 mb-20">
                            <div className="h-[1px] w-12 bg-[#D4AF37]" />
                            <h2 className="text-4xl font-['Playfair_Display'] italic text-[#D4AF37]">Client Testimonials</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                            {reviews.length > 0 ? reviews.sort((a, b) => b.rating - a.rating).slice(0, 4).map((rev: any) => (
                                <div key={rev._id} className="space-y-6">
                                    <div className="flex text-[#D4AF37] gap-1">
                                        {[...Array(5)].map((_, i) => <Star key={i} size={10} fill={i < rev.rating ? "currentColor" : "none"} />)}
                                    </div>
                                    <p className="text-3xl italic leading-tight font-light">"{rev.comment}"</p>
                                    <div className="pt-4 flex items-center gap-4">
                                        <div className="h-[1px] w-6 bg-[#D4AF37]/40" />
                                        <p className="text-[9px] uppercase font-black tracking-widest opacity-40">{rev.garmentType}</p>
                                    </div>
                                </div>
                            )) : <p className="opacity-40 italic">The ledger is currently private.</p>}
                        </div>
                    </div>
                </section>
            </main>


            {/* --- FLOATING CONTACT BAR --- */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60]">
                <div className="bg-white/90 backdrop-blur-xl border border-[#E5E1DA] rounded-full px-4 py-3 flex items-center gap-10 shadow-xl">

                    <div className="pl-6 pr-4 hidden md:block border-r border-[#F2EDE4]">
                        <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${profile.isavail ? 'bg-[#25D366] animate-pulse' : 'bg-red-500'}`} />
                            <p className="text-[8px] uppercase tracking-[0.4em] font-black opacity-30">
                                {profile.isavail ? 'Available Now' : 'Studio Capacity Reached'}
                            </p>
                        </div>
                        <p className="text-[10px] font-['Playfair_Display'] italic tracking-wide text-[#2C2C2C]">
                            {profile.isavail ? 'Estimated Response: 2hrs' : 'Currently not accepting new orders'}
                        </p>
                    </div>

                    {profile.isavail ? (
                        <button
                            onClick={handleHireEngagement}
                            className="group flex items-center gap-4 bg-[#2C2C2C] text-white px-10 py-4 rounded-full hover:bg-[#D4AF37] transition-all duration-500 shadow-xl"
                        >
                            <MessageSquare size={14} />
                            <span className="text-[9px] font-black uppercase tracking-[0.5em]">Initiate Collaboration</span>
                        </button>
                    ) : (
                        <div className="px-10 py-4 bg-[#F2EDE4] text-[#2C2C2C]/40 rounded-full cursor-not-allowed">
                            <span className="text-[9px] font-black uppercase tracking-[0.5em]">Atelier Fully Booked</span>
                        </div>
                    )}
                </div>
            </div>


            {/* --- MASTERPIECE LIGHTBOX --- */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[100] bg-[#2C2C2C]/95 backdrop-blur-xl flex items-center justify-center p-6 md:p-12 animate-in fade-in duration-300"
                    onClick={() => setSelectedImage(null)} // Click background to close
                >
                    <button className="absolute top-10 right-10 text-white/50 hover:text-[#D4AF37] transition-colors">
                        <Plus size={40} className="rotate-45" />
                    </button>

                    <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 bg-white overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="aspect-[3/4] md:aspect-auto h-full overflow-hidden">
                            <img src={selectedImage.url} className="w-full h-full object-cover" alt="Selected Masterpiece" />
                        </div>

                        <div className="p-12 flex flex-col justify-center space-y-8 text-left">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#D4AF37]">Product Details</p>
                                <h3 className="text-5xl font-['Playfair_Display'] italic">Signature Design</h3>
                            </div>
                            {/* NEW HEART TOGGLE */}
                            <div className="flex flex-col gap-3">
                                <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30">Status: {isStarred ? 'Secured' : 'Available'}</p>

                                <button
                                    onClick={() => handleToggleFavorite(selectedImage)}
                                    className="relative w-44 h-12 bg-[#F9F6F2] rounded-full border border-[#E5E1DA] overflow-hidden p-1 flex items-center shadow-inner"
                                >
                                    {/* Left Pocket - Visible only when Starred */}
                                    <div className={`absolute left-4 transition-all duration-500 ${isStarred ? 'opacity-40 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                                        <span className="text-[7px] uppercase font-black tracking-[0.2em] text-[#D4AF37]">Masterpiece in Hub</span>
                                    </div>

                                    {/* Right Pocket - Visible only when Unstarred */}
                                    <div className={`absolute right-4 transition-all duration-500 ${!isStarred ? 'opacity-20 translate-x-0' : 'opacity-0 translate-x-4'}`}>
                                        <span className="text-[7px] uppercase font-black tracking-[0.2em]">Slide to Star</span>
                                    </div>

                                    {/* The Sliding Heart */}
                                    <motion.div
                                        initial={false}
                                        animate={{
                                            // Container is 176px (w-44), Heart is 40px (w-10)
                                            x: isStarred ? 126 : 0,
                                            backgroundColor: isStarred ? "#D4AF37" : "#2C2C2C",
                                            rotate: isStarred ? 360 : 0
                                        }}
                                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                        className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-xl z-10 cursor-pointer"
                                    >
                                        <Heart size={16} className={isStarred ? "fill-white" : ""} />
                                    </motion.div>
                                </button>
                            </div>


                            <p className="text-xl italic text-[#2C2C2C]/70 leading-relaxed">
                                This piece represents the pinnacle of {profile.fullName.split(' ')[0]}'s craftsmanship,
                                tailored specifically for their collection.
                            </p>

                            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-[#F2EDE4]">
                                <div>
                                    <p className="text-[9px] font-black uppercase opacity-30 mb-1">Estimate Price</p>
                                    <p className="text-2xl font-bold text-[#D4AF37]">₹ {selectedImage.price}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase opacity-30 mb-1">Creation Time</p>
                                    <p className="text-2xl font-bold">{selectedImage.estimatedDays} Days</p>
                                </div>
                            </div>


                            <button
                                onClick={profile.isavail ? handleRequestLook : undefined}
                                disabled={!profile.isavail}
                                className={`w-full py-5 text-[10px] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 ${profile.isavail
                                    ? 'bg-[#2C2C2C] text-white hover:bg-[#D4AF37]'
                                    : 'bg-[#F2EDE4] text-[#2C2C2C]/20 cursor-not-allowed'
                                    }`}
                            >
                                {profile.isavail ? <><MessageSquare size={14} /> Request This Look</> : "Consultations Paused"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
};

export default ArtisanPublicProfile;