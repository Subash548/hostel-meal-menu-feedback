/**
 * Notification Service for sending Reminders/Alerts via Email.
 */

const nodemailer = require('nodemailer');
const axios = require('axios');

// Configure reusable transporter using SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use common defaults for Gmail, can be replaced with custom SMTP
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async (to, subject, text, html) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn(`[EMAIL MOCK] Missing EMAIL_USER or EMAIL_PASS in .env. Cannot send real email to ${to}. Subject: ${subject}`);
            return false;
        }

        const info = await transporter.sendMail({
            from: `"HostelFresh Notifications" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        });
        console.log(`[EMAIL] ✅ Sent to ${to}: ${info.messageId}`);
        return true;
    } catch (err) {
        console.error(`[EMAIL] ❌ Error sending to ${to}:`, err.message);
        return false;
    }
};

const sendPushNotification = async (deviceTokens, title, body, data) => {
    // TODO: Integrate Firebase Admin SDK (FCM) using process.env keys
    console.log(`[PUSH MOCK] To: ${deviceTokens.length} devices | Title: ${title}`);
    return true;
};

/**
 * Dispatches meal reminder notifications via all enabled channels for a student.
 */
const dispatchNotifications = async (user, mealType, menuText) => {
    const prefs = user.notificationPrefs || {};
    const message = `HostelFresh Reminder: ${mealType} will be served in 30 minutes. Today's menu: ${menuText}`;

    if (prefs.email && user.email) {
        await sendEmail(user.email, `HostelFresh Meal Reminder - ${mealType}`, message, `<p>${message}</p>`);
    }
    if (prefs.push) {
        await sendPushNotification(['mock-device-token-123'], `Meal Reminder - ${mealType}`, message, { mealType });
    }
};

module.exports = {
    sendEmail,
    sendPushNotification,
    dispatchNotifications,
};

