import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Ticket, Clock, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/EmptyState';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { getEventImage, formatLocation } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function MyBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchBookings = () => {
    setLoading(true);
    api.bookings
      .listMine()
      .then((res: any) => setBookings(res.data || res || []))
      .catch(() => {
        setBookings([]);
        toast.error('Failed to load your bookings');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (id: string) => {
    try {
      await api.bookings.cancel(id);
      toast.success('Booking cancelled successfully');
      setCancellingId(null);
      fetchBookings(); // Refresh list
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel booking');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">My Bookings</h1>
        <p className="text-muted-foreground mb-8">View and manage your event tickets</p>

        {loading && (
          <div className="py-12 text-center text-muted-foreground">
            Loading your bookings...
          </div>
        )}

        {!loading && bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking, index) => (
              <motion.div
                key={booking._id || booking.bookingId || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 md:p-6 rounded-xl bg-card border border-border flex flex-col md:flex-row gap-4"
              >
                {booking.event && (
                  <>
                    <img
                      src={getEventImage({ bannerImage: booking.event.bannerImage })}
                      alt={booking.event.title}
                      className="w-full md:w-40 h-32 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-display text-lg font-semibold">{booking.event.title}</h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(booking.event.eventDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {booking.event.eventTime || ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            {booking.event.location?.venue || formatLocation(booking.event.location)}
                          </div>
                        </div>
                        <Badge className={`
                          ${booking.status === 'confirmed' ? 'status-approved' : ''}
                          ${booking.status === 'pending' ? 'status-pending' : ''}
                          ${booking.status === 'cancelled' ? 'status-rejected' : ''}
                        `}>
                          {booking.status}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-border">
                        <div className="flex flex-wrap items-center gap-6 flex-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Ticket className="w-4 h-4 text-accent" />
                            <span>{booking.numberOfSeats} ticket(s)</span>
                          </div>
                          <div className="text-sm font-semibold text-accent">
                            ${booking.totalAmount}
                          </div>
                          {booking.ticketCode && booking.status !== 'cancelled' && (
                            <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg border border-border/50">
                              <CheckCircle className="w-3.5 h-3.5 text-success" />
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Ticket Code:</span>
                              <code className="text-sm font-mono font-bold text-foreground">{booking.ticketCode}</code>
                            </div>
                          )}
                        </div>

                        {booking.status !== 'cancelled' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive border-destructive/20 hover:bg-destructive-light"
                            onClick={() => setCancellingId(booking._id || booking.id)}
                          >
                            Cancel Booking
                          </Button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Ticket}
            title="No bookings yet"
            description="When you book events, they will appear here."
            actionLabel="Browse Events"
            onAction={() => navigate('/')}
          />
        )}
      </div>

      <Dialog open={!!cancellingId} onOpenChange={() => setCancellingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone and your seats will be released.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancellingId(null)}>Close</Button>
            <Button variant="destructive" onClick={() => cancellingId && handleCancelBooking(cancellingId)}>
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
