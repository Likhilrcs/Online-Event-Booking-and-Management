import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Event } from '@/data/mockEvents';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { EmptyState } from '@/components/EmptyState';
import { getEventImage } from '@/lib/utils';
import api from '@/lib/api';

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [stats, setStats] = useState({ bookings: 0, revenue: 0 });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    venue: '',
    price: '',
    totalSeats: '',
    category: 'tech' as Event['category'],
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      venue: '',
      price: '',
      totalSeats: '',
      category: 'tech',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'
    });
  };

  const getEventId = (ev: any) => ev._id || ev.id;

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);

    const fetchDashData = async () => {
      try {
        const eventsRes: any = await api.events.list({ organizerId: user.id, limit: 100 });
        const myEvents = eventsRes.data || eventsRes || [];
        setEvents(myEvents);

        const totalBookings = myEvents.reduce((sum: number, e: any) => sum + (e.bookedSeats || 0), 0);
        const totalRevenue = myEvents.reduce((sum: number, e: any) => sum + (e.stats?.totalRevenue || 0), 0);
        setStats({ bookings: totalBookings, revenue: totalRevenue });
      } catch (err) {
        toast.error('Failed to load your events');
      } finally {
        setLoading(false);
      }
    };

    fetchDashData();
  }, [user?.id]);

  const handleCreateEvent = async () => {
    try {
      if (!formData.title || !formData.description || !formData.date || !formData.time || !formData.venue || !formData.location) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (formData.title.length < 5) {
        toast.error('Title must be at least 5 characters');
        return;
      }

      if (formData.description.length < 20) {
        toast.error('Description must be at least 20 characters');
        return;
      }

      const totalSeats = Number(formData.totalSeats);
      if (isNaN(totalSeats) || totalSeats < 1) {
        toast.error('Total seats must be at least 1');
        return;
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        eventDate: formData.date,
        eventTime: formData.time,
        location: {
          venue: formData.venue,
          address: formData.location,
          city: formData.location,
          country: 'USA',
        },
        totalSeats: totalSeats,
        availableSeats: totalSeats,
        price: Number(formData.price) || 0,
        bannerImage: formData.image,
      };
      const created: any = await api.events.create(payload);
      setEvents([created, ...events]);
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success('Event created! Pending admin approval.');
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to create event';
      toast.error(msg);
    }
  };

  const handleEditEvent = async () => {
    if (!editingEvent) return;
    try {
      const totalSeats = Number(formData.totalSeats);
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        eventDate: formData.date,
        eventTime: formData.time,
        location: {
          venue: formData.venue,
          address: formData.location,
          city: formData.location,
          country: 'USA',
        },
        totalSeats: totalSeats,
        price: Number(formData.price) || 0,
        bannerImage: formData.image,
      };
      const updated: any = await api.events.update(getEventId(editingEvent), payload);
      setEvents(events.map(e => getEventId(e) === getEventId(updated) ? updated : e));
      setEditingEvent(null);
      resetForm();
      toast.success('Event updated successfully!');
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to update event';
      toast.error(msg);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await api.events.remove(id);
      setEvents(events.filter(e => getEventId(e) !== id));
      setDeleteConfirmId(null);
      toast.success('Event deleted.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete event');
    }
  };

  const openEditDialog = (event: any) => {
    const dateStr = event.eventDate ? new Date(event.eventDate).toISOString().split('T')[0] : '';
    setFormData({
      title: event.title,
      description: event.description,
      date: dateStr,
      time: event.eventTime || event.time || '',
      location: event.location?.address || event.location || '',
      venue: event.location?.venue || event.venue || '',
      price: (event.price || 0).toString(),
      totalSeats: (event.totalSeats || 0).toString(),
      category: event.category || 'tech',
      image: event.bannerImage || event.image || ''
    });
    setEditingEvent(event);
  };

  return (
    <DashboardLayout title="Organizer Dashboard" subtitle={`Welcome back, ${user?.name}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Events', value: events.length.toString(), icon: Calendar, color: 'bg-accent/10 text-accent' },
          { label: 'Total Bookings', value: stats.bookings.toString(), icon: Users, color: 'bg-event-teal-light text-event-teal' },
          { label: 'Revenue', value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'bg-success-light text-success' },
          { label: 'Active Events', value: events.filter(e => e.status === 'approved').length.toString(), icon: TrendingUp, color: 'bg-event-purple-light text-event-purple' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
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
            <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">My Events</h2>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent/90">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Event Title</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Tech Summit 2024"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) => setFormData({ ...formData, category: v as Event['category'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tech">Tech</SelectItem>
                        <SelectItem value="music">Music</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="arts">Arts</SelectItem>
                        <SelectItem value="food">Food</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your event..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      placeholder="09:00 AM"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Venue</Label>
                    <Input
                      value={formData.venue}
                      onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                      placeholder="Moscone Center"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location (Address/City)</Label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="San Francisco, CA"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price ($)</Label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="99"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Seats</Label>
                    <Input
                      type="number"
                      value={formData.totalSeats}
                      onChange={(e) => setFormData({ ...formData, totalSeats: e.target.value })}
                      placeholder="500"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Image URL</Label>
                  <Input
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateEvent} className="bg-accent hover:bg-accent/90">Create Event</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="py-12 text-center text-muted-foreground">
            Loading your events...
          </div>
        ) : events.length > 0 ? (
          <div className="rounded-xl border border-border overflow-hidden bg-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-muted-foreground">Event</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Bookings</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Revenue</th>
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
                      <td className="p-4 text-muted-foreground">{event.bookedSeats || 0}</td>
                      <td className="p-4 font-medium">${event.stats?.totalRevenue || 0}</td>
                      <td className="p-4 text-right">
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
                            <DropdownMenuItem onClick={() => openEditDialog(event)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteConfirmId(getEventId(event))}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Calendar}
            title="No events yet"
            description="Create your first event to get started."
            actionLabel="Create Event"
            onAction={() => setIsCreateDialogOpen(true)}
          />
        )}
      </div>

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
                <div>
                  <p className="text-muted-foreground">Booked Seats</p>
                  <p className="font-medium">{selectedEvent.bookedSeats || 0}</p>
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

      <Dialog open={!!editingEvent} onOpenChange={() => { setEditingEvent(null); resetForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Event Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v as Event['category'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tech">Tech</SelectItem>
                    <SelectItem value="music">Music</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="arts">Arts</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Total Seats</Label>
                <Input
                  type="number"
                  value={formData.totalSeats}
                  onChange={(e) => setFormData({ ...formData, totalSeats: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditingEvent(null); resetForm(); }}>Cancel</Button>
            <Button onClick={handleEditEvent} className="bg-accent hover:bg-accent/90">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete this event? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDeleteEvent(deleteConfirmId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
