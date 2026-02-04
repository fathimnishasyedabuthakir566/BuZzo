import { Link } from "react-router-dom";
import { Bus, Heart, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="section-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <Bus className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <span className="text-lg font-bold">BusTrack</span>
                <span className="text-xs opacity-80 block -mt-1">Tirunelveli</span>
              </div>
            </Link>
            <p className="text-primary-foreground/80 text-sm max-w-md mb-4">
              Real-time bus tracking for daily commuters traveling to Tirunelveli. 
              Know exactly when your bus arrives.
            </p>
            <div className="flex items-center gap-4 text-sm text-primary-foreground/70">
              <a href="mailto:support@bustrack.app" className="flex items-center gap-1 hover:text-accent transition-colors">
                <Mail className="w-4 h-4" />
                support@bustrack.app
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <Link to="/buses" className="hover:text-accent transition-colors">Track Buses</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-accent transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-accent transition-colors">Login</Link>
              </li>
              <li>
                <Link to="/auth?mode=register" className="hover:text-accent transition-colors">Register</Link>
              </li>
            </ul>
          </div>

          {/* For Operators */}
          <div>
            <h4 className="font-semibold mb-4">For Operators</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <Link to="/auth?role=admin" className="hover:text-accent transition-colors">Driver Login</Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-accent transition-colors">Admin Dashboard</Link>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">Partner With Us</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/70">
            © {new Date().getFullYear()} BusTrack Tirunelveli. All rights reserved.
          </p>
          <p className="text-sm text-primary-foreground/70 flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-destructive fill-destructive" /> for commuters
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
