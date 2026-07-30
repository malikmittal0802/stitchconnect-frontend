import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Scissors, ArrowRight, ShieldCheck, Fingerprint, KeyRound, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import API from "../api";

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState(1); // 1: Email, 2: OTP & New Key
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryForm, setRecoveryForm] = useState({ otp: '', newPassword: '' });
  const [resetToken, setResetToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const resp = await API.post("/user/login", formData);
      if (resp.data.status) {
        localStorage.setItem("userEmail", formData.email);
        localStorage.setItem("userName", resp.data.fullName);
        localStorage.setItem("userType", resp.data.userType);
        toast.success(resp.data.msg);

        setTimeout(() => {
          const path = resp.data.isFirstLogin
            ? `/${resp.data.userType}-profile`
            : `/${resp.data.userType}-dashboard`;
          navigate(path, { state: { onboarding: resp.data.isFirstLogin } });
        }, 1500);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Authentication Failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleIssueRecovery = async () => {
    if (!recoveryEmail.includes('@'))
      return toast.error("Please provide a valid registry email");

    const loadToast = toast.loading("Verifying Identity...");
    try {
      const res = await API.post("/user/forgot-password", { email: recoveryEmail });
      if (res.data.status) {
        setResetToken(res.data.resetToken);
        setRecoveryStep(2);
        toast.success("Recovery token dispatched", { id: loadToast });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Recovery Failed", { id: loadToast });
    }
  };


  const handleFinalReset = async () => {
    if (recoveryForm.otp.length < 6)
      return toast.error("Enter 6-digit token");

    if (!recoveryForm.newPassword || recoveryForm.newPassword.trim().length < 8) {
      return toast.error("Please provide a secure new key");
    }

    const loadToast = toast.loading("Updating Credentials...");
    try {
      const res = await API.post("/user/reset-password", {
        otp: recoveryForm.otp,
        newPassword: recoveryForm.newPassword,
        resetToken: resetToken
      });
      if (res.data.status) {
        toast.success("Credentials updated. Please login.", { id: loadToast });
        setShowRecovery(false);
        setRecoveryStep(1);
        setRecoveryForm({ otp: '', newPassword: '' });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Reset Failed", { id: loadToast });
    }
  };

  return (
    <div className="h-screen w-full bg-[#FDFCFB] flex font-['Cormorant_Garamond'] overflow-hidden">
      {/* LEFT SIDE: MOOD CANVAS */}
      <div className="hidden lg:block lg:w-1/2 relative h-full bg-[#2C2C2C]">
        <img
          src="https://images.unsplash.com/photo-1558603668-6570496b66f8?q=80&w=1964&auto=format&fit=crop"
          alt="Atelier"
          className="w-full h-full object-cover opacity-60 grayscale-[40%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2C2C2C] to-transparent opacity-80" />
        <div className="absolute bottom-20 left-20 right-20 space-y-6 text-left">
          <div className="flex items-center gap-4 text-[#D4AF37]">
            <div className="w-10 h-[1px] bg-[#D4AF37]" />
            <span className="text-[10px] uppercase tracking-[0.5em] font-black font-['Montserrat']">Established 2026</span>
          </div>
          <h1 className="text-6xl text-white font-['Playfair_Display'] italic leading-tight">
            The Digital Thread <br /> of Bespoke Artistry.
          </h1>
        </div>
      </div>

      {/* RIGHT SIDE: FORM CANVAS */}
      <div className="w-full lg:w-1/2 h-full flex flex-col justify-center p-8 md:p-24 relative overflow-y-auto">
        <div className="absolute top-8 left-8 lg:top-12 lg:left-24 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#2C2C2C] rounded-full flex items-center justify-center text-white"><Scissors size={14} /></div>
          <span className="text-[10px] font-black tracking-[0.5em] uppercase text-[#2C2C2C]">StitchConnect</span>
        </div>

        <div className="max-w-md w-full mx-auto space-y-10 text-left">
          {!showRecovery ? (
            /* --- LOGIN VIEW --- */
            <>
              <header className="space-y-4 pt-12 lg:pt-0 animate-in fade-in duration-500">
                <h2 className="text-[11px] uppercase tracking-[0.6em] font-['Montserrat'] font-black text-[#D4AF37]">Access Registry</h2>
                <h1 className="text-5xl font-['Playfair_Display'] italic text-[#2C2C2C]">Welcome Back.</h1>
              </header>

              <form onSubmit={handleSubmit} className="space-y-10 animate-in slide-in-from-bottom-4 duration-700">
                <div className="space-y-8">
                  <div className="group space-y-3 border-b border-[#2C2C2C]/10 focus-within:border-[#D4AF37] transition-all">
                    <label className="text-[9px] uppercase tracking-[0.3em] font-black opacity-30">Registry Email</label>
                    <div className="flex items-center gap-4 pb-4">
                      <Mail size={18} className="opacity-20" />
                      <input name="email" type="email" required value={formData.email} onChange={handleInputChange} placeholder="email@atelier.com" className="w-full bg-transparent outline-none italic text-xl" />
                    </div>
                  </div>

                  <div className="group space-y-3 border-b border-[#2C2C2C]/10 focus-within:border-[#D4AF37] transition-all">
                    <div className="flex justify-between items-end">
                      <label className="text-[9px] uppercase tracking-[0.3em] font-black opacity-30 group-focus-within:opacity-100 group-focus-within:text-[#D4AF37] transition-all">
                        Secret Credentials
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowRecovery(true)}
                        className="text-[8px] uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-[#D4AF37] transition-all"
                      >
                        Recover Key?
                      </button>
                    </div>
                    <div className="flex items-center gap-4 pb-4 relative">
                      <Lock size={18} className="opacity-20 group-focus-within:opacity-100 transition-all" />
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"} 
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className="w-full bg-transparent outline-none text-xl pr-10" // Added padding for the icon
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 bottom-4 text-[#2C2C2C] opacity-20 hover:opacity-100 transition-all"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <button type="submit" disabled={isLoading} className="w-full py-5 bg-[#2C2C2C] text-white text-[11px] tracking-[0.5em] font-black uppercase hover:bg-[#D4AF37] transition-all shadow-2xl flex items-center justify-center gap-4 group">
                    {isLoading ? "Authenticating..." : "Enter the Atelier"}
                    <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                  </button>
                  <p className="text-center text-sm italic opacity-40">
                    New to the registry? <Link to="/signup" className="ml-2 text-[#2C2C2C] font-black not-italic hover:text-[#D4AF37]">Join the Guild</Link>
                  </p>
                </div>
              </form>
            </>
          ) : (
            <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
              <header className="space-y-4">
                <h2 className="text-[11px] uppercase tracking-[0.6em] font-['Montserrat'] font-black text-[#D4AF37]">
                  {recoveryStep === 1 ? "Identity Verification" : "Key Calibration"}
                </h2>
                <h1 className="text-5xl font-['Playfair_Display'] italic text-[#2C2C2C]">
                  {recoveryStep === 1 ? "Key Recovery." : "Update Secret."}
                </h1>
              </header>

              {recoveryStep === 1 ? (
                <div className="space-y-12">
                  <div className="group space-y-3 border-b border-[#2C2C2C]/10 focus-within:border-[#D4AF37] transition-all">
                    <label className="text-[9px] uppercase tracking-[0.3em] font-black opacity-30">Registry Email</label>
                    <div className="flex items-center gap-4 pb-4">
                      <Fingerprint size={18} className="text-[#D4AF37]" />
                      <input
                        type="email"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        placeholder="email@atelier.com"
                        className="w-full bg-transparent outline-none italic text-2xl"
                      />
                    </div>
                  </div>
                  <button onClick={handleIssueRecovery} className="w-full py-5 bg-[#2C2C2C] text-white text-[11px] tracking-[0.5em] font-black uppercase hover:bg-[#D4AF37] transition-all shadow-xl flex items-center justify-center gap-4">
                    Issue Recovery Token <KeyRound size={16} />
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="space-y-6">
                    <div className="group space-y-3 border-b border-[#2C2C2C]/10 focus-within:border-[#D4AF37] transition-all">
                      <label className="text-[9px] uppercase tracking-[0.3em] font-black opacity-30">Verification Token</label>

                      <input
                        type="text"
                        maxLength={6}
                        value={recoveryForm.otp}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setRecoveryForm({ ...recoveryForm, otp: val });
                        }}
                        placeholder="000000"
                        className="w-full bg-transparent outline-none italic text-2xl tracking-[0.5em]"
                      />
                    </div>
                    <div className="group space-y-3 border-b border-[#2C2C2C]/10 focus-within:border-[#D4AF37] transition-all">
                      <label className="text-[9px] uppercase tracking-[0.3em] font-black opacity-30">New Secret Key</label>
                      <input
                        type="password"
                        value={recoveryForm.newPassword}
                        onChange={(e) => setRecoveryForm({ ...recoveryForm, newPassword: e.target.value })}
                        placeholder="••••••••"
                        className="w-full bg-transparent outline-none text-2xl"
                      />
                    </div>
                  </div>
                  <button onClick={handleFinalReset} className="w-full py-5 bg-[#2C2C2C] text-white text-[11px] tracking-[0.5em] font-black uppercase hover:bg-[#D4AF37] transition-all shadow-xl flex items-center justify-center gap-4">
                    Calibrate Key <CheckCircle2 size={16} />
                  </button>
                </div>
              )}

              <button onClick={() => { setShowRecovery(false); setRecoveryStep(1); }} className="w-full text-center text-[10px] uppercase font-black opacity-30 hover:opacity-100 tracking-widest">
                Abort Recovery
              </button>
            </div>
          )}

          <footer className="pt-10 flex items-center justify-center gap-6 border-t border-[#F2EDE4]">
            <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest opacity-30">
              <ShieldCheck size={14} /> Encrypted Session
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Login;