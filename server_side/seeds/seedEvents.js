const mongoose = require('mongoose');
require('dotenv').config();
const Event = require('../models/Event');

const events = [
  // mapped from frontend mockEvents
  {
    title: 'Tech Summit 2024',
    description: 'Join industry leaders for the biggest tech conference of the year. Featuring keynotes from top CEOs, hands-on workshops, and networking opportunities with thousands of professionals. Learn about AI, blockchain, cloud computing, and the future of technology.',
    shortDescription: 'Biggest tech conference of the year.',
    category: 'tech',
    tags: ['AI','blockchain','cloud'],
    eventDate: new Date('2024-03-15'),
    eventTime: '09:00',
    duration: 480,
    location: { venue: 'Moscone Center', address: '747 Howard St', city: 'San Francisco', state: 'CA', country: 'USA' },
    totalSeats: 500,
    availableSeats: 127,
    price: 299,
    bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    images: [],
    organizer: { _id: mongoose.Types.ObjectId(), name: 'TechEvents Inc.', email: 'organizer@example.com' },
    status: 'approved',
    isFeatured: true,
    isPublished: true
  },
  // add remaining mock events similarly... (for brevity only one seeded here)
];

async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI not set');
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log('Connected to DB, seeding events...');
  try {
    await Event.deleteMany({});
    const created = await Event.insertMany(events);
    console.log('Inserted events:', created.length);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

seed();
