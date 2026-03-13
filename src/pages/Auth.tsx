import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Bus } from "lucide-react";
import { Layout } from "@/components/layout";
import { AuthForm, RoleSelector } from "@/components/auth";
import type { UserRole } from "@/types";
import { authService } from "@/services/authService";
import { toast } from "sonner";

type AuthMode = "login" | "register";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>((searchParams.get("mode") as AuthMode) || "login");
  const [role, setRole] = useState<UserRole>((searchParams.get("role") as UserRole) || "user");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const modeParam = searchParams.get("mode") as AuthMode;
    const roleParam = searchParams.get("role") as UserRole;
    if (modeParam) setMode(modeParam);
    if (roleParam) setRole(roleParam);
  }, [searchParams]);

  const handleSubmit = async (data: Record<string, string>) => {
    setIsLoading(true);
    try {
      if (mode === 'login') {
        const response = await authService.login({
          email: data.email,
          password: data.password,
          role: role,
        });

        if (response.success) {
          toast.success("Login successful!");
          const lowerRole = response.user?.role?.toLowerCase() || 'user';
          navigate(lowerRole === 'admin' ? '/admin' : lowerRole === 'driver' ? '/driver' : '/');
        } else {
          toast.error(response.error || "Login failed");
        }
      } else {
        if (data.password !== data.confirmPassword) {
          toast.error("Passwords do not match");
          setIsLoading(false);
          return;
        }

        const response = await authService.register({
          name: data.name || 'User',
          email: data.email,
          password: data.password,
          role: role,
          phone: data.phone,
          city: data.city,
        });

        if (response.success) {
          toast.success("Account created successfully!");
          const lowerRole = response.user?.role?.toLowerCase() || 'user';
          navigate(lowerRole === 'admin' ? '/admin' : lowerRole === 'driver' ? '/driver' : '/');
        } else {
          toast.error(response.error || "Registration failed");
        }
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6 sm:p-12 overflow-hidden bg-slate-50 font-sans">
      {/* Dynamic Background Blobs */}
      <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-teal-500/10 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse-slow" />
      <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-slate-900/5 rounded-full blur-[100px] -ml-48 -mb-48" />

      {/* Modern Header / Brand */}
      <div className="relative z-20 flex flex-col items-center mb-10">
        <div className="w-20 h-20 rounded-3xl gradient-btn-buzzo flex items-center justify-center shadow-2xl mb-6 transform hover:rotate-6 transition-transform cursor-pointer">
          <Bus className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-1">
          BUZZO <span className="text-teal-600 italic">TRANSIT</span>
        </h1>
        <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px] mt-2">
          Real-Time Tracking System
        </p>
      </div>

      {/* Auth Card */}
      <div className="relative z-20 w-full max-w-md bg-white rounded-[3rem] p-8 sm:p-10 shadow-soft border border-slate-100 animate-scale-in">
        <RoleSelector role={role} onRoleChange={setRole} />
        
        <AuthForm
          mode={mode}
          role={role}
          onSubmit={handleSubmit}
          onModeChange={setMode}
          isLoading={isLoading}
        />
      </div>

      {/* Decoration / Illustration Placeholder */}
      <div className="absolute bottom-10 opacity-5 pointer-events-none hidden lg:block">
        <Bus className="w-64 h-64 text-slate-900 -rotate-12" />
      </div>

      {/* Footer Text */}
      <div className="relative z-20 mt-10 text-center">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">
          Powered by Buzzo Engine v2.0 • Tirunelveli Division
        </p>
      </div>
    </div>
  );
};

export default Auth;
