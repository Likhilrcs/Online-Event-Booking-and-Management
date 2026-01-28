import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Share2,
  Heart,
  ArrowLeft,
  Ticket,
  User
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { getCategoryColor } from '@/data/mockEvents';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatLocation, getEventImage } from '@/lib/utils';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [event, setEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.events
      .get(id)
      .then((res: any) => {
        setEvent(res.data || res);
        setLoading(false);
      })
      .catch((err: any) => {
        console.error("API Error fetching event:", err);
        setEvent(null);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4 text-foreground">Event not found</h1>
          <p className="text-muted-foreground mb-8">We couldn't find the event you're looking for. It may have been removed or the link is incorrect.</p>
          <Button onClick={() => navigate('/')} className="bg-accent hover:bg-accent/90">Back to Events</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const isSoldOut = event?.availableSeats === 0;

  const handleBookNow = () => {
    if (!isAuthenticated) {
      toast.info('Please sign in to book this event');
      navigate('/login', { state: { from: `/event/${id}` } });
      return;
    }
    navigate(`/booking/${id}`);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Banner */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <img
          src={getEventImage(event)}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Share & Favorite */}
        <div className="absolute top-6 right-6 flex gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors">
            <Heart className="w-5 h-5" />
          </button>
        </div>

        {/* Category Badge */}
        <div className="absolute bottom-6 left-6">
          <Badge className={`${getCategoryColor(event.category)} border-0 font-medium capitalize`}>
            {event.category}
          </Badge>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                {event.title}
              </h1>
              <div className="flex items-center gap-3 text-muted-foreground">
                <User className="w-4 h-4" />
                <span>Organized by <span className="text-foreground font-medium">{event.organizer?.name || event.organizerName || 'Unknown'}</span></span>
              </div>
            </motion.div>

            {/* Event Info Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium text-foreground">
                      {new Date(event.eventDate || event.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium text-foreground">{event.eventTime || event.time}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium text-foreground">
                      {event.location?.venue || event.venue}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatLocation(event.location)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Availability</p>
                    <p className="font-medium text-foreground">
                      {event.availableSeats} of {event.totalSeats} seats left
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">About This Event</h2>
              <p className="text-muted-foreground leading-relaxed">{event.description}</p>
            </motion.div>

            {/* Seat Availability Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">Seat Availability</h2>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent to-event-coral-dark rounded-full transition-all duration-500"
                    style={{ width: `${(event.availableSeats / event.totalSeats) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{event.totalSeats - event.availableSeats} booked</span>
                  <span className="text-accent font-medium">{event.availableSeats} available</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="sticky top-24 p-6 rounded-2xl bg-card border border-border shadow-lg"
            >
              <div className="flex items-baseline gap-2 mb-6">
                <span className="font-display text-4xl font-bold text-foreground">${event.price}</span>
                <span className="text-muted-foreground">/ person</span>
              </div>

              <div className="space-y-4 mb-6 pb-6 border-b border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Event Fee</span>
                  <span className="font-medium">${event.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service Fee</span>
                  <span className="font-medium">$0</span>
                </div>
              </div>

              <Button
                onClick={handleBookNow}
                disabled={isSoldOut}
                className={`w-full h-14 text-base font-semibold ${isSoldOut
                  ? 'bg-muted text-muted-foreground'
                  : 'btn-hero'
                  }`}
              >
                <Ticket className="w-5 h-5 mr-2" />
                {isSoldOut ? 'Sold Out' : 'Book Now'}
              </Button>

              {!isSoldOut && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Only {event.availableSeats} seats left — book now!
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
