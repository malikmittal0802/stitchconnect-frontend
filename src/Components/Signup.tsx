import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Scissors, Lock, Mail, Eye, EyeOff, ArrowRight, UserCircle, ShieldCheck, Key } from 'lucide-react';
import API from '../api';

const Initial_State = {
  fullName: '',
  email: '',
  password: '',
  userType: 'customer',
};

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(Initial_State);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpStep, setShowOtpStep] = useState(false); 
  const [otp, setOtp] = useState("");
  const [signupToken, setSignupToken] = useState(""); // State to store the stateless JWT
  const [errors, setErrors] = useState({ fullName: '', email: '', password: '' });

  const validateAll = (data: typeof formData) => {
    const newErrors = { fullName: '', email: '', password: '' };
    if (data.fullName.trim() === '') newErrors.fullName = 'Name is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(data.email)) newErrors.email = 'Invalid email format';
    if (data.password.length < 8) newErrors.password = 'Key must be 8+ characters';
    return newErrors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const signupHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateAll(formData);
    setErrors(newErrors);
    if (Object.values(newErrors).some(msg => msg !== '')) return;

    setIsLoading(true);
    try {
      const resp = await API.post("/user/signup-request", formData);
      if (resp.data.status) {
        setSignupToken(resp.data.signupToken); 
        toast.success("Verification token sent to email");
        setShowOtpStep(true);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.msg || "Registry failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return toast.error("Invalid Token Format");

    setIsLoading(true);
    try {
      const resp = await API.post("/user/verify-signup", { 
        otp, 
        signupToken 
      });
      if (resp.data.status) {
        toast.success("Identity Verified. Welcome to the Guild.");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Verification failed. Please check the token.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex bg-[#FDFCFB] font-['Cormorant_Garamond'] overflow-hidden">
      
      {/* --- LEFT SIDE: MOOD PANEL --- */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#111] items-end p-20 h-full">
        <div className="absolute inset-0">
          <img 
            src="https://images.pexels.com/photos/461035/pexels-photo-461035.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
            alt="Atelier" 
            className="w-full h-full object-cover opacity-40 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent" />
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4 text-[#D4AF37]">
            <div className="w-10 h-[1px] bg-[#D4AF37]" />
            <span className="text-[10px] uppercase tracking-[0.5em] font-black font-['Montserrat']">The Artisan Registry</span>
          </div>
          <h1 className="text-6xl text-white font-['Playfair_Display'] italic leading-tight">
            Craft Your <br /> Digital Legacy.
          </h1>
        </div>
      </div>

      {/* --- RIGHT SIDE: FORM PANEL --- */}
      <div className="w-full lg:w-1/2 flex flex-col h-full bg-white overflow-hidden text-left">
        
        <div className="p-8 md:p-12 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 bg-[#2C2C2C] rounded-full flex items-center justify-center text-white shadow-lg"><Scissors size={18} /></div>
          <div className="flex flex-col leading-none">
            <span className="text-[10px] font-black tracking-[0.4em] uppercase text-[#2C2C2C]">StitchConnect</span>
            <span className="text-[9px] font-black tracking-[0.4em] uppercase text-[#D4AF37] mt-1">Registry</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center px-8 md:px-24">
          <div className="max-w-md w-full mx-auto space-y-8">
            
            <header className="space-y-2">
              <h2 className="text-[11px] uppercase tracking-[0.6em] font-['Montserrat'] font-black text-[#D4AF37]">
                {showOtpStep ? "Security Verification" : "Identity Registry"}
              </h2>
              <h1 className="text-5xl font-['Playfair_Display'] italic text-[#2C2C2C]">
                {showOtpStep ? "Validate Token." : "Join the Guild."}
              </h1>
            </header>

            {!showOtpStep ? (
              <form onSubmit={signupHandler} className="space-y-6">
                <div className="flex gap-10 border-b border-[#E5E1DA] pb-2">
                  {['customer', 'tailor'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormData(p => ({...p, userType: role}))}
                      className={`text-[10px] uppercase tracking-[0.4em] font-['Montserrat'] font-black transition-all relative pb-2 ${
                        formData.userType === role ? 'text-[#2C2C2C]' : 'text-[#2C2C2C]/20'
                      }`}
                    >
                      {role === 'customer' ? 'The Client' : 'Master Tailor'}
                      {formData.userType === role && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#D4AF37]" />}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="group border-b border-[#2C2C2C]/10 focus-within:border-[#D4AF37] transition-all">
                    <label className="text-[9px] uppercase tracking-[0.3em] font-black opacity-30">Full Identity</label>
                    <div className="flex items-center gap-4 pb-2 mt-1">
                      <UserCircle size={18} className="text-[#D4AF37]/50" />
                      <input name="fullName" placeholder="Distinguished Name" onChange={handleInputChange} className="w-full bg-transparent outline-none italic text-xl" />
                    </div>
                    {errors.fullName && <p className="text-[10px] text-red-500 italic pb-1">{errors.fullName}</p>}
                  </div>

                  <div className="group border-b border-[#2C2C2C]/10 focus-within:border-[#D4AF37] transition-all">
                    <label className="text-[9px] uppercase tracking-[0.3em] font-black opacity-30">Registry Email</label>
                    <div className="flex items-center gap-4 pb-2 mt-1">
                      <Mail size={18} className="text-[#D4AF37]/50" />
                      <input name="email" type="email" placeholder="artisan@atelier.com" onChange={handleInputChange} className="w-full bg-transparent outline-none italic text-xl" />
                    </div>
                    {errors.email && <p className="text-[10px] text-red-500 italic pb-1">{errors.email}</p>}
                  </div>

                  <div className="group border-b border-[#2C2C2C]/10 focus-within:border-[#D4AF37] transition-all">
                    <label className="text-[9px] uppercase tracking-[0.3em] font-black opacity-30">Secret Key</label>
                    <div className="flex items-center gap-4 pb-2 mt-1">
                      <Lock size={18} className="text-[#D4AF37]/50" />
                      <input name="password" type={showPassword ? "text" : "password"} placeholder="Minimum 8 characters" onChange={handleInputChange} className="w-full bg-transparent outline-none text-xl tracking-tighter" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="opacity-20 hover:opacity-100">
                        {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                      </button>
                    </div>
                    {errors.password && <p className="text-[10px] text-red-500 italic pb-1">{errors.password}</p>}
                  </div>
                </div>

                <button type="submit" disabled={isLoading} className="w-full py-5 bg-[#2C2C2C] text-white text-[11px] tracking-[0.5em] font-black uppercase hover:bg-[#D4AF37] transition-all flex items-center justify-center gap-4">
                  {isLoading ? "Consulting..." : "Submit Registry"} <ArrowRight size={16} />
                </button>
              </form>
            ) : (
              <form onSubmit={verifyHandler} className="space-y-10 animate-in fade-in duration-700">
                <p className="text-lg italic opacity-60">A verification token has been issued to <span className="text-[#2C2C2C] font-black not-italic">{formData.email}</span>.</p>
                
                <div className="group border-b border-[#2C2C2C]/10 focus-within:border-[#D4AF37] transition-all">
                  <label className="text-[9px] uppercase tracking-[0.3em] font-black opacity-30">Identity Token</label>
                  <div className="flex items-center gap-4 pb-2 mt-1">
                    <Key size={18} className="text-[#D4AF37]" />
                    <input 
                      type="text" 
                      value={otp} 
                      onChange={(e) => setOtp(e.target.value)} 
                      placeholder="Enter 6-digit OTP" 
                      className="w-full bg-transparent outline-none italic text-2xl tracking-[0.2em]" 
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <button type="submit" disabled={isLoading} className="w-full py-5 bg-[#2C2C2C] text-white text-[11px] tracking-[0.5em] font-black uppercase hover:bg-[#D4AF37] transition-all shadow-xl">
                    {isLoading ? "Verifying..." : "Finalize Registration"}
                  </button>
                  <button type="button" onClick={() => setShowOtpStep(false)} className="w-full text-[10px] uppercase tracking-[0.2em] font-black opacity-30 hover:opacity-100 transition-all">
                    Back to Identity Details
                  </button>
                </div>
              </form>
            )}
            
            <p className="text-center text-sm italic opacity-40">
              Already registered? <Link to="/login" className="ml-2 text-[#2C2C2C] font-black not-italic hover:text-[#D4AF37]">Member Login</Link>
            </p>
          </div>
        </div>

        <div className="p-8 border-t border-[#F2EDE4] flex justify-center shrink-0">
          <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest opacity-30">
            <ShieldCheck size={14} /> Encrypted Registry Protocol
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;