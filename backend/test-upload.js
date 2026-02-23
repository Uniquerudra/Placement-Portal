const axios = require('axios');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const JWT_SECRET = 'supersecretkey';
const token = jwt.sign({ id: '60d0fe4f5311236168a109ca', role: 'student' }, JWT_SECRET);

const form = new FormData();
form.append('fullName', 'Test User');
form.append('email', 'test@example.com');
form.append('phone', '1234567890');

// create a dummy file
fs.writeFileSync('dummy.pdf', 'dummy content');
form.append('resume', fs.createReadStream('dummy.pdf'));

axios.post('http://localhost:5000/api/student/ping', {})
    .then(res => console.log('Ping:', res.data))
    .catch(err => console.log('Ping err:', err.response?.data || err.message));

// we need a valid driveId, since it checks drive: `const drive = await Drive.findById(driveId);`
// let us find a drive ID first, or just use `/api/student/resume/analyze` which does not require a driveId
const formAnalyze = new FormData();
formAnalyze.append('resume', fs.createReadStream('dummy.pdf'));

axios.post('http://localhost:5000/api/student/resume/analyze', formAnalyze, {
    headers: {
        ...formAnalyze.getHeaders(),
        Authorization: `Bearer ${token}`
    }
}).then(res => {
    console.log("Analyze Success:", res.data);
}).catch(err => {
    console.log("Analyze Error:", err.response?.data || err.message);
});
