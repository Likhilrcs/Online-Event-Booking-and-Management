// Simple test to verify frontend can connect to backend
import axios from 'axios';

const API_URL = 'https://online-event-booking-and-management-fycw.onrender.com';

async function testConnection() {
    console.log('🔍 Testing Frontend → Backend Connection...\n');

    try {
        // Test 1: Backend health check
        console.log('1️⃣ Testing backend health...');
        const health = await axios.get(`${API_URL}/`);
        console.log('✅ Backend is running:', health.data);

        // Test 2: Get events (no auth required)
        console.log('\n2️⃣ Testing GET /api/events...');
        const events = await axios.get(`${API_URL}/api/events`);
        console.log(`✅ Received ${events.data.length} events`);
        if (events.data.length > 0) {
            console.log('   First event:', events.data[0].title);
        }

        // Test 3: Register a test user
        console.log('\n3️⃣ Testing POST /api/auth/register...');
        const testUser = {
            name: 'Test User ' + Date.now(),
            email: `test${Date.now()}@example.com`,
            password: 'Test123456',
            role: 'user'
        };

        const registerRes = await axios.post(`${API_URL}/api/auth/register`, testUser);
        console.log('✅ User registered successfully');
        console.log('   Token received:', registerRes.data.token ? 'Yes' : 'No');

        // Test 4: Create an event with auth
        if (registerRes.data.token) {
            console.log('\n4️⃣ Testing POST /api/events (with auth)...');
            const newEvent = {
                title: 'Test Event ' + Date.now(),
                description: 'Test event from connection test',
                category: 'tech',
                eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                eventTime: '10:00 AM',
                location: {
                    venue: 'Test Venue',
                    address: 'Test Address',
                    city: 'Test City',
                    country: 'USA'
                },
                totalSeats: 100,
                price: 50,
                bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'
            };

            const createRes = await axios.post(`${API_URL}/api/events`, newEvent, {
                headers: {
                    Authorization: `Bearer ${registerRes.data.token}`
                }
            });
            console.log('✅ Event created:', createRes.data.title);
            console.log('   Event ID:', createRes.data._id);

            // Test 5: Delete the test event
            console.log('\n5️⃣ Testing DELETE /api/events/:id...');
            await axios.delete(`${API_URL}/api/events/${createRes.data._id}`, {
                headers: {
                    Authorization: `Bearer ${registerRes.data.token}`
                }
            });
            console.log('✅ Event deleted successfully');
        }

        console.log('\n🎉 ALL TESTS PASSED!');
        console.log('\n✅ Frontend ↔ Backend connection is working perfectly!');

    } catch (error) {
        console.error('\n❌ Connection test failed:');
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Message:', error.response.data);
        } else if (error.request) {
            console.error('   No response from server');
            console.error('   Make sure backend is running on port 5000');
        } else {
            console.error('   Error:', error.message);
        }
    }
}

testConnection();
