const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./hostel.db');

const feedbacks = [
    {
        student_email: 'student@test.com',
        meal_type: 'Breakfast',
        rating: 4,
        comment: 'Idly was soft, but chutney was spicy.',
        date: '2026-02-12'
    },
    {
        student_email: 'student@test.com',
        meal_type: 'Lunch',
        rating: 5,
        comment: 'Biryani was excellent!',
        date: '2026-02-12'
    },
    {
        student_email: 'student@test.com',
        meal_type: 'Dinner',
        rating: 3,
        comment: 'Chapati was a bit hard.',
        date: '2026-02-11'
    }
];

db.serialize(() => {
    // We need user_id, so let's get it from email
    db.get("SELECT id FROM users WHERE email = 'student@test.com'", (err, row) => {
        if (err || !row) {
            console.log("Student 'student@test.com' not found. Creating one...");
            const bcrypt = require('bcryptjs');
            const hash = bcrypt.hashSync("123", 10);
            db.run("INSERT INTO users (name, email, password, role, hostel_id) VALUES ('John Doe', 'student@test.com', ?, 'student', '101')", [hash], function (err) {
                if (err) console.error(err);
                else {
                    const userId = this.lastID;
                    insertFeedbacks(userId);
                }
            });
        } else {
            insertFeedbacks(row.id);
        }
    });
});

function insertFeedbacks(userId) {
    const stmt = db.prepare("INSERT INTO feedback (user_id, meal_type, rating, comment, date) VALUES (?, ?, ?, ?, ?)");
    feedbacks.forEach(f => {
        stmt.run(userId, f.meal_type, f.rating, f.comment, f.date, (err) => {
            if (err) console.error("Error inserting feedback:", err);
            else console.log(`Added feedback for ${f.meal_type}`);
        });
    });
    stmt.finalize(() => {
        console.log("Feedback seeding completed.");
        db.close();
    });
}
