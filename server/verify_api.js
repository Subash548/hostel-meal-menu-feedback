async function testFeedbackAPI() {
    try {
        console.log("Logging in as Admin...");
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@hostel.com',
                password: 'admin123'
            })
        });

        if (!loginRes.ok) {
            console.error("Login failed:", await loginRes.text());
            return;
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log("Login successful. Token obtained.");

        console.log("Fetching Feedback...");
        const feedbackRes = await fetch('http://localhost:5000/api/feedback', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!feedbackRes.ok) {
            console.error("Feedback fetch failed:", await feedbackRes.text());
            return;
        }

        const feedbackData = await feedbackRes.json();
        console.log("Feedback Response Data:");
        console.log(JSON.stringify(feedbackData, null, 2));

    } catch (error) {
        console.error("Error:", error);
    }
}

testFeedbackAPI();
