(async () => {
  const base = 'https://online-event-booking-and-management-fycw.onrender.com';
  const headers = { 'Content-Type': 'application/json' };

  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  try {
    // 1) Register (may already exist)
    let res = await fetch(base + '/api/auth/register', { method: 'POST', headers, body: JSON.stringify({ name: 'E2E User', email: 'e2euser@example.com', password: 'E2EPass123' }) });
    let data = await res.json().catch(()=>null);
    console.log('register', res.status, data);
  } catch (e) { console.error('register err', e.message); }

  // login
  let token;
  try {
    let res = await fetch(base + '/api/auth/login', { method: 'POST', headers, body: JSON.stringify({ email: 'e2euser@example.com', password: 'E2EPass123' }) });
    let data = await res.json().catch(()=>null);
    console.log('login', res.status, data);
    token = data?.token;
  } catch (e) { console.error('login err', e.message); }

  // If login failed, try request-reset and reset flow
  if (!token) {
    try {
      let r1 = await fetch(base + '/api/auth/request-reset', { method: 'POST', headers, body: JSON.stringify({ email: 'e2euser@example.com' }) });
      let d1 = await r1.json().catch(()=>null);
      console.log('request-reset', r1.status, d1);
      const resetToken = d1?.token;
      if (resetToken) {
        let r2 = await fetch(base + '/api/auth/reset/' + resetToken, { method: 'POST', headers, body: JSON.stringify({ password: 'E2ENewPass123' }) });
        let d2 = await r2.json().catch(()=>null);
        console.log('reset', r2.status, d2);
        token = d2?.token;
      }
    } catch (e) { console.error('reset flow err', e.message); }
  }

  if (!token) return console.error('No token available, aborting further tests');

  const authHeaders = { ...headers, Authorization: 'Bearer ' + token };

  // Events: list
  try {
    let r = await fetch(base + '/api/events');
    console.log('GET /api/events', r.status, await r.text());
  } catch (e) { console.error('events list err', e.message); }

  // Create event (may require organizer but controller permits)
  let createdEventId;
  try {
    const ev = { title: 'E2E Event', description: 'desc', totalSeats: 100, availableSeats: 100, price: 10, eventDate: new Date().toISOString(), location: { venue: 'Test Hall' } };
    let r = await fetch(base + '/api/events', { method: 'POST', headers: authHeaders, body: JSON.stringify(ev) });
    let d = await r.json().catch(()=>null);
    console.log('POST /api/events', r.status, d);
    createdEventId = d?._id;
  } catch (e) { console.error('create event err', e.message); }

  if (createdEventId) {
    // Get event
    try {
      let r = await fetch(base + '/api/events/' + createdEventId);
      console.log('GET /api/events/:id', r.status, await r.text());
    } catch (e) { console.error('get event err', e.message); }

    // Update event
    try {
      let r = await fetch(base + '/api/events/' + createdEventId, { method: 'PUT', headers: authHeaders, body: JSON.stringify({ title: 'E2E Event Updated' }) });
      console.log('PUT /api/events/:id', r.status, await r.text());
    } catch (e) { console.error('update event err', e.message); }
  }

  // Bookings: create booking for created event
  let bookingId;
  if (createdEventId) {
    try {
      let r = await fetch(base + '/api/bookings', { method: 'POST', headers: authHeaders, body: JSON.stringify({ eventId: createdEventId, numberOfSeats: 1 }) });
      let d = await r.json().catch(()=>null);
      console.log('POST /api/bookings', r.status, d);
      bookingId = d?._id;
    } catch (e) { console.error('create booking err', e.message); }
  }

  // User profile
  try {
    let r = await fetch(base + '/api/users/me', { headers: authHeaders });
    console.log('GET /api/users/me', r.status, await r.text());
  } catch (e) { console.error('get profile err', e.message); }

  // User bookings
  try {
    let r = await fetch(base + '/api/bookings/me', { headers: authHeaders });
    console.log('GET /api/bookings/me', r.status, await r.text());
  } catch (e) { console.error('get bookings err', e.message); }

  // Cancel booking if created
  if (bookingId) {
    try {
      let r = await fetch(base + '/api/bookings/' + bookingId + '/cancel', { method: 'POST', headers: authHeaders });
      console.log('POST /api/bookings/:id/cancel', r.status, await r.text());
    } catch (e) { console.error('cancel booking err', e.message); }
  }

  // Cleanup: delete event if created
  if (createdEventId) {
    try {
      let r = await fetch(base + '/api/events/' + createdEventId, { method: 'DELETE', headers: authHeaders });
      console.log('DELETE /api/events/:id', r.status, await r.text());
    } catch (e) { console.error('delete event err', e.message); }
  }

})();
