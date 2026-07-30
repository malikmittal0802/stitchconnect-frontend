import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Star, Heart, Settings, UserCircle, LogOut, Scissors,
    ExternalLink, Edit3, Sparkles, Mail, Menu, X
} from 'lucide-react';
import API from '../api';
import toast from 'react-hot-toast';
import ReviewSearch from "./TailorReviews";

const CustomerDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('My Artisans');
    const [favorites, setFavorites] = useState<any[]>([]);
    const [hiredHistory, setHiredHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [preFillPhone, setPreFillPhone] = useState("");
    const [fullProfile, setFullProfile] = useState<any>(null);
    const [showOtpField, setShowOtpField] = useState(false);
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [jwtToken, setJwtToken] = useState("");

    // Mobile Sidebar toggle state
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const user = {
        name: localStorage.getItem("userName") || "Guest User",
        email: localStorage.getItem("userEmail") || ""
    };

    const handleRequestOTP = async () => {
        const loading = toast.loading("Issuing Secure Token...");
        try {
            const res = await API.post("/customer/request-otp", { email: user.email });
            if (res.data.status) {
                setJwtToken(res.data.token);
                setShowOtpField(true);
                toast.success("OTP sent to registry email", { id: loading });
            }
        } catch (err) { toast.error("Token issuance failed", { id: loading }); }
    };

    const handleUpdatePassword = async () => {
        if (otp.length < 6) return toast.error("Enter valid OTP");
        const loading = toast.loading("Verifying Credentials...");
        try {
            const res = await API.post("/customer/verify-and-update-pass", {
                token: jwtToken,
                otpInput: otp,
                newPassword: newPassword,
                email: user.email
            });
            if (res.data.status) {
                toast.success("Security Updated", { id: loading });
                setShowOtpField(false);
                setOtp(""); setNewPassword("");
            }
        } catch (err) { toast.error("Verification Failure", { id: loading }); }
    };

    // --- DATA SYNC ---
    useEffect(() => {
        const email = localStorage.getItem("userEmail");
        if (!email) {
            navigate("/login");
            return;
        }
        const fetchDashboardData = async () => {
            try {
                const [statsRes, profileRes] = await Promise.all([
                    API.get(`/customer/dashboard-stats/${email}`),
                    API.get(`/customer/getprofile/${email}`)
                ]);

                if (statsRes.data.status) {
                    setFavorites(statsRes.data.favorites || []);
                    setHiredHistory(statsRes.data.history || []);
                }

                if (profileRes.data.status) {
                    setFullProfile(profileRes.data.data);
                }
            } catch (err) {
                console.error("Sync Error:", err);
            } flexy: {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
        window.addEventListener('focus', fetchDashboardData);
        return () => window.removeEventListener('focus', fetchDashboardData);
    }, [navigate]);

    useEffect(() => {
        if (activeTab === 'Settings' && user.email && !fullProfile) {
            API.get(`/customer/getprofile/${user.email}`)
                .then(res => {
                    if (res.data.status) setFullProfile(res.data.data);
                })
                .catch(err => console.error("Profile sync failed", err));
        }
    }, [activeTab, user.email, fullProfile]);

    const removeFavorite = async (fav: any) => {
        try {
            const res = await API.post("/customer/toggle-fav", {
                customerEmail: user.email,
                imageUrl: fav.imageUrl
            });
            if (res.data.status) {
                setFavorites(prev => prev.filter(item => item._id !== fav._id));
                toast.success("Removed from gallery");
            }
        } catch (err) { toast.error("Action failed"); }
    };

    const viewArtisanFromWork = async (fav: any) => {
        try {
            const res = await API.get(`/tailor/get-id-by-email/${fav.tailorEmail}`);
            if (res.data.status) {
                navigate(`/artisan/${res.data.tailorId}`, { state: { from: 'dashboard' } });
            } else { toast.error("Atelier inactive"); }
        } catch (err) { toast.error("Trace failed"); }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
        toast.success("Atelier Session Closed");
    };

    if (isLoading) return (
        <div className="h-screen bg-[#FDFCFB] flex flex-col items-center justify-center gap-6">
            <div className="w-12 h-12 border border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
            <p className="text-[10px] uppercase tracking-[0.5em] font-black opacity-40">Synchronizing Registry...</p>
        </div>
    );

    const navItems = [
        { id: 'My Artisans', label: 'My Artisans', icon: <Star size={18} /> },
        { id: 'Starred Work', label: 'Starred Work', icon: <Heart size={18} /> },
        { id: 'Leave Review', label: 'The Ledger', icon: <Edit3 size={18} /> },
        { id: 'Settings', label: 'Settings', icon: <Settings size={18} /> }
    ];

    return (
        <div className="h-screen w-full bg-[#FDFCFB] flex flex-col lg:flex-row font-['Cormorant_Garamond'] overflow-hidden text-left">

            {/* MOBILE TOP BAR */}
            <div className="lg:hidden bg-[#F2EDE4] border-b border-[#E5E1DA] px-6 py-4 flex items-center justify-between shrink-0 z-30">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-[#2C2C2C] rounded-full flex items-center justify-center text-white"><Scissors size={12} /></div>
                    <span className="text-[10px] font-black tracking-[0.3em] uppercase text-[#2C2C2C]">StitchConnect</span>
                </div>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-[#2C2C2C]">
                    {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* MOBILE BACKDROP OVERLAY */}
            {mobileMenuOpen && (
                <div 
                    onClick={() => setMobileMenuOpen(false)}
                    className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40" 
                />
            )}

            {/* SIDEBAR (Desktop Static & Mobile Slide-over) */}
            <aside className={`
                fixed lg:relative top-0 left-0 h-full w-80 bg-[#F2EDE4] border-r border-[#E5E1DA] 
                flex flex-col p-12 justify-between shrink-0 z-50 transition-transform duration-300
                ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="space-y-16">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#2C2C2C] rounded-full flex items-center justify-center text-white shadow-lg"><Scissors size={14} /></div>
                            <span className="text-[10px] font-black tracking-[0.4em] uppercase text-[#2C2C2C]">StitchConnect</span>
                        </div>
                        {/* Mobile close button */}
                        <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden text-[#2C2C2C]/50 hover:text-[#2C2C2C]">
                            <X size={20} />
                        </button>
                    </div>

                    <nav className="space-y-10 font-['Montserrat'] font-black uppercase text-[10px] tracking-[0.3em]">
                        <button onClick={() => { navigate('/marketplace'); setMobileMenuOpen(false); }} className="flex items-center gap-5 w-full text-[#2C2C2C]/30 hover:text-[#2C2C2C] transition-all">
                            <Search size={18} /> Search Tailors
                        </button>
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    setMobileMenuOpen(false);
                                }}
                                className={`flex items-center gap-5 w-full transition-all duration-500 group ${activeTab === item.id ? 'text-[#2C2C2C]' : 'text-[#2C2C2C]/30 hover:text-[#2C2C2C]'
                                    }`}
                            >
                                <span className={`${activeTab === item.id ? 'text-[#D4AF37]' : ''}`}>{item.icon}</span>
                                <span>{item.label}</span>
                                {activeTab === item.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="space-y-6 pt-10 border-t border-[#2C2C2C]/5 font-['Montserrat'] font-black uppercase text-[9px] tracking-widest">
                    <a
                        href="mailto:stitchConnect.team@gmail.com?subject=Inquiry%20regarding%20StitchConnect%20Concierge"
                        className="flex items-center gap-4 opacity-40 hover:opacity-100 hover:text-[#D4AF37] transition-all w-full text-left"
                    >
                        <Mail size={16} /> Support
                    </a>
                    <button onClick={handleLogout} className="flex items-center gap-4 text-red-800/40 hover:text-red-800 transition-all w-full text-left">
                        <LogOut size={16} /> Exit Hub
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 overflow-y-auto bg-[#FDFCFB] p-6 md:p-12 lg:p-24 relative">

                {activeTab === 'My Artisans' && (
                    <header className="mb-16 md:mb-24 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#E5E1DA] pb-12 relative z-10 gap-8">
                        <div className="space-y-4 text-left">
                            <div className="flex items-center gap-3 text-[#D4AF37]">
                                <Sparkles size={16} />
                                <span className="text-[10px] uppercase tracking-[0.6em] font-black font-['Montserrat']">Member Dossier</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-['Playfair_Display'] italic tracking-tighter leading-none text-[#2C2C2C]">
                                Welcome, <span className="not-italic">{user.name.split(' ')[0]}.</span>
                            </h1>
                        </div>

                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border border-[#D4AF37]/20 p-1.5 overflow-hidden bg-white shadow-2xl shrink-0">
                            {fullProfile?.picurl ? (
                                <img
                                    src={fullProfile.picurl}
                                    className="w-full h-full object-cover rounded-full"
                                    alt="Registry Portrait"
                                />
                            ) : (
                                <div className="w-full h-full rounded-full bg-[#F2EDE4] flex items-center justify-center text-[#2C2C2C]/20">
                                    <UserCircle size={48} strokeWidth={1} />
                                </div>
                            )}
                        </div>
                    </header>
                )}

                <div className="relative z-10">
                    {activeTab === 'My Artisans' && (
                        <div className="space-y-12 animate-in fade-in duration-700">
                            <div className="flex items-center justify-between border-b border-[#F2EDE4] pb-6">
                                <h3 className="text-3xl font-['Playfair_Display'] italic text-[#2C2C2C]">Your Hired Artisans</h3>
                                <p className="text-[10px] uppercase font-black opacity-30 tracking-[0.3em] font-['Montserrat']">{hiredHistory.length} Engagements</p>
                            </div>
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                                {hiredHistory.length > 0 ? hiredHistory.map((artisan: any) => (
                                    <div key={artisan._id} className="bg-white border border-[#E5E1DA] p-8 md:p-10 flex flex-col md:flex-row gap-8 items-center group hover:border-[#D4AF37] transition-all duration-500">
                                        <div className="w-24 h-24 bg-[#F2EDE4] rounded-full flex items-center justify-center text-[#2C2C2C] group-hover:bg-[#D4AF37] group-hover:text-white transition-all duration-500 shrink-0">
                                            <Scissors size={28} strokeWidth={1} />
                                        </div>
                                        <div className="flex-1 space-y-4 text-center md:text-left">
                                            <div>
                                                <h3 className="text-3xl md:text-4xl font-['Playfair_Display'] italic leading-none">{artisan.tailorName}</h3>
                                                <p className="text-[9px] uppercase tracking-[0.3em] font-black opacity-40 mt-2 font-['Montserrat']">{artisan.category || "Master Tailor"} • {artisan.city}</p>
                                            </div>
                                            <div className="flex justify-center md:justify-start gap-6 font-['Montserrat'] font-black uppercase text-[9px] tracking-widest">
                                                <button onClick={() => navigate(`/artisan/${artisan.tailorId}`)} className="border-b border-[#2C2C2C]/10 pb-1 hover:border-[#D4AF37] transition-all">View Dossier</button>
                                                <button onClick={() => { setPreFillPhone(artisan.contactNo); setActiveTab('Leave Review'); }} className="text-[#D4AF37] border-b border-transparent hover:border-[#D4AF37] transition-all">Write Review</button>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-32 border border-dashed border-[#E5E1DA] text-center opacity-20 italic text-2xl font-['Playfair_Display']">No engagements recorded.</div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'Starred Work' && (
                        <div className="space-y-12 animate-in fade-in duration-700">
                            <div className="flex items-center justify-between border-b border-[#F2EDE4] pb-6">
                                <h3 className="text-3xl font-['Playfair_Display'] italic text-[#2C2C2C]">Starred Masterpieces</h3>
                                <p className="text-[10px] uppercase font-black opacity-30 tracking-[0.3em] font-['Montserrat']">{favorites.length} Saved</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                                {favorites.length > 0 ? favorites.map((fav: any) => (
                                    <div key={fav._id} className="group relative aspect-[4/5] bg-[#F2EDE4] overflow-hidden border border-[#E5E1DA] cursor-pointer" onClick={() => viewArtisanFromWork(fav)}>
                                        <img src={fav.imageUrl} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110 grayscale-[30%] group-hover:grayscale-0" alt="" />
                                        <div className="absolute inset-0 bg-[#2C2C2C]/80 opacity-0 group-hover:opacity-100 transition-all duration-500 p-8 md:p-10 flex flex-col justify-between text-white">
                                            <div className="flex justify-between items-start">
                                                <span className="text-[8px] font-black uppercase tracking-[0.5em] text-white/40 border border-white/20 px-3 py-1 font-['Montserrat']">Atelier Work</span>
                                                <button onClick={(e) => { e.stopPropagation(); removeFavorite(fav); }} className="hover:text-red-400 transition-colors">
                                                    <Heart size={20} fill="currentColor" />
                                                </button>
                                            </div>
                                            <div className="space-y-4">
                                                <h4 className="text-3xl font-['Playfair_Display'] italic leading-tight">{fav.tailorName}</h4>
                                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                                    <p className="text-[10px] font-['Montserrat'] font-black uppercase tracking-widest opacity-60">View Artisan</p>
                                                    <ExternalLink size={14} className="text-[#D4AF37]" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-32 border border-dashed border-[#E5E1DA] text-center opacity-20 italic text-2xl font-['Playfair_Display']">Your gallery is currently empty.</div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'Settings' && (
                        <div className="max-w-5xl space-y-24 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left">
                            <section className="space-y-16">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#E5E1DA] pb-8 gap-6">
                                    <div className="space-y-2">
                                        <h3 className="text-4xl font-['Playfair_Display'] italic text-[#2C2C2C]">Account Dossier</h3>
                                        <p className="text-[10px] uppercase tracking-widest font-black opacity-30 font-['Montserrat']">Verified Identity & Personal Records</p>
                                    </div>
                                    <button onClick={() => navigate("/customer-profile")} className="flex items-center gap-3 px-8 py-3 border border-[#2C2C2C] text-[9px] uppercase tracking-[0.4em] font-black hover:bg-[#2C2C2C] hover:text-white transition-all group">
                                        <Edit3 size={14} className="text-[#D4AF37] group-hover:text-white" /> Recalibrate Profile
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-12">
                                    {[
                                        { label: "Full Identity", value: fullProfile?.fullName || user.name },
                                        { label: "Registry Email", value: user.email },
                                        { label: "Gender Orientation", value: fullProfile?.gender || "Not Specified" },
                                        { label: "Primary Locale", value: fullProfile ? `${fullProfile.city}, ${fullProfile.state}` : "Syncing..." },
                                    ].map((item, idx) => (
                                        <div key={idx} className="border-b border-[#F2EDE4] pb-4 space-y-2">
                                            <p className="text-[9px] uppercase tracking-[0.4em] font-black opacity-30 font-['Montserrat']">{item.label}</p>
                                            <p className="text-2xl md:text-3xl italic text-[#2C2C2C] leading-none">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* SECURITY SECTION */}
                            <section className="pt-10 border-t border-[#E5E1DA] space-y-12">
                                <h3 className="text-3xl font-['Playfair_Display'] italic text-[#2C2C2C]">Security Access</h3>

                                {!showOtpField ? (
                                    <div className="space-y-6">
                                        <p className="text-[10px] font-['Montserrat'] font-black uppercase tracking-widest opacity-30">Identity Verification Required</p>
                                        <button onClick={handleRequestOTP} className="px-12 py-5 bg-[#2C2C2C] text-white text-[10px] uppercase tracking-[0.5em] font-black hover:bg-[#D4AF37] transition-all shadow-xl">
                                            Reset Access Key
                                        </button>
                                    </div>
                                ) : (
                                    <div className="max-w-md space-y-10 animate-in slide-in-from-top-2 duration-500">
                                        <div className="space-y-8">
                                            <div className="border-b border-[#2C2C2C]/10 focus-within:border-[#D4AF37] pb-2">
                                                <label className="text-[9px] font-['Montserrat'] font-black uppercase tracking-[0.3em] opacity-30">One-Time Password</label>
                                                <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="000000" className="w-full bg-transparent py-3 outline-none italic text-2xl" />
                                            </div>
                                            <div className="border-b border-[#2C2C2C]/10 focus-within:border-[#D4AF37] pb-2">
                                                <label className="text-[9px] font-['Montserrat'] font-black uppercase tracking-[0.3em] opacity-30">New Access Key</label>
                                                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full bg-transparent py-3 outline-none text-2xl" />
                                            </div>
                                        </div>
                                        <div className="flex gap-6">
                                            <button onClick={handleUpdatePassword} className="flex-1 py-5 bg-[#2C2C2C] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#D4AF37] transition-all shadow-xl">Update Credentials</button>
                                            <button onClick={() => setShowOtpField(false)} className="px-10 py-5 border border-[#2C2C2C]/10 text-[9px] font-black uppercase opacity-40 hover:opacity-100 transition-all">Abort</button>
                                        </div>
                                    </div>
                                )}
                            </section>
                        </div>
                    )}

                    {activeTab === 'Leave Review' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="mb-12 space-y-4">
                                <h3 className="text-4xl md:text-5xl font-['Playfair_Display'] italic text-[#2C2C2C]">The Community Ledger</h3>
                                <p className="text-[10px] font-['Montserrat'] font-black uppercase opacity-30 tracking-[0.3em]">Record and verify your bespoke experience</p>
                            </div>
                            <div className="bg-white border border-[#E5E1DA] p-6 md:p-10 shadow-sm">
                                <ReviewSearch key={preFillPhone} autoPhone={preFillPhone} />
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default CustomerDashboard;