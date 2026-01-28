const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Category = require('../models/Category');
const shortid = require('shortid');

const mockEvents = [
  {
    id: '1',
    title: 'Tech Summit 2024',
    description: 'Join industry leaders for the biggest tech conference of the year. Featuring keynotes from top CEOs, hands-on workshops, and networking opportunities with thousands of professionals. Learn about AI, blockchain, cloud computing, and the future of technology.',
    date: '2024-03-15',
    time: '09:00 AM',
    location: 'San Francisco, CA',
    venue: 'Moscone Center',
    price: 299,
    totalSeats: 500,
    availableSeats: 127,
    category: 'tech',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    organizerId: '2',
    organizerName: 'TechEvents Inc.',
    status: 'approved',
    featured: true
  },
  {
    id: '2',
    title: 'Summer Music Festival',
    description: 'A three-day outdoor music festival featuring top artists from around the world. Experience amazing live performances, food trucks, art installations, and unforgettable memories under the stars.',
    date: '2024-06-20',
    time: '04:00 PM',
    location: 'Austin, TX',
    venue: 'Zilker Park',
    price: 150,
    totalSeats: 2000,
    availableSeats: 847,
    category: 'music',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80',
    organizerId: '2',
    organizerName: 'Festival Productions',
    status: 'approved',
    featured: true
  },
  {
    id: '3',
    title: 'Startup Pitch Night',
    description: 'Watch 10 promising startups pitch to top VCs and angel investors. Network with founders, investors, and industry experts. Free food and drinks included!',
    date: '2024-02-28',
    time: '06:30 PM',
    location: 'New York, NY',
    venue: 'WeWork Bryant Park',
    price: 25,
    totalSeats: 150,
    availableSeats: 42,
    category: 'business',
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80',
    organizerId: '2',
    organizerName: 'Startup NYC',
    status: 'approved'
  },
  {
    id: '4',
    title: 'Food & Wine Experience',
    description: 'Indulge in a culinary journey featuring award-winning chefs, premium wine tastings, and gourmet food pairings. An unforgettable experience for food enthusiasts.',
    date: '2024-04-12',
    time: '07:00 PM',
    location: 'Napa Valley, CA',
    venue: 'Silverado Resort',
    price: 175,
    totalSeats: 200,
    availableSeats: 0,
    category: 'food',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80',
    organizerId: '2',
    organizerName: 'Gourmet Events',
    status: 'approved'
  },
  {
    id: '5',
    title: 'Marathon Championship',
    description: 'Join thousands of runners in the annual city marathon. Categories for all skill levels, from beginners to elite athletes. Medal, t-shirt, and refreshments included.',
    date: '2024-05-05',
    time: '06:00 AM',
    location: 'Chicago, IL',
    venue: 'Grant Park',
    price: 85,
    totalSeats: 5000,
    availableSeats: 2341,
    category: 'sports',
    image: 'https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?w=800&q=80',
    organizerId: '2',
    organizerName: 'City Sports Events',
    status: 'approved'
  },
  {
    id: '6',
    title: 'Art Gallery Opening',
    description: "Exclusive opening night of the new contemporary art exhibition. Meet the artists, enjoy champagne and hors d'oeuvres, and be among the first to experience this stunning collection.",
    date: '2024-03-22',
    time: '07:00 PM',
    location: 'Los Angeles, CA',
    venue: 'The Broad Museum',
    price: 50,
    totalSeats: 300,
    availableSeats: 89,
    category: 'arts',
    image: 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=800&q=80',
    organizerId: '2',
    organizerName: 'LA Arts Foundation',
    status: 'pending'
  },
  {
    id: '7',
    title: 'AI & Machine Learning Workshop',
    description: 'Hands-on workshop covering the latest in AI and ML. Build your first neural network, learn about GPT models, and understand real-world applications. Laptops required.',
    date: '2024-04-08',
    time: '10:00 AM',
    location: 'Seattle, WA',
    venue: 'Amazon Campus',
    price: 199,
    totalSeats: 100,
    availableSeats: 23,
    category: 'tech',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80',
    organizerId: '2',
    organizerName: 'AI Academy',
    status: 'approved'
  },
  {
    id: '8',
    title: 'Jazz Night Under the Stars',
    description: 'An evening of smooth jazz featuring renowned artists. Bring your blankets and picnic baskets for a magical night of music in the beautiful outdoor amphitheater.',
    date: '2024-07-14',
    time: '08:00 PM',
    location: 'Denver, CO',
    venue: 'Red Rocks Amphitheatre',
    price: 75,
    totalSeats: 1000,
    availableSeats: 456,
    category: 'music',
    image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80',
    organizerId: '2',
    organizerName: 'Denver Jazz Society',
    status: 'approved'
  }
];

