const axios = require('axios');

(async () => {
  try {
    const register = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'Password123'
    });
    console.log('Register response:', register.status, register.data);
  } catch (err) {
    if (err.response) console.error('Register error:', err.response.status, err.response.data);
    else console.error('Register error:', err.message);
  }

  try {
    const login = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'testuser@example.com',
      password: 'Password123'
    });
    console.log('Login response:', login.status, login.data);
  } catch (err) {
    if (err.response) console.error('Login error:', err.response.status, err.response.data);
    else console.error('Login error:', err.message);
  }
})();