const axios = require('axios');

async function checkServer() {
    try {
        console.log("Logging in as admin...");
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@hostel.com',
            password: 'admin123'
        });
        const token = loginRes.data.token;

        console.log("Fetching students...");
        const studentsRes = await axios.get('http://localhost:5000/api/admin/users', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const students = studentsRes.data.filter(u => u.role === 'student');
        console.log("Students:", students.map(s => ({
            name: s.name, 
            email: s.email, 
            allergies: s.allergies, 
            customAllergies: s.customAllergies, 
            prefs: s.notificationPrefs
        })));

    } catch (e) {
        console.error("Error:", e.response ? e.response.data : e.message);
    }
}
checkServer();
