import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Scissors, Star, Edit3, LogOut, Quote, Search, LayoutDashboard, Sparkles,
    Settings, Menu, X
} from 'lucide-react';
import API from '../api';
import toast from 'react-hot-toast';

const TailorDashboard = () => {
    const navigate = useNavigate();
    const email: any = localStorage.getItem("userEmail");
    const [activeTab, setActiveTab] = useState('Overview');
    const [profile, setProfile] = useState<any>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [stats, setStats] = useState({ avgRating: 0, reviewCount: 0 });
    const [marketRank, setMarketRank] = useState<string>("...");
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({ otp: '', newPass: '' });
    const [otpStep, setOtpStep] = useState(1);
    const [resetToken, setResetToken] = useState("");
    const [searchTerm, setSearchTerm] = useState('');
    
    // State for Mobile Sidebar toggle
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const triggerOTP = async () => {
        try {
            const res = await API.post("/tailor/send-otp", { email: profile.email });
            if (res.data.status) {
                setResetToken(res.data.resetToken);
                setOtpStep(2);
                toast.success("Security token issued to email");
            }
        } catch (err) { toast.error("Failed to send OTP"); }
    };

    const getTopNiche = () => {
        if (reviews.length === 0) return null;
        const counts: any = {};
        reviews.forEach(r => counts[r.garmentType] = (counts[r.garmentType] || 0) + 1);
        return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    };

    const handleFinalReset = async () => {
        try {
            const res = await API.post("/tailor/reset-password", {
                email: profile.email,
                otp: formData.otp,
                newPassword: formData.newPass,
                resetToken: resetToken
            });
            if (res.data.status) {
                toast.success("Security Credentials Updated");
                setOtpStep(1);
                setFormData({ otp: '', newPass: '' });
            }
        } catch (err) { toast.error("Invalid Code or Session Expired"); }
    };

    const removeGalleryImage = async (item: { url: string, publicId: string }) => {
        if (!window.confirm("Remove this masterpiece?")) return;
        const loadToast = toast.loading("Updating Lookbook...");
        try {
            const res = await API.post("/tailor/remove-gallery", {
                email: profile.email,
                imageUrl: item.url,
                publicId: item.publicId,
            });
            if (res.data.status) {
                setProfile(res.data.data);
                toast.success("Showroom updated", { id: loadToast });
            }
        } catch (err) { toast.error("Update failed", { id: loadToast }); }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, price: string, days: string) => {
        const file = e.target.files?.[0];
        if (!file || !price || !days) return toast.error("Please provide price and delivery time");
        const fd = new FormData();
        fd.append("imageFile", file);
        fd.append("email", email);
        fd.append("price", price);
        fd.append("estimatedDays", days);
        setUploading(true);
        const loadToast = toast.loading("Curating Masterpiece...");
        try {
            const response = await API.post("/tailor/add-gallery", fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data.status) {
                setProfile(response.data.data);
                toast.success("Lookbook Updated", { id: loadToast });
                (document.getElementById('p-price') as HTMLInputElement).value = "";
                (document.getElementById('p-days') as HTMLInputElement).value = "";
            }
        } catch (err) { toast.error("Curation failed", { id: loadToast }); }
        finally { setUploading(false); }
    };

    const toggleavail = async () => {
        try {
            const res = await API.post("/tailor/toggle-avail", {
                email: profile.email,
                isavail: !profile.isavail
            });
            if (res.data.status) setProfile(res.data.data);
        } catch (err) { console.error("Status toggle failed"); }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pRes, rRes] = await Promise.all([
                    API.get(`/tailor/getprofile/${email}`),
                    API.get(`/tailor/reviews/${email}`)
                ]);
                const profileData = pRes.data.data || pRes.data;
                setProfile(profileData);
                setReviews(rRes.data.data || []);
                setStats({ avgRating: parseFloat(rRes.data.averageRating) || 0, reviewCount: rRes.data.reviewCount || 0 });
                const allRes = await API.get(`/tailor/all`);
                if (allRes.data?.data) {
                    const sorted = allRes.data.data;
                    const index = sorted.findIndex((t: any) => t.email.toLowerCase() === email.toLowerCase());

                    setMarketRank(index !== -1 ? `#${index + 1}` : "N/A");
                }
            } catch (err) { console.error("Sync Error"); }
        };
        fetchData();
    }, [email]);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
        toast.success("Atelier Session Closed");
    };

    if (!profile) return (
        <div className="h-screen bg-[#FDFCFB] flex flex-col items-center justify-center gap-6">
            <div className="w-12 h-12 border border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
            <p className="text-[10px] uppercase tracking-[0.5em] font-black opacity-40">Synchronizing Atelier...</p>
        </div>
    );

    const filteredReviews = reviews.filter((rev: any) =>
        rev.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rev.garmentType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateValue: any) => {
        if (!dateValue) return "LEGACY ENTRY";
        const d = new Date(dateValue);
        return isNaN(d.getTime()) ? "DATE PENDING" : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const navItems = [
        { id: 'Overview', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { id: 'Portfolio', label: 'The Lookbook', icon: <Scissors size={18} /> },
        { id: 'Testimonials', label: 'The Ledger', icon: <Quote size={18} /> },
        { id: 'My Profile', label: 'Settings', icon: <Settings size={18} /> }
    ];

    return (
        <div className="h-screen w-full bg-[#FDFCFB] flex flex-col lg:flex-row font-['Cormorant_Garamond'] overflow-hidden text-left">

            {/* MOBILE TOP BAR */}
            <div className="lg:hidden bg-[#F2EDE4] border-b border-[#E5E1DA] px-6 py-4 flex items-center justify-between shrink-0 z-30">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-[#2C2C2C] rounded-full flex items-center justify-center text-white"><Scissors size={12} /></div>
                    <span className="text-[10px] font-black tracking-[0.3em] uppercase text-[#2C2C2C]">Master Studio</span>
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
                            <span className="text-[10px] font-black tracking-[0.4em] uppercase text-[#2C2C2C]">Master Studio</span>
                        </div>
                        {/* Mobile close button */}
                        <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden text-[#2C2C2C]/50 hover:text-[#2C2C2C]">
                            <X size={20} />
                        </button>
                    </div>

                    <nav className="space-y-10 font-['Montserrat'] font-black uppercase text-[10px] tracking-[0.3em]">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    setMobileMenuOpen(false); // Close menu on tab click
                                }}
                                className={`flex items-center gap-5 w-full transition-all duration-500 group ${activeTab === item.id ? 'text-[#2C2C2C]' : 'text-[#2C2C2C]/30 hover:text-[#2C2C2C]'}`}
                            >
                                <span className={`${activeTab === item.id ? 'text-[#D4AF37]' : ''}`}>{item.icon}</span>
                                <span>{item.label}</span>
                                {activeTab === item.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="space-y-6 pt-10 border-t border-[#2C2C2C]/5 font-['Montserrat'] font-black uppercase text-[9px] tracking-widest">
                    <button onClick={handleLogout} className="flex items-center gap-4 text-red-800/40 hover:text-red-800 transition-all w-full text-left">
                        <LogOut size={16} /> Exit Hub
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 overflow-y-auto bg-[#FDFCFB] p-6 md:p-12 lg:p-24 relative">
                <div className="absolute inset-0 opacity-[0.01] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

                {/* HEADER: Only visible when "Overview" is active */}
                {activeTab === 'Overview' && (
                    <header className="mb-16 md:mb-24 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[#E5E1DA] pb-12 relative z-10 gap-8 animate-in fade-in duration-700">
                        <div className="space-y-4 text-left">
                            <div className="flex items-center gap-3 text-[#D4AF37]">
                                <Sparkles size={16} />
                                <span className="text-[10px] uppercase tracking-[0.6em] font-black font-['Montserrat']">Atelier Command Center</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-['Playfair_Display'] italic tracking-tighter leading-none text-[#2C2C2C]">
                                Welcome, <span className="not-italic">{profile.fullName.split(' ')[0]}.</span>
                            </h1>
                            {getTopNiche() && (
                                <p className="text-[11px] uppercase tracking-[0.4em] font-black font-['Montserrat'] opacity-30 italic">
                                    Recognized Specialist in {getTopNiche()}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col items-start md:items-end gap-4">
                            <div className="w-20 h-20 rounded-full border border-[#D4AF37]/20 p-1 overflow-hidden shadow-xl">
                                <img src={profile.picurl} className="w-full h-full object-cover rounded-full" alt="Profile" />
                            </div>
                            <div className={`px-4 py-2 border rounded-full text-[9px] font-black tracking-widest uppercase flex items-center gap-2 ${profile.isavail ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${profile.isavail ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                {profile.isavail ? 'Open for Commissions' : 'Atelier Fully Booked'}
                            </div>
                        </div>
                    </header>
                )}

                <div className="relative z-10">
                    {/* TAB: OVERVIEW */}
                    {activeTab === 'Overview' && (
                        <div className="space-y-20 animate-in fade-in duration-700">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { label: 'Market Rank', val: marketRank, color: 'text-[#D4AF37]' },
                                    { label: 'Master Grade', val: stats.avgRating, color: 'text-[#2C2C2C]' },
                                    { label: 'Public Reviews', val: stats.reviewCount, color: 'text-[#2C2C2C]' }
                                ].map((stat) => (
                                    <div key={stat.label} className="p-10 bg-white border border-[#E5E1DA] space-y-3 hover:border-[#D4AF37] transition-all shadow-sm">
                                        <p className="text-[10px] uppercase tracking-[0.4em] font-black opacity-30 font-['Montserrat']">{stat.label}</p>
                                        <p className={`text-6xl font-['Playfair_Display'] italic ${stat.color}`}>{stat.val}</p>
                                    </div>
                                ))}
                                <div className={`p-8 border flex flex-col justify-between ${profile.isavail ? 'bg-white border-[#E5E1DA]' : 'bg-[#F2EDE4] border-[#D4AF37]/30'}`}>
                                    <div className="space-y-3">
                                        <p className="text-[9px] uppercase tracking-[0.45em] font-black text-[#2C2C2C]/40 font-['Montserrat']">Studio Status</p>
                                        <p className="text-2xl font-['Playfair_Display'] italic leading-tight">{profile.isavail ? 'Accepting Orders' : 'Fully Booked'}</p>
                                    </div>
                                    <button onClick={toggleavail} className="mt-4 w-full py-2 text-[8px] uppercase tracking-[0.3em] font-black border border-[#2C2C2C] hover:bg-[#2C2C2C] hover:text-white transition-all">
                                        Toggle Availability
                                    </button>
                                </div>
                            </div>
                            <div className="p-8 border border-dashed border-[#E5E1DA] flex flex-col items-center justify-center text-center space-y-4">
                                <h3 className="text-3xl font-['Playfair_Display'] italic">Invite Potential Clients</h3>
                                <button onClick={() => { navigator.clipboard.writeText(`http://localhost:5173/artisan/${profile._id}`); toast.success("Registry link copied"); }}
                                    className="px-10 py-4 border border-[#2C2C2C] text-[9px] uppercase tracking-widest font-black hover:bg-[#2C2C2C] hover:text-white transition-all">
                                    Copy Showroom Link
                                </button>
                            </div>
                        </div>
                    )}

                    {/* TAB: PORTFOLIO */}
                    {activeTab === 'Portfolio' && (
                        <div className="space-y-16 animate-in fade-in duration-700">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-[#F2EDE4] pb-10">
                                <div className="text-left">
                                    <h3 className="text-4xl font-['Playfair_Display'] italic">The Digital Lookbook</h3>
                                    <p className="text-[10px] uppercase tracking-widest font-black opacity-30 font-['Montserrat']">Curate your master creations</p>
                                </div>
                                <div className="flex flex-wrap gap-4 p-4 bg-[#F2EDE4]/30 border border-[#E5E1DA] w-full md:w-auto">
                                    <input id="p-price" type="number" placeholder="Price (₹)" className="bg-transparent border-b border-[#2C2C2C]/20 text-[10px] p-2 outline-none w-24 font-bold" />
                                    <input id="p-days" type="number" placeholder="Days" className="bg-transparent border-b border-[#2C2C2C]/20 text-[10px] p-2 outline-none w-24 font-bold" />
                                    <label className="bg-[#2C2C2C] text-white px-6 py-3 text-[9px] uppercase tracking-widest font-black cursor-pointer hover:bg-[#D4AF37] transition-all">
                                        {uploading ? 'Curating...' : 'Add Piece'}
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                            const p = (document.getElementById('p-price') as HTMLInputElement).value;
                                            const d = (document.getElementById('p-days') as HTMLInputElement).value;
                                            handleFileUpload(e, p, d);
                                        }} />
                                    </label>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                {profile.gallery?.map((item: any, i: number) => (
                                    <div key={i} className="group bg-white border border-[#E5E1DA] p-6 space-y-6 hover:border-[#D4AF37] transition-all">
                                        <div className="aspect-[4/5] overflow-hidden relative">
                                            <img src={item.url} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" alt="Work" />
                                            <button onClick={() => removeGalleryImage(item)} className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-md text-white hover:bg-red-500 transition-all opacity-0 group-hover:opacity-100">
                                                <Scissors size={14} />
                                            </button>
                                        </div>
                                        <div className="flex justify-between items-center border-t border-[#F2EDE4] pt-4 text-left">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black font-['Montserrat']">₹ {item.price}</p>
                                                <p className="text-[8px] uppercase tracking-widest opacity-40 font-black">{item.estimatedDays} Days Delivery</p>
                                            </div>
                                            <span className="text-[8px] font-['Montserrat'] font-black uppercase opacity-20">Masterpiece {i + 1}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB: TESTIMONIALS */}
                    {activeTab === 'Testimonials' && (
                        <div className="space-y-12 animate-in fade-in duration-700">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-[#F2EDE4] pb-10">
                                <div className="text-left">
                                    <h3 className="text-4xl font-['Playfair_Display'] italic">The Client Ledger</h3>
                                    <p className="text-[10px] uppercase tracking-widest font-black opacity-30 font-['Montserrat']">Verified Studio Testimonials</p>
                                </div>
                                <div className="relative w-full md:w-auto">
                                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" />
                                    <input type="text" placeholder="SEARCH RECORDS..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-12 pr-6 py-3 border border-[#E5E1DA] text-[9px] font-black tracking-widest outline-none focus:border-[#D4AF37] w-full md:w-64" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {filteredReviews.map((rev: any) => (
                                    <div key={rev._id} className="p-8 md:p-12 bg-white border border-[#E5E1DA] space-y-6 relative hover:border-[#D4AF37] transition-all text-left">
                                        <Quote size={48} className="absolute top-8 right-8 opacity-[0.03]" />
                                        <div className="flex gap-1 text-[#D4AF37]">
                                            {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < rev.rating ? "currentColor" : "none"} />)}
                                        </div>
                                        <p className="text-xl md:text-2xl italic leading-relaxed text-[#2C2C2C]/80">"{rev.comment}"</p>
                                        <div className="flex justify-between items-center pt-6 border-t border-[#F2EDE4]">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">{rev.garmentType}</span>
                                            <span className="text-[8px] font-black uppercase opacity-20">{formatDate(rev.createdAt)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB: MY PROFILE */}
                    {activeTab === 'My Profile' && (
                        <div className="space-y-16 animate-in fade-in duration-700 text-left">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#E5E1DA] pb-8 gap-6">
                                <div className="space-y-2">
                                    <h3 className="text-4xl font-['Playfair_Display'] italic">Atelier Dossier</h3>
                                    <p className="text-[10px] uppercase tracking-widest font-black opacity-30 font-['Montserrat']">Verified Identity & Professional Records</p>
                                </div>
                                <button onClick={() => navigate('/tailor-profile')} className="flex items-center gap-3 px-8 py-3 border border-[#2C2C2C] text-[9px] uppercase tracking-[0.4em] font-black hover:bg-[#2C2C2C] hover:text-white transition-all group">
                                    <Edit3 size={14} className="text-[#D4AF37] group-hover:text-white" /> Modify Registry
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-12">
                                {[
                                    { label: 'Artisan Name', val: profile.fullName },
                                    { label: 'Registry Email', val: profile.email },
                                    { label: 'Primary Speciality', val: profile.speciality },
                                    { label: 'Locale', val: `${profile.city}, ${profile.state}` },
                                    { label: 'Contact No.', val: profile.contactNo },
                                    { label: 'Legacy Est.', val: `Since ${profile.since}` }
                                ].map((info) => (
                                    <div key={info.label} className="border-b border-[#F2EDE4] pb-4 space-y-2">
                                        <p className="text-[9px] uppercase tracking-[0.4em] font-black opacity-30 font-['Montserrat']">{info.label}</p>
                                        <p className="text-2xl md:text-3xl italic">{info.val}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-10 border-t border-[#E5E1DA] space-y-10">
                                <h3 className="text-3xl font-['Playfair_Display'] italic">Security Access</h3>
                                {otpStep === 1 ? (
                                    <button onClick={triggerOTP} className="px-12 py-5 bg-[#2C2C2C] text-white text-[10px] uppercase tracking-[0.5em] font-black hover:bg-[#D4AF37] transition-all">Reset Access Key</button>
                                ) : (
                                    <div className="max-w-md space-y-6">
                                        <input type="text" placeholder="OTP" value={formData.otp} onChange={(e) => setFormData({ ...formData, otp: e.target.value })} className="w-full border-b border-[#2C2C2C]/10 py-3 outline-none italic text-2xl" />
                                        <input type="password" placeholder="NEW KEY" value={formData.newPass} onChange={(e) => setFormData({ ...formData, newPass: e.target.value })} className="w-full border-b border-[#2C2C2C]/10 py-3 outline-none italic text-2xl" />
                                        <div className="flex gap-6">
                                            <button onClick={handleFinalReset} className="flex-1 py-5 bg-[#2C2C2C] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#D4AF37] transition-all">Verify & Update</button>
                                            <button onClick={() => setOtpStep(1)} className="px-10 py-5 border border-[#2C2C2C]/10 text-[9px] font-black uppercase">Cancel</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default TailorDashboard;