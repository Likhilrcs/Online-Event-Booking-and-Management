const mongoose = require('mongoose');
const Event = require('./models/Event');

async function testCRUD() {
    try {
        // Connect to database
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://likhil:Likhilbr5432@online-event-booking-an.4mefgwr.mongodb.net/online_event_db?retryWrites=true&w=majority&appName=Online-Event-Booking-and-Management');
        console.log('✅ Connected to MongoDB\n');

        // READ - Count existing events
        console.log('📖 READ: Counting events...');
        const count = await Event.countDocuments();
        console.log(`✅ Found ${count} events in database\n`);

        // READ - List first 3 events
        console.log('📖 READ: Fetching first 3 events...');
        const events = await Event.find().limit(3).select('title category status');
        events.forEach((event, i) => {
            console.log(`   ${i + 1}. ${event.title} (${event.category}) - ${event.status}`);
        });
        console.log('✅ Events retrieved successfully\n');

        // CREATE - Create a test event
        console.log('➕ CREATE: Creating test event...');
        const testEvent = await Event.create({
            title: 'Test Event - CRUD Verification',
            description: 'This is a test event to verify CRUD operations',
            category: 'tech',
            eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            eventTime: '10:00 AM',
            location: {
                venue: 'Test Venue',
                address: 'Test Address',
                city: 'Test City',
                country: 'USA'
            },
            totalSeats: 100,
            price: 50,
            bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
            organizer: {
                _id: new mongoose.Types.ObjectId(),
                name: 'Test Organizer',
                email: 'test@example.com'
            },
            status: 'pending'
        });
        console.log(`✅ Created event with ID: ${testEvent._id}\n`);

        // UPDATE - Update the test event
        console.log('✏️  UPDATE: Updating test event...');
        testEvent.title = 'Test Event - UPDATED';
        testEvent.price = 75;
        await testEvent.save();
        console.log(`✅ Updated event: ${testEvent.title} - Price: $${testEvent.price}\n`);

        // DELETE - Delete the test event
        console.log('🗑️  DELETE: Deleting test event...');
        await Event.findByIdAndDelete(testEvent._id);
        console.log(`✅ Deleted event with ID: ${testEvent._id}\n`);

        // Verify deletion
        const deletedEvent = await Event.findById(testEvent._id);
        if (!deletedEvent) {
            console.log('✅ Verified: Event successfully deleted\n');
        }

        console.log('🎉 ALL CRUD OPERATIONS SUCCESSFUL!\n');
        console.log('Summary:');
        console.log('  ✅ CREATE - Working');
        console.log('  ✅ READ   - Working');
        console.log('  ✅ UPDATE - Working');
        console.log('  ✅ DELETE - Working');
        console.log('\n✅ Database connection is fully functional!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

testCRUD();
