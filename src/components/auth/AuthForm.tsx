import { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types";

type AuthMode = "login" | "register";

interface AuthFormProps {
  mode: AuthMode;
  role: UserRole;
  onSubmit: (data: {
    name?: string;
    email: string;
    password: string;
    confirmPassword?: string;
    phone?: string;
    city?: string;
  }) => Promise<void>;
  onModeChange: (mode: AuthMode) => void;
  isLoading: boolean;
}

const AuthForm = ({ mode, role, onSubmit, onModeChange, isLoading }: AuthFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    city: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
            ? `Sign in as ${role === "admin" ? "a bus operator" : "a passenger"}`
            : `Register as ${role === "admin" ? "a bus operator" : "a passenger"}`}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "register" && (
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your name"
                className="input-field pl-12"
                required
              />
            </div>
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
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  className="input-field pl-12"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                City
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Enter your city"
                  className="input-field pl-12"
                  required
                />
              </div>
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
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="you@example.com"
              className="input-field pl-12"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              className="input-field pl-12 pr-12"
              required
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
        </div>

        {mode === "register" && (
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="input-field pl-12"
                required
              />
            </div>
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