const mockBookings = [
  {
    id: '1',
    eventId: '1',
    userId: '3',
    userName: 'Jane User',
    userEmail: 'user@eventify.com',
    ticketCount: 2,
    totalAmount: 598,
    status: 'confirmed',
    bookedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    eventId: '2',
    userId: '3',
    userName: 'Jane User',
    userEmail: 'user@eventify.com',
    ticketCount: 1,
    totalAmount: 150,
    status: 'confirmed',
    bookedAt: '2024-01-18T14:20:00Z'
  },
  {
    id: '3',
    eventId: '3',
    userId: '4',
    userName: 'Mike Smith',
    userEmail: 'mike@example.com',
    ticketCount: 3,
    totalAmount: 75,
    status: 'pending',
    bookedAt: '2024-01-20T09:15:00Z'
  }
];

async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI not set');
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log('Connected to DB, seeding data...');

  try {
    await Promise.all([
      User.deleteMany({}),
      Event.deleteMany({}),
      Booking.deleteMany({}),
      Category.deleteMany({})
    ]);

    // create users (pre-save hook will hash passwords)
    const users = await User.create([
      { name: 'Admin User', email: 'admin@example.com', password: 'password123', role: 'admin', phone: '0000000000' },
      { name: 'Organizer One', email: 'organizer@example.com', password: 'password123', role: 'organizer', phone: '1112223333' },
      { name: 'Jane User', email: 'user@example.com', password: 'password123', role: 'user', phone: '4445556666' }
    ]);

    // create categories
    const cats = await Category.insertMany([
      { name: 'Tech', slug: 'tech' },
      { name: 'Music', slug: 'music' },
      { name: 'Business', slug: 'business' },
    ]);

    // create events with organizer reference
    const eventsToCreate = mockEvents.map((e) => {
      // parse location into structured object
      const parts = (e.location || '').split(',').map(s => s.trim());
      const city = parts[0] || '';
      const state = parts[1] || '';
      const location = {
        venue: e.venue || city || 'Unknown Venue',
        address: e.location || '',
        city: city || 'Unknown City',
        state: state || '',
        country: 'USA'
      };

      const eventDate = e.date ? new Date(e.date) : new Date();

      return {
        title: e.title,
        description: e.description,
        shortDescription: e.description?.slice(0, 280),
        category: (e.category || 'general').toLowerCase(),
        tags: e.tags || [],
        eventDate,
        eventTime: e.time || '00:00',
        duration: e.duration || null,
        location,
        totalSeats: e.totalSeats || 100,
        availableSeats: typeof e.availableSeats === 'number' ? e.availableSeats : (e.totalSeats || 100),
        price: e.price || 0,
        currency: e.currency || 'USD',
        bannerImage: e.image || e.bannerImage || '',
        images: e.images ? e.images.slice(0,5) : (e.image ? [e.image] : []),
        organizer: { _id: users[1]._id, name: users[1].name, email: users[1].email },
        status: e.status || 'pending',
        isFeatured: !!e.featured,
        isPublished: e.status === 'approved'
      };
    });

    const createdEvents = await Event.insertMany(eventsToCreate);

    // create some bookings
    const booking1 = await Booking.create({
      bookingId: `BK-${shortid.generate()}`,
      user: { _id: users[2]._id, name: users[2].name, email: users[2].email, phone: users[2].phone },
      event: { _id: createdEvents[0]._id, title: createdEvents[0].title, eventDate: createdEvents[0].eventDate, location: createdEvents[0].location.venue, bannerImage: createdEvents[0].bannerImage },
      numberOfSeats: 2,
      pricePerSeat: createdEvents[0].price,
      totalAmount: 2 * createdEvents[0].price,
      payment: { method: 'stripe', status: 'completed' },
      status: 'confirmed',
      ticketCode: `T-${shortid.generate()}`
    });

    console.log('Seed completed');
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

seed();
