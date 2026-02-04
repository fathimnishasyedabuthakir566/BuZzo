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

  const handleSubmit = async (data: {
    name?: string;
    email: string;
    password: string;
    confirmPassword?: string;
    phone?: string;
    city?: string;
  }) => {
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
          if (response.user?.role === 'admin') {
            navigate('/admin');
          } else if (response.user?.role === 'driver') {
            navigate('/driver');
          } else {
            navigate('/dashboard');
          }
        } else {
          toast.error(response.error || "Login failed");
        }
      } else {
        // Register
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
          if (response.user?.role === 'admin') {
            navigate('/admin');
          } else if (response.user?.role === 'driver') {
            navigate('/driver');
          } else {
            navigate('/dashboard');
          }
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
    <Layout showFooter={false}>
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        {/* Background */}
        <div className="fixed inset-0 bg-gradient-hero opacity-5" />
        <div className="fixed top-1/4 -left-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        <div className="fixed bottom-1/4 -right-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />

        <div className="relative z-10 w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center shadow-lg">
              <Bus className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <span className="text-xl font-bold text-foreground">BusTrack</span>
              <span className="text-xs text-muted-foreground block -mt-1">Tirunelveli</span>
            </div>
          </Link>

          {/* Auth Card */}
          <div className="glass-card rounded-2xl p-8 shadow-xl animate-scale-in">
            <RoleSelector role={role} onRoleChange={setRole} />
            <AuthForm
              mode={mode}
              role={role}
              onSubmit={handleSubmit}
              onModeChange={setMode}
              isLoading={isLoading}
            />
          </div>

          {/* Additional Info for Operators */}
          {role === "admin" && (
            <div className="mt-6 text-center text-sm text-muted-foreground animate-fade-in">
              <p>
                Bus operators can manage their buses, update locations, and set availability.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
