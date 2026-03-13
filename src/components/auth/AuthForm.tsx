import { useState, useEffect } from "react";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GoogleLogin } from "@react-oauth/google";
import { authService } from "@/services/authService";
import { loginSchema, registerSchema, type LoginFormData, type RegisterFormData } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

type AuthMode = "login" | "register";

interface AuthFormProps {
  mode: AuthMode;
  role: UserRole;
  onSubmit: (data: LoginFormData | RegisterFormData | { _skipForm: boolean }) => Promise<void>;
  onModeChange: (mode: AuthMode) => void;
  isLoading: boolean;
}

interface FloatingInputProps {
  label: string;
  icon: React.ElementType;
  id: string;
  type?: string;
  register: any; // react-hook-form register
  error?: { message?: string };
  showPasswordToggle?: boolean;
  showPassword?: boolean;
  setShowPassword?: (show: boolean) => void;
}

const FloatingInput = ({ label, icon: Icon, id, type = "text", register, error, showPasswordToggle, showPassword, setShowPassword }: FloatingInputProps) => (
  <div className="relative mb-6 floating-label-input">
    <div className="relative flex items-center">
      <div className="absolute left-4 text-slate-400">
        <Icon className="w-5 h-5" />
      </div>
      <input
        {...register(id)}
        id={id}
        type={type}
        placeholder=" "
        className={cn(
          "w-full h-14 pl-12 pr-12 bg-white border border-slate-200 rounded-2xl text-slate-800 font-medium focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all",
          error && "border-red-500 focus:ring-red-500/10 focus:border-red-500"
        )}
      />
      <label 
        htmlFor={id} 
        className="absolute left-12 top-1/2 -translate-y-1/2 text-slate-400 font-medium transition-all"
      >
        {label}
      </label>
      {showPasswordToggle && (
        <button
          type="button"
          onClick={() => setShowPassword?.(!showPassword)}
          className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      )}
    </div>
    {error && (
      <p className="absolute -bottom-5 left-2 text-[10px] font-bold text-red-500 uppercase tracking-wider animate-fade-in">
        {error.message}
      </p>
    )}
  </div>
);

const AuthForm = ({ mode, role, onSubmit, onModeChange, isLoading }: AuthFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();

  // Determine which schema to use
  const schema = mode === "login" ? loginSchema : registerSchema;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterFormData | LoginFormData>({
    resolver: zodResolver(schema),
    mode: "onBlur"
  });

  // Reset form when mode changes
  useEffect(() => {
    reset();
  }, [mode, reset]);

  const onFormSubmit = async (data: RegisterFormData | LoginFormData) => {
    await onSubmit(data);
  };

  const roleText = role === "admin" ? "an Admin" : role === "driver" ? "a Bus Driver" : "a Passenger";

  return (
    <>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">
          {mode === "login" ? t("welcome") : t("get_started")}
        </h2>
        <p className="text-slate-500 font-medium text-sm">
          Sign {mode === "login" ? "in" : "up"} as <span className="text-teal-600 font-bold">{roleText}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {mode === "register" && (
          <>
            <FloatingInput 
              label="Full Name" 
              icon={User} 
              id="name" 
              register={register} 
              error={(errors as any).name} 
            />
            <div className="flex gap-4">
              <div className="flex-1">
                <FloatingInput 
                  label="Phone" 
                  icon={Phone} 
                  id="phone" 
                  register={register} 
                  error={(errors as any).phone} 
                />
              </div>
              <div className="flex-1">
                <FloatingInput 
                  label="City" 
                  icon={MapPin} 
                  id="city" 
                  register={register} 
                  error={(errors as any).city} 
                />
              </div>
            </div>
          </>
        )}

        <FloatingInput 
          label={t("email")} 
          icon={Mail} 
          id="email" 
          type="email" 
          register={register} 
          error={errors.email} 
        />

        <FloatingInput 
          label={t("password")} 
          icon={Lock} 
          id="password" 
          type={showPassword ? "text" : "password"} 
          register={register} 
          error={errors.password}
          showPasswordToggle
          showPassword={showPassword}
          setShowPassword={setShowPassword}
        />

        {mode === "register" && (
          <FloatingInput 
            label="Confirm Password" 
            icon={Lock} 
            id="confirmPassword" 
            type={showPassword ? "text" : "password"} 
            register={register} 
            error={(errors as any).confirmPassword} 
          />
        )}

        {mode === "login" && (
          <div className="flex justify-end pt-0 pb-2">
            <button type="button" className="text-xs font-bold text-teal-600 hover:text-teal-700 uppercase tracking-widest">
              {t("forgot_password")}
            </button>
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-14 rounded-2xl gradient-btn-buzzo text-white font-black uppercase tracking-widest shadow-xl"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:-0.3s]" />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {mode === "login" ? t("signin") : t("signup")}
              <ArrowRight className="w-5 h-5" />
            </div>
          )}
        </Button>
      </form>

      <div className="mt-8 mb-6 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-100" />
        </div>
        <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
          <span className="bg-white px-4">{t("continue_with")}</span>
        </div>
      </div>

      <div className="w-full flex justify-center mb-8">
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            if (credentialResponse.credential) {
              try {
                const response = await authService.googleLogin(credentialResponse.credential, role);
                if (response.success) {
                   // Let the parent component re-fetch the user and route
                    await onSubmit({ _skipForm: true } as { _skipForm: boolean }); 
                } else {
                   toast.error(response.error || "Google login failed");
                }
              } catch (error) {
                 toast.error("An error occurred during Google sign-in.");
              }
            }
          }}
          onError={() => {
            toast.error("Google Login Failed");
          }}
          useOneTap
          theme="filled_blue"
          shape="pill"
          size="large"
        />
      </div>

      <p className="text-center text-sm font-medium text-slate-500">
        {mode === "login" ? "Don't have an account? " : "Already registered? "}
        <button
          onClick={() => onModeChange(mode === "login" ? "register" : "login")}
          className="text-teal-600 font-extrabold hover:underline underline-offset-4"
        >
          {mode === "login" ? t("signup") : t("signin")}
        </button>
      </p>
    </>
  );
};

export default AuthForm;
