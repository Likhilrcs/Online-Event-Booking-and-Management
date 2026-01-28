import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Minus, Plus, CheckCircle, ArrowLeft, Ticket } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { getEventImage, formatLocation } from '@/lib/utils';
import api from '@/lib/api';

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticketCount, setTicketCount] = useState(1);
  const [isBooking, setIsBooking] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<any | null>(null);
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
        console.error("API Error fetching event for booking:", err);
        setEvent(null);
        setLoading(false);
        toast.error('Failed to load event details');
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
          <Button onClick={() => navigate('/')} className="bg-accent hover:bg-accent/90">Back to Events</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const totalAmount = (event.price || 0) * ticketCount;
  const maxTickets = Math.min(event.availableSeats ?? 10, 10);

  const handleBooking = async () => {
    if (!id) return;
    setIsBooking(true);

    try {
      // Basic check for token if we get 401
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Session expired. Please login again.');
        navigate('/login', { state: { from: `/booking/${id}` } });
        return;
      }

      const res: any = await api.bookings.create({
        eventId: id,
        numberOfSeats: ticketCount,
      });
      setCompletedBooking(res.data || res);
      toast.success('Booking confirmed! Your ticket is ready.');
    } catch (error: any) {
      console.error("Booking error:", error);
      const message = error.response?.data?.message || error.message || 'Failed to create booking';
      toast.error(message);

      if (error.response?.status === 401) {
        navigate('/login', { state: { from: `/booking/${id}` } });
      }
    } finally {
      setIsBooking(false);
    }
  };

  if (completedBooking) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg mx-auto text-center"
          >
            <div className="w-20 h-20 rounded-full bg-success/20 mx-auto mb-6 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">
              Booking Confirmed!
            </h1>
            <p className="text-muted-foreground mb-8 text-sm">
              Your tickets for <span className="font-medium text-foreground">{event.title}</span> have been booked successfully.
              A confirmation email has been sent to {user?.email}.
            </p>

            <div className="p-6 rounded-2xl bg-card border border-border shadow-2xl mb-8 text-left relative overflow-hidden">
              {/* Decorative ticket notch */}
              <div className="absolute top-1/2 -left-4 w-8 h-8 rounded-full bg-background border-r border-border -translate-y-1/2" />
              <div className="absolute top-1/2 -right-4 w-8 h-8 rounded-full bg-background border-l border-border -translate-y-1/2" />

              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-bold text-lg text-foreground uppercase tracking-tight">Admission Ticket</h3>
                  <p className="text-xs text-muted-foreground">Booking ID: <span className="font-mono text-accent font-bold">{completedBooking.bookingId}</span></p>
                </div>
                <div className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
                  <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Confirmed</span>
                </div>
              </div>

              <div className="space-y-4 text-sm border-t border-dashed border-border pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Event</span>
                    <span className="font-semibold text-foreground line-clamp-1">{event.title}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Date</span>
                    <span className="font-semibold text-foreground">{new Date(event.eventDate || event.date).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Tickets</span>
                    <span className="font-semibold text-foreground">{completedBooking.numberOfSeats} Person(s)</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Total Paid</span>
                    <span className="font-bold text-accent">${completedBooking.totalAmount}</span>
                  </div>
                </div>

                {completedBooking.ticketCode && (
                  <div className="mt-6 flex flex-col gap-2 p-4 bg-muted/50 rounded-xl border border-border">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-accent" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Entry Code</span>
                    </div>
                    <code className="text-2xl font-mono font-black text-foreground text-center tracking-[0.2em]">
                      {completedBooking.ticketCode}
                    </code>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="flex-1 gap-2"
              >
                <Ticket className="w-4 h-4" />
                Download Ticket
              </Button>
              <Button
                onClick={() => navigate('/my-bookings')}
                className="flex-1 bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20"
              >
                My Bookings
              </Button>
            </div>

            <p className="mt-8 text-xs text-muted-foreground">
              Need help? <Link to="/contact" className="text-accent underline font-medium">Contact Support</Link>
            </p>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to event
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Event Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h1 className="font-display text-3xl font-bold text-foreground">Complete Your Booking</h1>

            <div className="rounded-xl overflow-hidden shadow-2xl">
              <img
                src={getEventImage(event)}
                alt={event.title}
                className="w-full h-48 object-cover"
              />
            </div>

            <div>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">{event.title}</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-muted-foreground p-3 rounded-lg bg-muted/30">
                  <Calendar className="w-5 h-5 text-accent" />
                  <span className="text-foreground">{new Date(event.eventDate || event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground p-3 rounded-lg bg-muted/30">
                  <Clock className="w-5 h-5 text-accent" />
                  <span className="text-foreground">{event.eventTime || event.time}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground p-3 rounded-lg bg-muted/30">
                  <MapPin className="w-5 h-5 text-accent" />
                  <span className="text-foreground">
                    {event.location?.venue || event.venue},{' '}
                    {formatLocation(event.location)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Booking Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* User Details */}
            <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
              <h3 className="font-semibold mb-4">Your Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Full Name</Label>
                  <Input value={user?.name || ''} readOnly className="bg-muted" />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input value={user?.email || ''} readOnly className="bg-muted" />
                </div>
              </div>
            </div>

            {/* Ticket Selection */}
            <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
              <h3 className="font-semibold mb-4">Select Tickets</h3>
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/50">
                <div>
                  <p className="font-bold text-foreground">General Admission</p>
                  <p className="text-sm text-muted-foreground">${event.price} per ticket</p>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                    onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                    disabled={ticketCount <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center font-display text-2xl font-bold">{ticketCount}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                    onClick={() => setTicketCount(Math.min(maxTickets, ticketCount + 1))}
                    disabled={ticketCount >= maxTickets}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {ticketCount >= maxTickets && (
                <p className="text-xs text-warning mt-3 font-medium flex items-center gap-1">
                  Limited to {maxTickets} tickets per booking
                </p>
              )}
            </div>

            {/* Order Summary */}
            <div className="p-6 rounded-xl bg-card border border-border shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Ticket className="w-24 h-24 rotate-12" />
              </div>
              <h3 className="font-semibold mb-4">Order Summary</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{ticketCount} × General Admission</span>
                  <span className="font-medium text-foreground">${(event.price || 0) * ticketCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Booking Fee</span>
                  <span className="font-medium text-success">FREE</span>
                </div>
                <div className="border-t border-dashed border-border pt-4 mt-4 flex justify-between items-baseline">
                  <span className="font-semibold text-lg">Total Amount</span>
                  <span className="text-3xl font-black text-accent">${totalAmount}</span>
                </div>
              </div>

              <Button
                onClick={handleBooking}
                disabled={isBooking}
                className="w-full h-14 btn-hero text-lg font-bold shadow-xl"
              >
                {isBooking ? (
                  <span className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    Securing your tickets...
                  </span>
                ) : (
                  `Confirm & Pay $${totalAmount}`
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
