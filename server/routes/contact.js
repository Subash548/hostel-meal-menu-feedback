const express = require('express');
const router = express.Router();
const { sendEmail } = require('../services/notifications');

router.post('/', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Validation
        if (!name || !email || !message) {
            return res.status(400).json({ error: "Name, email, and message are required." });
        }

        // The admin email should be gathered from environment variable, or fallback to a dummy for testing
        const adminEmail = process.env.ADMIN_EMAIL || "admin@hostel.com";

        // 1. Send Email to Admin
        const adminSubject = `New Contact Request from ${name}`;
        const adminText = `You have received a new message from ${name} (${email}):\n\n${message}`;
        const adminHtml = `
            <h2>New Contact Support Message</h2>
            <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
            <p><strong>Message:</strong></p>
            <blockquote style="border-left: 4px solid #ccc; padding-left: 10px; color: #555;">
                ${message}
            </blockquote>
        `;
        const adminSent = await sendEmail(adminEmail, adminSubject, adminText, adminHtml);

        if (!adminSent) {
            console.warn("Failed to send admin notification email. Check SMTP credentials.");
        }

        // 2. Send Confirmation Email to User
        const userSubject = `We received your message, ${name}!`;
        const userText = `Hi ${name},\n\nThank you for reaching out! We have received your message and will get back to you shortly.\n\nYour Message:\n${message}\n\nThanks,\nHostelFresh Team`;
        const userHtml = `
            <h2>Thank You for Contacting Us, ${name}!</h2>
            <p>We wanted to let you know that we've received your message and our team will review it shortly! Please allow us 1-2 business days to get back to you.</p>
            <p><strong>Here's what you sent us:</strong></p>
            <blockquote style="border-left: 4px solid #06b6d4; padding-left: 10px; background-color: #f1f5f9; padding: 10px; border-radius: 4px;">
                ${message}
            </blockquote>
            <br/>
            <p>Best regards,<br/>The HostelFresh Admins</p>
        `;
        const userSent = await sendEmail(email, userSubject, userText, userHtml);

        res.status(200).json({ message: "Your message has been sent successfully!" });

    } catch (err) {
        console.error("Error in contact route:", err);
        res.status(500).json({ error: "An error occurred while sending your message. Please try again later." });
    }
});

module.exports = router;
