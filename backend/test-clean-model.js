// Test cleaned up user model
import http from 'http';

const makeRequest = (options, data) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
};

const testCleanModel = async () => {
  try {
    // Register user
    const registerResult = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/users/register', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      name: 'Clean Model Test',
      email: `cleantest${Date.now()}@example.com`,
      password: 'password123'
    });

    console.log('✅ User registered with clean model');
    const token = registerResult.data.token;

    // Get profile to see clean structure
    const profileResult = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/users/profile', method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('Profile structure:');
    console.log(JSON.stringify(profileResult.data, null, 2));

    // Join hackathon
    const joinResult = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/team/join', method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }, {
      hackathonId: '690af4d01fe69883b23f515c',
      teamName: 'Clean Test Team',
      projectName: 'Clean Test Project'
    });

    console.log('✅ Successfully joined hackathon with clean model');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
};

testCleanModel();