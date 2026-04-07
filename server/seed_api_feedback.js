const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const feedbacks = [
    {
        meal_type: 'Breakfast',
        rating: 4,
        comment: 'Idly was soft, but chutney was spicy.'
    },
    {
        meal_type: 'Lunch',
        rating: 5,
        comment: 'Biryani was excellent!'
    },
    {
        meal_type: 'Dinner',
        rating: 3,
        comment: 'Chapati was a bit hard.'
    },
    {
        meal_type: 'Snacks',
        rating: 5,
        comment: 'Samosa was really good and crispy.'
    }
];

async function seedFeedbacks() {
    try {
        console.log('Registering student...');
        const studentData = {
            name: 'Feedback Tester',
            email: 'feedbacktester@test.com',
            password: 'password123',
            hostel_id: 'H101',
            roomNumber: '101',
            phone: '1234567890'
        };

        try {
            await axios.post(`${BASE_URL}/auth/register`, studentData);
            console.log('Student registered.');
        } catch (e) {
            if (e.response && e.response.data.error === 'Email already exists') {
                console.log('Student already exists, proceeding to login...');
            } else {
                throw e;
            }
        }

        console.log('Logging in...');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'feedbacktester@test.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('Logged in successfully. Got token.');

        console.log('Submitting feedbacks...');
        for (const fb of feedbacks) {
            await axios.post(`${BASE_URL}/feedback`, fb, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log(`Submitted feedback for ${fb.meal_type}`);
        }

        console.log('Successfully seeded all feedbacks!');
    } catch (err) {
        console.error('Error seeding feedback:', err.response ? err.response.data : err.message);
    }
}

seedFeedbacks();
