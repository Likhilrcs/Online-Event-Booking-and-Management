import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  Users,
  Ticket,
  TrendingUp,
  Check,
  X,
  Eye,
  MoreHorizontal,
  Trash2,
  Shield
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { getEventImage } from '@/lib/utils';
import api from '@/lib/api';

const statCardsBase = [
  { key: 'events', label: 'Total Events', icon: Calendar, color: 'bg-accent/10 text-accent' },
  { key: 'users', label: 'Total Users', icon: Users, color: 'bg-event-teal-light text-event-teal' },
  { key: 'bookings', label: 'Total Bookings', icon: Ticket, color: 'bg-success-light text-success' },
  { key: 'revenue', label: 'Revenue', icon: TrendingUp, color: 'bg-event-purple-light text-event-purple' },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [stats, setStats] = useState({ events: 0, users: 0, bookings: 0, revenue: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'event' | 'user' | 'booking', id: string } | null>(null);

  const getEventId = (ev: any) => ev._id || ev.id;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [eventsRes, usersRes, bookingsRes, statsRes] = await Promise.all([
        api.events.list({ limit: 1000 }),
        api.auth.list(),
        api.bookings.listAll(),
        api.auth.getStats()
      ]);
      setEvents(eventsRes.data || eventsRes || []);
      setUsers(usersRes || []);
      setBookings(bookingsRes || []);
      setStats(statsRes || { events: 0, users: 0, bookings: 0, revenue: 0 });
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveEvent = async (eventId: string) => {
    try {
      const updated: any = await api.events.update(eventId, { status: 'approved', isPublished: true });
      setEvents(events.map(e => getEventId(e) === getEventId(updated) ? updated : e));
      toast.success('Event approved!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve event');
    }
  };

  const handleRejectEvent = async (eventId: string) => {
    try {
      const updated: any = await api.events.update(eventId, { status: 'rejected', isPublished: false });
      setEvents(events.map(e => getEventId(e) === getEventId(updated) ? updated : e));
      toast.success('Event rejected.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject event');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await api.events.remove(eventId);
      setEvents(events.filter(e => getEventId(e) !== eventId));
      setDeleteConfirm(null);
      toast.success('Event deleted.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete event');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await api.auth.remove(userId);
      setUsers(users.filter(u => (u._id || u.id) !== userId));
      setDeleteConfirm(null);
      toast.success('User deleted.');
      api.auth.getStats().then(setStats).catch(() => { });
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      await api.bookings.remove(bookingId);
      setBookings(bookings.filter(b => (b._id || b.id) !== bookingId));
      setDeleteConfirm(null);
      toast.success('Booking deleted.');
      api.auth.getStats().then(setStats).catch(() => { });
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete booking');
    }
  };

  return (
    <DashboardLayout title="Admin Dashboard" subtitle={`Welcome back, ${user?.name}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCardsBase.map((stat, index) => {
          const value =
            stat.key === 'events'
              ? stats.events.toString()
              : stat.key === 'users'
                ? stats.users.toString()
                : stat.key === 'bookings'
                  ? stats.bookings.toString()
                  : `$${stats.revenue.toLocaleString()}`;
          return (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-xl bg-card border border-border"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <p className="text-2xl font-display font-bold text-foreground">{value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          )
        })}
      </div>

      <Tabs defaultValue="events" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="events" className="data-[state=active]:bg-background">
            <Calendar className="w-4 h-4 mr-2" />
            Events
          </TabsTrigger>
          <TabsTrigger value="bookings" className="data-[state=active]:bg-background">
            <Ticket className="w-4 h-4 mr-2" />
            Bookings
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-background">
            <Users className="w-4 h-4 mr-2" />
            Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <div className="rounded-xl border border-border overflow-hidden bg-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-muted-foreground">Event</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Organizer</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={getEventId(event)} className="border-t border-border">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getEventImage(event)}
                            alt={event.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium">{event.title}</p>
                            <p className="text-sm text-muted-foreground capitalize">{event.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {event.organizer?.name || event.organizerName || '—'}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(event.eventDate || event.date).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <Badge className={`
                          ${event.status === 'approved' ? 'status-approved' : ''}
                          ${event.status === 'pending' ? 'status-pending' : ''}
                          ${event.status === 'rejected' ? 'status-rejected' : ''}
                        `}>
                          {event.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          {event.status === 'pending' && (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="text-success hover:text-success hover:bg-success-light"
                                onClick={() => handleApproveEvent(getEventId(event))}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="text-destructive hover:text-destructive hover:bg-destructive-light"
                                onClick={() => handleRejectEvent(getEventId(event))}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-card border-border">
                              <DropdownMenuItem onClick={() => setSelectedEvent(event)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteConfirm({ type: 'event', id: getEventId(event) })}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="bookings">
          <div className="rounded-xl border border-border overflow-hidden bg-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-muted-foreground">Booking ID</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Event</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">User</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Tickets</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => {
                    const bookingId = booking._id || booking.id;
                    const eventTitle = booking.event?.title || 'Unknown Event';
                    const userName = booking.user?.name || 'Unknown User';
                    const userEmail = booking.user?.email || '';
                    return (
                      <tr key={bookingId} className="border-t border-border">
                        <td className="p-4 font-mono text-sm">#{booking.bookingId || (bookingId && bookingId.slice(-6)) || '------'}</td>
                        <td className="p-4">
                          <p className="font-medium text-balance max-w-[200px]">{eventTitle}</p>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{userName}</p>
                            <p className="text-sm text-muted-foreground">{userEmail}</p>
                          </div>
                        </td>
                        <td className="p-4">{booking.numberOfSeats || booking.ticketCount}</td>
                        <td className="p-4 font-medium">${booking.totalAmount}</td>
                        <td className="p-4">
                          <Badge className={`
                            ${booking.status === 'confirmed' ? 'status-approved' : ''}
                            ${booking.status === 'pending' ? 'status-pending' : ''}
                            ${booking.status === 'cancelled' ? 'status-rejected' : ''}
                          `}>
                            {booking.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive-light"
                            onClick={() => setDeleteConfirm({ type: 'booking', id: bookingId })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <div className="rounded-xl border border-border overflow-hidden bg-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-muted-foreground">User</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Email</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Role</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const userId = u._id || u.id;
                    return (
                      <tr key={userId} className="border-t border-border">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-semibold">
                              {u.name.charAt(0)}
                            </div>
                            <span className="font-medium">{u.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">{u.email}</td>
                        <td className="p-4">
                          <Badge variant="outline" className="capitalize">
                            {u.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                            {u.role}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={(u.isActive ?? true) ? 'status-approved' : 'status-rejected'}>
                            {(u.isActive ?? true) ? 'active' : 'inactive'}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-card border-border">
                              <DropdownMenuItem
                                onClick={() => setDeleteConfirm({ type: 'user', id: userId })}
                                className="text-destructive focus:text-destructive"
                                disabled={u.role === 'admin' || userId === user?.id}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <img
                src={getEventImage(selectedEvent)}
                alt={selectedEvent.title}
                className="w-full h-48 object-cover rounded-xl"
              />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Title</p>
                  <p className="font-medium">{selectedEvent.title}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Category</p>
                  <p className="font-medium capitalize">{selectedEvent.category}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date & Time</p>
                  <p className="font-medium">
                    {new Date(selectedEvent.eventDate || selectedEvent.date).toLocaleDateString()} at {selectedEvent.eventTime || selectedEvent.time}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Venue</p>
                  <p className="font-medium">{selectedEvent.location?.venue || selectedEvent.venue || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Organizer</p>
                  <p className="font-medium">{selectedEvent.organizer?.name || selectedEvent.organizerName || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Price</p>
                  <p className="font-medium">${selectedEvent.price}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Address</p>
                  <p className="font-medium text-balance">{selectedEvent.location?.address || '—'}, {selectedEvent.location?.city || ''}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Seats</p>
                  <p className="font-medium">{selectedEvent.availableSeats} / {selectedEvent.totalSeats}</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Description</p>
                <p className="text-sm">{selectedEvent.description}</p>
              </div>
            </div>
          )}
          <DialogFooter className="flex justify-between items-center sm:justify-between w-full">
            {selectedEvent && (
              <Link to={`/event/${getEventId(selectedEvent)}`} target="_blank">
                <Button variant="link" className="px-0 text-accent">
                  View Public Page
                </Button>
              </Link>
            )}
            <Button variant="outline" onClick={() => setSelectedEvent(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete {deleteConfirm?.type.charAt(0).toUpperCase()}{deleteConfirm?.type.slice(1)}
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete this {deleteConfirm?.type}? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteConfirm?.type === 'event') {
                  handleDeleteEvent(deleteConfirm.id);
                } else if (deleteConfirm?.type === 'user') {
                  handleDeleteUser(deleteConfirm.id);
                } else if (deleteConfirm?.type === 'booking') {
                  handleDeleteBooking(deleteConfirm.id);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
