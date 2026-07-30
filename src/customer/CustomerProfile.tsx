import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserCircle, Camera, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../api';

const indianStates = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand",
  "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
  "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
].sort();

const genders = ["Male", "Female", "Other", "Prefer not to say"];

const CustomerProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isOnboarding = location.state?.onboarding || false;

  const [isFirstTime, setIsFirstTime] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    state: '',
    city: '',
    gender: '',
    profilePic: ''
  });

  useEffect(() => {
    const savedEmail = localStorage.getItem("userEmail");
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      checkExistingProfile(savedEmail);
    }
  }, []);

  const checkExistingProfile = async (email: string) => {
    if (!email || !email.includes('@')) return;
    try {
      const resp = await API.get(`/customer/getprofile/${email}`);
      if (resp.data.status && resp.data.data) {
        const profile = resp.data.data;
        setFormData({
          fullName: profile.fullName || '',
          email: profile.email || email,
          address: profile.address || '',
          state: profile.state || '',
          city: profile.city || '',
          gender: profile.gender || '',
          profilePic: profile.picurl || ''
        });
        setIsFirstTime(false);
      }
    } catch (error) {
      setIsFirstTime(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Portrait must be under 2MB");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profilePic: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.email.trim() === "") return toast.error("Please enter an email address.");
    if (formData.fullName.trim() === "") return toast.error("Please enter the name.");
    if (!formData.gender) return toast.error("Please select a gender");
    if (!formData.state) return toast.error("Please select a State");
    if (formData.city.trim() === "") return toast.error("Please enter the city");
    if (formData.address.trim() === "") return toast.error("Please enter the address");

    setIsLoading(true);
    let fd = new FormData();
    fd.append("email", formData.email);
    fd.append("fullName", formData.fullName);
    fd.append("address", formData.address);
    fd.append("state", formData.state);
    fd.append("city", formData.city);
    fd.append("gender", formData.gender);
    if (selectedFile) fd.append("profilePic", selectedFile);

    try {
      const url = isFirstTime
        ? "/customer/saveprofile"
        : "/customer/updateprofile";

      const resp = await API.post(url, fd, { headers: { 'content-type': "multipart/form-data" } });

      if (resp.data.status) {
        localStorage.setItem("userName", formData.fullName);
        toast.success(isFirstTime ? "Identity Authenticated" : "Registry Updated");
        setTimeout(() => {
          navigate("/customer-dashboard");
        }, 1500);
      }
    } catch (err) {
        console.error(err);
        toast.error("Registry Sync Failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col md:flex-row font-['Cormorant_Garamond']">

      {/* --- LEFT SIDE: THE EDITORIAL SIDEBAR --- */}
      <div className="w-full md:w-1/3 bg-[#F2EDE4] p-12 md:p-20 border-r border-[#E5E1DA] h-screen sticky top-0 flex flex-col justify-between">
        
        {/* Render Back Button ONLY if NOT onboarding */}
        <div className="h-10">
            {!isOnboarding && (
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center gap-2 text-[9px] uppercase tracking-[0.4em] font-black opacity-30 hover:opacity-100 hover:text-[#D4AF37] transition-all"
                >
                    <ChevronLeft size={14} /> Back to Hub
                </button>
            )}
        </div>

        <div className="space-y-12">
          <div className="space-y-4 text-left">
            <h2 className="text-[10px] tracking-[0.5em] uppercase font-['Montserrat'] font-black text-[#D4AF37]">The Registry</h2>
            <h1 className="text-5xl font-['Playfair_Display'] italic text-[#2C2C2C] leading-none">Profile <br /> Calibration.</h1>
            <div className="w-12 h-[1px] bg-[#D4AF37]" />
          </div>

          <div className="relative group w-48 h-48 mx-auto md:mx-0">
            <div className="w-full h-full rounded-full border border-[#D4AF37]/20 overflow-hidden bg-white shadow-2xl flex items-center justify-center relative p-1">
              <div className="w-full h-full rounded-full overflow-hidden">
                {formData.profilePic ? (
                  <img src={formData.profilePic} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full bg-[#F9F6F2] flex items-center justify-center text-[#D4AF37]/20">
                    <UserCircle size={80} strokeWidth={0.5} />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-[#2C2C2C]/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center text-white gap-2 rounded-full"
              >
                <Camera size={24} />
                <span className="text-[8px] uppercase tracking-widest font-black">Change Portrait</span>
              </button>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
          </div>
        </div>

        <div className="text-left">
          <p className="text-sm italic text-[#2C2C2C]/40 leading-relaxed max-w-[200px]">
            "Every stitch in your digital profile defines your legacy within the Atelier."
          </p>
        </div>
      </div>

      {/* --- RIGHT SIDE: THE FORM CANVAS --- */}
      <div className="flex-1 p-12 md:p-24 bg-[#FDFCFB] overflow-y-auto">
        <form onSubmit={handleSubmit} className="max-w-3xl space-y-20 mx-auto text-left">

          <section className="space-y-12">
            <h3 className="text-[11px] uppercase tracking-[0.5em] font-['Montserrat'] font-black text-[#D4AF37]/60">Personal Credentials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div className="space-y-3 col-span-full border-b border-[#2C2C2C]/10 focus-within:border-[#D4AF37] transition-all">
                <label className="text-[9px] uppercase tracking-[0.3em] font-black opacity-30">Registered Email Address</label>
                <input
                  name="email" type="email" value={formData.email} readOnly onChange={handleInputChange} onBlur={() => checkExistingProfile(formData.email)}
                  className="w-full bg-transparent py-4 outline-none italic text-2xl" placeholder="email@atelier.com"
                />
              </div>
              <div className="space-y-3 border-b border-[#2C2C2C]/10 focus-within:border-[#D4AF37] transition-all">
                <label className="text-[9px] uppercase tracking-[0.3em] font-black opacity-30">Full Legal Name</label>
                <input
                  name="fullName" value={formData.fullName} onChange={handleInputChange}
                  className="w-full bg-transparent py-4 outline-none italic text-2xl" placeholder="Full Name"
                />
              </div>
              <div className="space-y-3 border-b border-[#2C2C2C]/10 focus-within:border-[#D4AF37] transition-all">
                <label className="text-[9px] uppercase tracking-[0.3em] font-black opacity-30">Gender Orientation</label>
                <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-transparent py-4 outline-none italic text-2xl appearance-none cursor-pointer">
                  <option value="" disabled>Select...</option>
                  {genders.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
          </section>

          <section className="space-y-12">
            <h3 className="text-[11px] uppercase tracking-[0.5em] font-['Montserrat'] font-black text-[#D4AF37]/60">Physical Presence</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div className="space-y-3 border-b border-[#2C2C2C]/10 focus-within:border-[#D4AF37] transition-all">
                <label className="text-[9px] uppercase tracking-[0.3em] font-black opacity-30">State / Region</label>
                <select name="state" value={formData.state} onChange={handleInputChange} className="w-full bg-transparent py-4 outline-none italic text-2xl appearance-none cursor-pointer">
                  <option value="" disabled>Select State</option>
                  {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-3 border-b border-[#2C2C2C]/10 focus-within:border-[#D4AF37] transition-all">
                <label className="text-[9px] uppercase tracking-[0.3em] font-black opacity-30">City of Residence</label>
                <input
                  name="city" value={formData.city} onChange={handleInputChange} disabled={!formData.state}
                  className="w-full bg-transparent py-4 outline-none italic text-2xl disabled:opacity-20" placeholder="City"
                />
              </div>
              <div className="space-y-3 col-span-full">
                <label className="text-[9px] uppercase tracking-[0.3em] font-black opacity-30">Complete Mailing Address</label>
                <textarea
                  name="address" rows={2} value={formData.address} onChange={handleInputChange}
                  className="w-full bg-[#F9F6F2] p-8 outline-none italic text-xl focus:ring-1 focus:ring-[#D4AF37]/20 border border-transparent focus:border-[#D4AF37]/30 transition-all resize-none"
                  placeholder="Street, Landmark, Apartment..."
                />
              </div>
            </div>
          </section>

          <div className="pt-10 flex flex-col items-center md:items-start gap-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto px-20 py-6 bg-[#2C2C2C] text-white text-[11px] tracking-[0.6em] font-black uppercase hover:bg-[#D4AF37] transition-all duration-500 shadow-2xl flex items-center justify-center gap-4 group"
            >
              {isLoading ? "Synchronizing..." : (isFirstTime ? "Open Showroom" : "Save Changes")}
              <div className="w-2 h-2 rounded-full bg-[#D4AF37] group-hover:bg-white transition-colors" />
            </button>
            <p className="text-[9px] uppercase tracking-widest font-black opacity-20">Registry Secure & Encrypted</p>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CustomerProfile;