(async () => {
  const base = 'http://localhost:5000/api/auth';
  try {
    const regRes = await fetch(base + '/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', email: 'testuser@example.com', password: 'Password123' })
    });
    const regData = await regRes.text();
    console.log('Register:', regRes.status, regData);
  } catch (e) {
    console.error('Register error:', e.message);
  }

  try {
    const loginRes = await fetch(base + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'testuser@example.com', password: 'Password123' })
    });
    const loginData = await loginRes.text();
    console.log('Login:', loginRes.status, loginData);
  } catch (e) {
    console.error('Login error:', e.message);
  }
})();
