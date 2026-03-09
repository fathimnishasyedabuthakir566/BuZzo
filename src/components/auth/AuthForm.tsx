import { useState, useEffect } from "react";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, registerSchema, type LoginFormData, type RegisterFormData } from "@/lib/validations/auth";

type AuthMode = "login" | "register";

interface AuthFormProps {
  mode: AuthMode;
  role: UserRole;
  onSubmit: (data: any) => Promise<void>;
  onModeChange: (mode: AuthMode) => void;
  isLoading: boolean;
}

const AuthForm = ({ mode, role, onSubmit, onModeChange, isLoading }: AuthFormProps) => {
  const [showPassword, setShowPassword] = useState(false);

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
    // Pass raw data up; parent handles the rest
    await onSubmit(data);
  };

  return (
    <>
      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {mode === "login"
            ? `Sign in as ${role === "admin" ? "an admin" : role === "driver" ? "a driver" : "a passenger"}`
            : `Register as ${role === "admin" ? "an admin" : role === "driver" ? "a driver" : "a passenger"}`}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {mode === "register" && (
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                {...register("name")}
                type="text"
                placeholder="Enter your name"
                className={`input-field pl-12 ${(errors as any).name ? 'border-red-500' : ''}`}
              />
            </div>
            {(errors as any).name && (
              <p className="text-xs text-red-500 mt-1">{String((errors as any).name.message)}</p>
            )}
          </div>
        )}

        {mode === "register" && (
          <>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  {...register("phone")}
                  type="tel"
                  placeholder="Enter your phone number"
                  className={`input-field pl-12 ${(errors as any).phone ? 'border-red-500' : ''}`}
                />
              </div>
              {(errors as any).phone && (
                <p className="text-xs text-red-500 mt-1">{String((errors as any).phone.message)}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                City
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  {...register("city")}
                  type="text"
                  placeholder="Enter your city"
                  className={`input-field pl-12 ${(errors as any).city ? 'border-red-500' : ''}`}
                />
              </div>
              {(errors as any).city && (
                <p className="text-xs text-red-500 mt-1">{String((errors as any).city.message)}</p>
              )}
            </div>
          </>
        )}

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              {...register("email")}
              type="email"
              placeholder="you@example.com"
              className={`input-field pl-12 ${errors.email ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{String(errors.email.message)}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className={`input-field pl-12 pr-12 ${errors.password ? 'border-red-500' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">{String(errors.password.message)}</p>
          )}
        </div>

        {mode === "register" && (
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                {...register("confirmPassword")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`input-field pl-12 ${(errors as any).confirmPassword ? 'border-red-500' : ''}`}
              />
            </div>
            {(errors as any).confirmPassword && (
              <p className="text-xs text-red-500 mt-1">{String((errors as any).confirmPassword.message)}</p>
            )}
          </div>
        )}

        {mode === "login" && (
          <div className="flex justify-end">
            <a href="#" className="text-sm text-accent hover:underline">
              Forgot password?
            </a>
          </div>
        )}

        <Button
          type="submit"
          variant="hero"
          size="lg"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="animate-pulse">Please wait...</span>
          ) : mode === "login" ? (
            <>
              Sign In
              <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            <>
              Create Account
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>

      {/* Toggle Mode */}
      <p className="text-center mt-6 text-muted-foreground">
        {mode === "login" ? (
          <>
            Don't have an account?{" "}
            <button
              onClick={() => onModeChange("register")}
              className="text-accent font-medium hover:underline"
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              onClick={() => onModeChange("login")}
              className="text-accent font-medium hover:underline"
            >
              Sign in
            </button>
          </>
        )}
      </p>
    </>
  );
};

export default AuthForm;
