import React, { useState, useRef, useEffect } from 'react';
import { UserCircle, Scissors, Briefcase, Camera, Mail, ShieldCheck, MapPin, Fingerprint, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Tesseract from 'tesseract.js';
import API from '../api';
import { useNavigate } from 'react-router-dom';

const indianStates = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand",
  "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
  "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
].sort();

const genderOptions = ["Male", "Female", "Other"];
const expertiseCategories = ["Men", "Women", "Children", "All"];

const TailorProfile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(1);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredDoc, setRegisteredDoc] = useState<any>(null);
  const [selectedfile, setselectedfile] = useState<File | null>(null);

  const profileInputRef = useRef<HTMLInputElement>(null);
  const aadhaarInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    email: localStorage.getItem("userEmail") || '',
    fullName: localStorage.getItem("userName") || '',
    dob: '',
    gender: '',
    aadhaarNo: '',
    aadhaarPic: '',
    profilePic: '',
    category: '',
    speciality: '',
    socialLink: '',
    since: '',
    workType: 'Home',
    shopAddress: '',
    shopCity: '',
    otherInfo: '',
    contactNo: '',
    state: '',
    city: '',
    fullAddress: ''
  });

  // Restored Auto-fetch Effect
  useEffect(() => {
    const fetchTailorData = async () => {
      if (formData.email && formData.email.includes('@')) {
        try {
          const response = await API.get(`/tailor/getprofile/${formData.email}`);
          if (response.data.status && response.data.data) {
            const doc = response.data.data;
            setRegisteredDoc(doc);
            setIsRegistered(true);
            setIsFirstTime(false);
            setFormData({
              ...formData,
              fullName: doc.fullName || formData.fullName,
              dob: doc.dob ? new Date(doc.dob).toISOString().split('T')[0] : '',
              gender: doc.gender || '',
              aadhaarNo: doc.aadhaarNo || '',
              profilePic: doc.picurl || '',
              category: doc.category || '',
              speciality: doc.speciality || '',
              socialLink: doc.socialLink || '',
              since: doc.since?.toString() || '',
              workType: doc.workType || 'Home',
              shopAddress: doc.shopAddress || '',
              shopCity: doc.shopCity || '',
              otherInfo: doc.otherInfo || '',
              contactNo: doc.contactNo || '',
              state: doc.state || '',
              city: doc.city || '',
              fullAddress: doc.fullAddress || ''
            });
            toast.success("Artisan Dossier Retrieved");
          }
        } catch (err) {
          console.log("No existing profile found. Proceeding as new registry.");
        }
      }
    };

    if (formData.email.length > 5) {
      const delayDebounceFn = setTimeout(() => { fetchTailorData(); }, 1000);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [formData.email]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    const limitedValue = rawValue.slice(0, 12);
    const formattedValue = limitedValue.match(/.{1,4}/g)?.join(" ") || "";
    setFormData(prev => ({ ...prev, aadhaarNo: formattedValue }));
  };

  const performOCR = async (img: File) => {
    setIsScanning(true);
    const loadToast = toast.loading("Magnifying Artisan Identity...");
    try {
      const { data: { text } } = await Tesseract.recognize(img, 'eng');
      const lines = text.split('\n').map(line => line.replace(/[o0O.·•*°]/g, "").trim()).filter(line => line.length > 2);
      const dobMatch = text.match(/(\d{2}\/\d{2}\/\d{4})/);
      const genderMatch = text.match(/\/\s*(Male|Female)/i);
      const uidMatch = text.match(/(\d{4}\s\d{4}\s\d{4})/);
      const nameCandidate = lines.find(line => /^[A-Z][a-z]+\s[A-Z][a-z]+$/.test(line) && !/Government|India|Aadhaar|Identity|Male|Female/i.test(line));

      setFormData(prev => ({
        ...prev,
        fullName: nameCandidate || prev.fullName,
        dob: dobMatch ? dobMatch[0].split('/').reverse().join('-') : prev.dob,
        gender: genderMatch ? (genderMatch[1].toLowerCase().startsWith('m') ? 'Male' : 'Female') : prev.gender,
        aadhaarNo: uidMatch ? uidMatch[0] : prev.aadhaarNo
      }));
      toast.success("Identity dossiers synchronized", { id: loadToast });
    } catch (error) {
      toast.error("Scanning failed. Manual entry required.", { id: loadToast });
    } finally { setIsScanning(false); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'profilePic' | 'aadhaarPic') => {
    const file = e.target.files?.[0];
    if (file) {
      if (field === 'profilePic') setselectedfile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
        if (field === 'aadhaarPic') performOCR(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const requiredFields = ['email', 'fullName', 'dob', 'gender', 'aadhaarNo', 'profilePic', 'category', 'speciality', 'since', 'workType', 'contactNo', 'state', 'city', 'fullAddress'];

    if (formData.workType === 'Shop' || formData.workType === 'Both') {
      requiredFields.push('shopAddress', 'shopCity');
    }

    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        const fieldName = field.replace(/([A-Z])/g, ' $1').toLowerCase();
        toast.error(`The ${fieldName} is required for your registry dossier.`);
        return false;
      }
    }

    if (formData.aadhaarNo.replace(/\s/g, "").length !== 12) {
      toast.error("Aadhaar Number must be exactly 12 digits for verification.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const fd = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'profilePic' && key !== 'aadhaarPic') {
          fd.append(key, formData[key as keyof typeof formData]);
        }
      });
      if (selectedfile) fd.append("profilePic", selectedfile);

      const url = isFirstTime ? "/tailor/save" : "/tailor/update";
      const response = await API.post(url, fd);

      if (response.data.status) {
        toast.success(isFirstTime ? "Artisan Registry Established" : "Profile Updated");

        setRegisteredDoc(response.data.doc);
        setTimeout(() => {
          navigate("/tailor-dashboard");
        }, 1500);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.msg || "Server synchronization failed");
    } finally {
      setIsLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const currentYear = new Date().getFullYear();

  return (
    <div className="h-screen w-full bg-[#FDFCFB] flex font-['Cormorant_Garamond'] overflow-hidden text-left">

      {/* SIDEBAR */}
      <aside className="w-80 bg-[#F2EDE4] border-r border-[#E5E1DA] hidden lg:flex flex-col p-12 h-full justify-between shrink-0">
        <div className="space-y-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#2C2C2C] rounded-full flex items-center justify-center text-white shadow-lg"><Scissors size={14} /></div>
            <span className="text-[10px] font-black tracking-[0.4em] uppercase text-[#2C2C2C]">Atelier Registry</span>
          </div>

          <nav className="space-y-10 font-['Montserrat'] font-black uppercase text-[10px] tracking-[0.3em]">
            {[
              { id: 1, label: '01. Identity', icon: <UserCircle size={18} /> },
              { id: 2, label: '02. Professional', icon: <Briefcase size={18} /> },
              { id: 3, label: '03. Contact', icon: <MapPin size={18} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-5 w-full transition-all duration-500 ${activeTab === tab.id ? 'text-[#2C2C2C]' : 'text-[#2C2C2C]/30 hover:text-[#2C2C2C]'}`}
              >
                <span className={`${activeTab === tab.id ? 'text-[#D4AF37]' : ''}`}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="pt-10 border-t border-[#2C2C2C]/5">
          <p className="text-[9px] uppercase tracking-widest font-black opacity-30 leading-relaxed font-['Montserrat']">
            "Precision is the bedrock of heritage."
          </p>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto bg-[#FDFCFB] p-12 md:p-24 relative">
        <div className="absolute inset-0 opacity-[0.01] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

        <header className="mb-20 flex justify-between items-end border-b border-[#E5E1DA] pb-12 relative z-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-[#D4AF37]">
              <ShieldCheck size={16} />
              <span className="text-[10px] uppercase tracking-[0.6em] font-black font-['Montserrat']">Registry Ledger</span>
            </div>
            <h1 className="text-7xl font-['Playfair_Display'] italic tracking-tighter leading-none text-[#2C2C2C]">
              Bespoke <span className="not-italic">Dossier.</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 border-b border-[#E5E1DA] pb-2 focus-within:border-[#D4AF37] transition-all">
            <Mail size={16} className="text-[#D4AF37]" />
            <input name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" readOnly className="bg-transparent outline-none italic text-xl w-64 opacity-80 cursor-not-allowed" />
          </div>
        </header>

        <form onSubmit={handleSubmit} className="relative z-10 max-w-5xl">

          {/* TAB 1: IDENTITY */}
          {activeTab === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-20 animate-in fade-in duration-700">
              <div className="md:col-span-4 space-y-12">
                <div className="group relative w-48 h-48 mx-auto">
                  <div className="w-full h-full rounded-full border border-[#D4AF37]/20 p-1 overflow-hidden bg-white shadow-xl flex items-center justify-center">
                    {formData.profilePic ? <img src={formData.profilePic} className="w-full h-full object-cover rounded-full" /> : <UserCircle size={80} className="text-[#F2EDE4]" />}
                    <button type="button" onClick={() => profileInputRef.current?.click()} className="absolute inset-0 bg-[#2C2C2C]/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-full"><Camera size={24} className="text-white" /></button>
                  </div>
                  <input type="file" ref={profileInputRef} className="hidden" onChange={(e) => handleFileChange(e, 'profilePic')} />
                  <p className="text-center mt-6 text-[9px] uppercase tracking-widest font-black opacity-30 font-['Montserrat']">Portrait Profile</p>
                </div>

                <div className={`group relative h-32 border-2 border-dashed flex flex-col items-center justify-center transition-all ${isScanning ? 'border-[#D4AF37] animate-pulse' : 'border-[#F2EDE4] hover:border-[#D4AF37]'}`}>
                  {formData.aadhaarPic ? <img src={formData.aadhaarPic} className="w-full h-full object-cover opacity-20" /> : <Fingerprint size={32} className="opacity-10" />}
                  <button type="button" onClick={() => aadhaarInputRef.current?.click()} className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <Camera size={20} className="text-[#D4AF37]" />
                    <span className="text-[8px] uppercase tracking-widest font-black font-['Montserrat'] text-[#2C2C2C]">Aadhaar Scan</span>
                  </button>
                  <input type="file" ref={aadhaarInputRef} className="hidden" onChange={(e) => handleFileChange(e, 'aadhaarPic')} />
                </div>
              </div>

              <div className="md:col-span-8 space-y-12">
                <div className="grid grid-cols-1 gap-12">
                  <div className="border-b border-[#F2EDE4] focus-within:border-[#D4AF37] pb-4 transition-all space-y-2">
                    <label className="text-[9px] uppercase tracking-widest font-black opacity-30 font-['Montserrat']">Legal Full Name</label>
                    <input name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Name" className="w-full bg-transparent outline-none italic text-3xl" />
                  </div>
                  <div className="border-b border-[#F2EDE4] focus-within:border-[#D4AF37] pb-4 transition-all space-y-2">
                    <label className="text-[9px] uppercase tracking-widest font-black opacity-30 font-['Montserrat']">Aadhaar Identification</label>
                    <input name="aadhaarNo" value={formData.aadhaarNo} onChange={handleAadhaarChange} placeholder="XXXX XXXX XXXX" className="w-full bg-transparent outline-none italic text-3xl" />
                  </div>
                  <div className="grid grid-cols-2 gap-10">
                    <div className="border-b border-[#F2EDE4] pb-4 space-y-2">
                      <label className="text-[9px] uppercase tracking-widest font-black opacity-30 font-['Montserrat']">Birth Registry</label>
                      <input name="dob" type="date" value={formData.dob} onChange={handleInputChange} max={today} className="w-full bg-transparent outline-none italic text-xl" />
                    </div>
                    <div className="border-b border-[#F2EDE4] pb-4 space-y-2">
                      <label className="text-[9px] uppercase tracking-widest font-black opacity-30 font-['Montserrat']">Gender</label>
                      <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-transparent outline-none italic text-xl">
                        <option value="">Select</option>
                        {genderOptions.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROFESSIONAL */}
          {activeTab === 2 && (
            <div className="grid grid-cols-2 gap-x-20 gap-y-12 animate-in slide-in-from-bottom-4 duration-700">
              <div className="border-b border-[#F2EDE4] pb-4 space-y-2">
                <label className="text-[9px] uppercase tracking-widest font-black opacity-30 font-['Montserrat']">Clientele Category</label>
                <select name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-transparent outline-none italic text-2xl">
                  <option value="">Category</option>
                  {expertiseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="border-b border-[#F2EDE4] pb-4 space-y-2">
                <label className="text-[9px] uppercase tracking-widest font-black opacity-30 font-['Montserrat']">Master Speciality</label>
                <input name="speciality" value={formData.speciality} onChange={handleInputChange} placeholder="e.g. Traditional Sherwanis" className="w-full bg-transparent outline-none italic text-2xl" />
              </div>
              <div className="border-b border-[#F2EDE4] pb-4 space-y-2">
                <label className="text-[9px] uppercase tracking-widest font-black opacity-30 font-['Montserrat']">Legacy Since (Year)</label>
                <input name="since" type="number" value={formData.since}
                  onKeyDown={(e) => {
                    if (["e", "E", "+", "-", "."].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onInput={(e: React.FormEvent<HTMLInputElement>) => {
                    const target = e.target as HTMLInputElement;
                    if (target.value.length > 4) {
                      target.value = target.value.slice(0, 4);
                    }
                  }}
                  min={1900} max={currentYear} onChange={handleInputChange} placeholder="YYYY" className="w-full bg-transparent outline-none italic text-2xl" />
              </div>
              <div className="border-b border-[#F2EDE4] pb-4 space-y-2">
                <label className="text-[9px] uppercase tracking-widest font-black opacity-30 font-['Montserrat']">Work Environment</label>
                <div className="flex gap-8 pt-2">
                  {["Home", "Shop", "Both"].map(t => (
                    <label key={t} className="flex items-center gap-2 italic text-lg cursor-pointer group">
                      <input type="radio" name="workType" value={t} checked={formData.workType === t} onChange={handleInputChange} className="accent-[#D4AF37]" />
                      <span className={formData.workType === t ? "text-[#D4AF37]" : "opacity-60"}>{t}</span>
                    </label>
                  ))}
                </div>
              </div>

              {(formData.workType === 'Shop' || formData.workType === 'Both') && (
                <div className="col-span-full grid grid-cols-2 gap-10 p-10 bg-[#F2EDE4]/30 border border-[#F2EDE4] animate-in zoom-in-95 duration-500">
                  <div className="space-y-2">
                    <label className="text-[8px] uppercase tracking-widest font-black opacity-40 font-['Montserrat'] text-[#D4AF37]">Shop / Atelier Address</label>
                    <input name="shopAddress" value={formData.shopAddress} onChange={handleInputChange} placeholder="Street & Building No." className="w-full bg-transparent border-b border-[#2C2C2C]/10 outline-none italic text-xl focus:border-[#D4AF37]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] uppercase tracking-widest font-black opacity-40 font-['Montserrat'] text-[#D4AF37]">Atelier City</label>
                    <input name="shopCity" value={formData.shopCity} onChange={handleInputChange} placeholder="City Locale" className="w-full bg-transparent border-b border-[#2C2C2C]/10 outline-none italic text-xl focus:border-[#D4AF37]" />
                  </div>
                </div>
              )}

              <div className="col-span-full border-b border-[#F2EDE4] pb-4 space-y-2">
                <label className="text-[9px] uppercase tracking-widest font-black opacity-30 font-['Montserrat']">Atelier Narrative (Biography)</label>
                <textarea name="otherInfo" value={formData.otherInfo} onChange={handleInputChange} rows={2} placeholder="The story of your craft..." className="w-full bg-transparent outline-none italic text-xl resize-none" />
              </div>
            </div>
          )}

          {/* TAB 3: CONTACT */}
          {activeTab === 3 && (
            <div className="max-w-3xl space-y-16 animate-in slide-in-from-right-4 duration-700">
              <div className="grid grid-cols-2 gap-10">
                <div className="border-b border-[#F2EDE4] pb-4 space-y-2">
                  <label className="text-[9px] uppercase tracking-widest font-black opacity-30 font-['Montserrat']">Direct Line</label>
                  <input name="contactNo" value={formData.contactNo}
                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                      const target = e.target as HTMLInputElement;
                      if (target.value.length > 10) {
                        target.value = target.value.slice(0, 10);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (["e", "E", "+", "-", "."].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={handleInputChange} placeholder="+91 XXXX" className="w-full bg-transparent outline-none italic text-2xl" />
                </div>
                <div className="border-b border-[#F2EDE4] pb-4 space-y-2">
                  <label className="text-[9px] uppercase tracking-widest font-black opacity-30 font-['Montserrat']">State Jurisdiction</label>
                  <select name="state" value={formData.state} onChange={handleInputChange} className="w-full bg-transparent outline-none italic text-xl">
                    <option value="">Select State</option>
                    {indianStates.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="border-b border-[#F2EDE4] pb-4 space-y-2">
                <label className="text-[9px] uppercase tracking-widest font-black opacity-30 font-['Montserrat']">City Locale</label>
                <input name="city" value={formData.city} onChange={handleInputChange} placeholder="City Name" className="w-full bg-transparent outline-none italic text-2xl" />
              </div>
              <div className="border-b border-[#F2EDE4] pb-4 space-y-2">
                <label className="text-[9px] uppercase tracking-widest font-black opacity-30 font-['Montserrat']">Full Workshop Address</label>
                <textarea name="fullAddress" value={formData.fullAddress} onChange={handleInputChange} rows={2} placeholder="Building, Street, Landmark" className="w-full bg-transparent outline-none italic text-2xl resize-none" />
              </div>

              <button type="submit" disabled={isLoading} className="px-16 py-6 bg-[#2C2C2C] text-white text-[11px] font-black uppercase tracking-[0.5em] hover:bg-[#D4AF37] transition-all shadow-2xl flex items-center gap-4">
                {isLoading ? "Synchronizing..." : (isFirstTime ? "Establish Registry" : "Update Dossier")}
                <ArrowRight size={16} />
              </button>
            </div>
          )}

        </form>
      </main>
    </div>
  );
};

export default TailorProfile;