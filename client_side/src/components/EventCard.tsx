import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import { getCategoryColor } from '@/data/mockEvents';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatLocation, getEventImage } from '@/lib/utils';

interface EventCardProps {
  // Accept events coming either from mock data or backend API
  event: any;
  index?: number;
}

export function EventCard({ event, index = 0 }: EventCardProps) {
  const isSoldOut = event.availableSeats === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="event-card group"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={getEventImage(event)}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <Badge className={`${getCategoryColor(event.category)} border-0 font-medium capitalize`}>
            {event.category}
          </Badge>
        </div>

        {/* Sold Out Badge */}
        {isSoldOut && (
          <div className="absolute top-4 right-4">
            <Badge variant="destructive" className="font-semibold">
              Sold Out
            </Badge>
          </div>
        )}

        {/* Price */}
        <div className="absolute bottom-4 right-4">
          <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <span className="font-display font-bold text-foreground">
              ${event.price}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground line-clamp-1 group-hover:text-accent transition-colors">
            {event.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {event.description}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 text-accent" />
            <span>{new Date(event.eventDate || event.date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            })} • {event.eventTime || event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 text-accent" />
            <span className="line-clamp-1">
              {formatLocation(event.location)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4 text-accent" />
            <span>{event.availableSeats} seats left</span>
          </div>
        </div>

        <Link to={`/event/${event._id || event.id}`}>
          <Button
            className="w-full group/btn bg-primary hover:bg-primary/90"
            disabled={isSoldOut}
          >
            {isSoldOut ? 'Sold Out' : 'View Details'}
            {!isSoldOut && (
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
            )}
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
