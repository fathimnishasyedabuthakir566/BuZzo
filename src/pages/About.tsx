import { Link } from "react-router-dom";
import { Bus, MapPin, Clock, Users, Heart, ArrowRight, CheckCircle2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

const About = () => {
  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-hero opacity-5" />
          <div className="section-container relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="page-header text-4xl md:text-5xl mb-6">
                Built for <span className="gradient-text">Tirunelveli</span> Commuters
              </h1>
              <p className="text-lg text-muted-foreground">
                BusTrack was created to solve a simple but frustrating problem: not knowing when
                your bus will arrive. We understand the daily challenges faced by commuters in
                the Tirunelveli region.
              </p>
            </div>
          </div>
        </section>

        {/* Problem & Solution */}
        <section className="py-16 bg-secondary/30">
          <div className="section-container">
            <div className="grid md:grid-cols-2 gap-12">
              {/* The Problem */}
              <div className="glass-card rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">The Problem</h2>
                <ul className="space-y-4">
                  {[
                    "Unpredictable bus timings - schedules change daily",
                    "No way to know if a bus is running today",
                    "Long waits at bus stops in heat or rain",
                    "Missing buses because arrival times are unknown",
                    "No communication between operators and passengers",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-muted-foreground">
                      <span className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-destructive" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* The Solution */}
              <div className="glass-card rounded-2xl p-8 border-accent/30">
                <h2 className="text-2xl font-bold text-foreground mb-4">Our Solution</h2>
                <ul className="space-y-4">
                  {[
                    "Real-time bus location tracking on a live map",
                    "Driver-updated ETAs for accurate arrival times",
                    "Daily bus availability at your fingertips",
                    "Plan your commute with confidence",
                    "Direct connection between operators and passengers",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-foreground">
                      <CheckCircle2 className="w-6 h-6 text-success shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16">
          <div className="section-container">
            <h2 className="page-header text-center mb-12">How BusTrack Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Bus,
                  title: "For Bus Operators",
                  description:
                    "Bus drivers or operators register their buses, mark daily availability, and update their live location and ETA throughout the journey.",
                },
                {
                  icon: MapPin,
                  title: "Real-Time Tracking",
                  description:
                    "Location updates are sent to our platform and displayed on an interactive map, showing exactly where each bus is.",
                },
                {
                  icon: Users,
                  title: "For Passengers",
                  description:
                    "Passengers can view all available buses, see live locations, check ETAs, and plan their travel accordingly.",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="glass-card rounded-xl p-6 text-center animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-16 h-16 rounded-xl bg-gradient-hero flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <item.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Mission */}
        <section className="py-16 bg-secondary/30">
          <div className="section-container">
            <div className="max-w-3xl mx-auto text-center">
              <Heart className="w-12 h-12 text-accent mx-auto mb-6" />
              <h2 className="page-header mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-8">
                We believe everyone deserves reliable public transportation information.
                Our mission is to make daily commuting in Tirunelveli and surrounding areas
                stress-free by providing accurate, real-time bus tracking that you can depend on.
              </p>
              <p className="text-muted-foreground">
                BusTrack is built with love for our community, by people who understand
                the daily challenges of commuting in our region.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="section-container">
            <div className="glass-card rounded-2xl p-8 md:p-12 text-center bg-gradient-hero text-primary-foreground">
              <h2 className="text-3xl font-bold mb-4">Ready to Track Your Bus?</h2>
              <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                Join thousands of commuters who rely on BusTrack for their daily travel.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/buses">
                  <Button variant="glass" size="xl" className="bg-card text-foreground hover:bg-card/90">
                    Track Buses Now
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/auth?role=admin">
                  <Button variant="hero-outline" size="xl" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                    Register as Operator
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default About;
