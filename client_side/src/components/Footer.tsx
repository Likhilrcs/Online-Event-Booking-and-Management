import { Link } from 'react-router-dom';
import { Calendar, Mail, MapPin, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <Calendar className="w-5 h-5 text-accent-foreground" />
              </div>
              <span className="font-display text-xl font-bold">Eventify</span>
            </div>
            <p className="text-primary-foreground/70 text-sm">
              Discover and book amazing events. From concerts to conferences, find your next experience.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                  Browse Events
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* For Organizers */}
          <div>
            <h3 className="font-display font-semibold mb-4">For Organizers</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/register" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                  Become an Organizer
                </Link>
              </li>
              <li>
                <span className="text-sm text-primary-foreground/70">
                  Event Management
                </span>
              </li>
              <li>
                <span className="text-sm text-primary-foreground/70">
                  Analytics & Insights
                </span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Mail className="w-4 h-4" />
                hello@eventify.com
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Phone className="w-4 h-4" />
                +1 (555) 123-4567
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <MapPin className="w-4 h-4" />
                San Francisco, CA
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/50">
            © 2024 Eventify. All rights reserved.
          </p>
          <div className="flex gap-6">
            <span className="text-sm text-primary-foreground/50 hover:text-primary-foreground/70 cursor-pointer">
              Privacy Policy
            </span>
            <span className="text-sm text-primary-foreground/50 hover:text-primary-foreground/70 cursor-pointer">
              Terms of Service
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
