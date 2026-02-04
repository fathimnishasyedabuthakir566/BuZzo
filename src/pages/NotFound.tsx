import { Link } from "react-router-dom";
import { Bus, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
      <div className="relative z-10 text-center">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-r from-primary to-accent flex items-center justify-center mx-auto mb-8 shadow-lg animate-pulse">
          <Bus className="w-12 h-12 text-primary-foreground" />
        </div>
        <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Page Not Found</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          Looks like this bus route doesn't exist. Let's get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button variant="accent" size="lg">
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </Link>
          <Link to="/buses">
            <Button variant="outline" size="lg">
              <Bus className="w-4 h-4" />
              Track Buses
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
