/**
 * Notification Service for sending Reminders/Alerts via different channels.
 * Note: Placeholder implementations until real API keys are provided.
 */

const sendEmail = async (to, subject, text, html) => {
    // TODO: Integrate actual Nodemailer/SendGrid here using process.env keys
    console.log(`[EMAIL MOCK] To: ${to} | Subject: ${subject}`);
    return true;
};

const sendSMS = async (to, text) => {
    // TODO: Integrate actual Twilio here using process.env keys
    console.log(`[SMS MOCK] To: ${to} | Message: ${text}`);
    return true;
};

const sendPushNotification = async (deviceTokens, title, body, data) => {
    // TODO: Integrate Firebase Admin SDK (FCM) using process.env keys
    console.log(`[PUSH MOCK] To: ${deviceTokens.length} devices | Title: ${title}`);
    return true;
};

const dispatchNotifications = async (user, mealType, menuText) => {
    const prefs = user.notificationPrefs || {};
    const message = `Reminder: ${mealType} will be served in 30 minutes. Today's menu: ${menuText}`;
    
    if (prefs.email && user.email) {
        await sendEmail(user.email, `HostelFresh Meal Reminder - ${mealType}`, message, `<p>${message}</p>`);
    }
    if (prefs.sms && user.phone) {
        await sendSMS(user.phone, message);
    }
    if (prefs.push) {
        // Requires user document to store FCM device tokens, using a mock token here.
        await sendPushNotification(['mock-device-token-123'], `Meal Reminder - ${mealType}`, message, { mealType });
    }
};

module.exports = {
    sendEmail,
    sendSMS,
    sendPushNotification,
    dispatchNotifications
};
