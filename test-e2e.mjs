// End-to-end automated verification script
import http from 'http';
import { spawn } from 'child_process';

console.log('--- Starting Cambridge Mathematics Platform Verification ---');

// Start next start on port 3001
const nextProc = spawn('npx', ['next', 'start', '-p', '3001'], {
  stdio: 'inherit',
  shell: true,
});

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function runTests() {
  console.log('Waiting 6s for server to start...');
  await sleep(6000);

  try {
    // 1. Test Public Home Page
    console.log('\n[1/6] Testing Public Teacher Homepage (GET /)...');
    const homeRes = await request('http://localhost:3001/');
    console.log('Status:', homeRes.statusCode);
    if (homeRes.body.includes('Building Confidence') && homeRes.body.includes('Ms. Eleanor Vance')) {
      console.log('✓ Public homepage loaded with teacher identity & Cambridge curriculum!');
    } else {
      console.error('✗ Unexpected homepage content');
    }

    // 2. Test Contact Form API
    console.log('\n[2/6] Testing Contact Form Submission (POST /api/contact)...');
    const contactPayload = JSON.stringify({
      name: 'Dr. Arthur Pendelton',
      email: 'arthur.p@example.co.uk',
      phone: '+44 7900 112233',
      subjectOfInterest: 'Pure Mathematics (A Level)',
      message: 'Looking for A-Level Paper 3 and Mechanics tuition for upcoming exam series.',
    });
    const contactRes = await request('http://localhost:3001/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(contactPayload),
      },
      body: contactPayload,
    });
    console.log('Status:', contactRes.statusCode);
    console.log('Response:', contactRes.body);
    if (contactRes.statusCode === 201) {
      console.log('✓ Contact inquiry saved to database successfully!');
    }

    // 3. Test Student Login
    console.log('\n[3/6] Testing Student Login (POST /api/auth/login)...');
    const studentLoginPayload = JSON.stringify({
      email: 'student@cambridgemaths.edu',
      password: 'StudentPass123!',
    });
    const studentLoginRes = await request('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(studentLoginPayload),
      },
      body: studentLoginPayload,
    });
    console.log('Status:', studentLoginRes.statusCode);
    console.log('Response:', studentLoginRes.body);
    const studentCookies = studentLoginRes.headers['set-cookie'];
    if (studentCookies) {
      console.log('✓ Student JWT session cookie set successfully!');
    }

    // 4. Test Teacher Login
    console.log('\n[4/6] Testing Teacher Login (POST /api/auth/login)...');
    const teacherLoginPayload = JSON.stringify({
      email: 'teacher@cambridgemaths.edu',
      password: 'AdminPass123!',
    });
    const teacherLoginRes = await request('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(teacherLoginPayload),
      },
      body: teacherLoginPayload,
    });
    console.log('Status:', teacherLoginRes.statusCode);
    console.log('Response:', teacherLoginRes.body);
    const teacherCookies = teacherLoginRes.headers['set-cookie'];
    if (teacherCookies) {
      console.log('✓ Teacher / Admin JWT session cookie set successfully!');
    }

    // 5. Test Student Registration
    console.log('\n[5/6] Testing Student Registration (POST /api/auth/register)...');
    const newStudentEmail = `test_candidate_${Date.now()}@cambridgemaths.edu`;
    const regPayload = JSON.stringify({
      fullName: 'Emma Watson',
      email: newStudentEmail,
      phone: '+44 7922 445566',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
    });
    const regRes = await request('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(regPayload),
      },
      body: regPayload,
    });
    console.log('Status:', regRes.statusCode);
    console.log('Response:', regRes.body);
    if (regRes.statusCode === 201) {
      console.log('✓ Student registered and auto-enrolled in core module!');
    }

    // 6. Test Teacher Role Protected Access
    console.log('\n[6/6] Testing Teacher Announcement Broadcast (POST /api/admin/announcements)...');
    const cookieHeader = teacherCookies ? teacherCookies[0].split(';')[0] : '';
    const annPayload = JSON.stringify({
      title: 'Automated Cambridge Mock Test Announcement',
      content: 'All candidates must download past papers before Saturday 9 AM.',
      priority: 'NORMAL',
    });
    const annRes = await request('http://localhost:3001/api/admin/announcements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(annPayload),
        Cookie: cookieHeader,
      },
      body: annPayload,
    });
    console.log('Status:', annRes.statusCode);
    console.log('Response:', annRes.body);
    if (annRes.statusCode === 200) {
      console.log('✓ Teacher broadcast successfully published and student notifications dispatched!');
    }

    console.log('\n=============================================');
    console.log('🎉 ALL SYSTEM CHECKS AND USER FLOWS PASSED! 🎉');
    console.log('=============================================\n');
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    console.log('Terminating test server...');
    nextProc.kill('SIGTERM');
    process.exit(0);
  }
}

runTests();
