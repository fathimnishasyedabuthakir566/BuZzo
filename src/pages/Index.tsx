import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bus, MapPin, Clock, Shield, Users, ArrowRight, CheckCircle2 } from "lucide-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { BusCard } from "@/components/bus";
import { busService } from "@/services/busService";
import type { Bus as BusType } from "@/types";

const features = [
  {
    icon: MapPin,
    title: "Live Tracking",
    description: "Track your bus location in real-time on an interactive map",
  },
  {
    icon: Clock,
    title: "Accurate ETA",
    description: "Get precise arrival time updates from bus drivers",
  },
  {
    icon: Shield,
    title: "Reliable Updates",
    description: "Driver-verified updates ensure accurate information",
  },
  {
    icon: Users,
    title: "For Everyone",
    description: "Easy to use for passengers and operators alike",
  },
];

const benefits = [
  "No more waiting at bus stops wondering when the bus will arrive",
  "Plan your commute with accurate departure and arrival times",
  "Drivers update their location ensuring you get real information",
  "Works on all devices - phone, tablet, or computer",
];

const Index = () => {
  const [buses, setBuses] = useState<BusType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const data = await busService.getAllBuses();
        setBuses(data.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch buses for home page:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBuses();
  }, []);
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-hero opacity-5" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />

        <div className="section-container relative z-10 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse-dot" />
                Live Bus Tracking for Tirunelveli
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Know Exactly When Your{" "}
                <span className="gradient-text">Bus Arrives</span>
              </h1>

              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
                Real-time bus tracking for daily commuters traveling to Tirunelveli.
                No more guessing – see live locations, accurate ETAs, and daily availability.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/buses">
                  <Button variant="hero" size="xl">
                    <Bus className="w-5 h-5" />
                    Track Buses Now
                  </Button>
                </Link>
                <Link to="/auth?role=admin">
                  <Button variant="hero-outline" size="xl">
                    I'm a Bus Operator
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-10 flex flex-wrap items-center gap-6 justify-center lg:justify-start">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  Free to use
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  Real-time updates
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  Driver verified
                </div>
              </div>
            </div>

            {/* Hero Visual - Sample Bus Cards */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-hero opacity-5 rounded-3xl transform rotate-3" />
              <div className="relative space-y-4 p-6">
                {buses.length > 0 ? (
                  buses.slice(0, 2).map((bus, index) => (
                    <div
                      key={bus.id}
                      className={`animate-slide-up stagger-${index + 2}`}
                      style={{ transform: `translateX(${index * 20}px)` }}
                    >
                      <BusCard {...bus} />
                    </div>
                  ))
                ) : (
                  <div className="glass-card p-8 text-center text-muted-foreground animate-fade-in">
                    <Bus className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>Loading real-time buses...</p>
                  </div>
                )}

                {/* Floating notification */}
                <div className="absolute -top-4 -right-4 glass-card px-4 py-3 rounded-xl shadow-lg animate-fade-in stagger-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                      <Bus className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Nellai Express</p>
                      <p className="text-sm font-semibold text-success">Arriving in 2 mins!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="page-header mb-4">Why Use BusTrack?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built specifically for commuters in the Tirunelveli region, BusTrack solves the
              unpredictable bus timing problem once and for all.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="glass-card rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-hero flex items-center justify-center mx-auto mb-4 shadow-md">
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="page-header mb-6">Simple, Reliable Bus Tracking</h2>
              <p className="text-muted-foreground mb-8">
                BusTrack connects bus operators directly with passengers. Drivers update their
                location and ETA in real-time, so you always know when your bus will arrive.
              </p>

              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CheckCircle2 className="w-5 h-5 text-success mt-0.5 shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>

              <Link to="/buses" className="inline-block mt-8">
                <Button variant="accent" size="lg">
                  Start Tracking
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Buses Preview */}
            <div className="space-y-4">
              {buses.length > 0 ? (
                buses.map((bus, index) => (
                  <div
                    key={bus.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.15}s` }}
                  >
                    <BusCard {...bus} />
                  </div>
                ))
              ) : (
                <div className="glass-card p-12 text-center text-muted-foreground">
                  <p>Check "Track Buses" for all available routes.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />

        <div className="section-container relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Never Miss Your Bus Again?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join thousands of commuters who trust BusTrack for their daily travel to Tirunelveli.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?mode=register">
              <Button variant="glass" size="xl" className="bg-card text-foreground hover:bg-card/90">
                Create Free Account
              </Button>
            </Link>
            <Link to="/buses">
              <Button variant="hero-outline" size="xl" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/50">
                Browse Buses
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
