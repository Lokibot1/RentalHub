// Function to send the approval notification email
import { transporter } from '../configs/mail.js'

export const sendNotification = (to, {subject, html}) => {

    const mailOptions = {
        from: process.env.MAIL_AUTH_USER, // Sender email
        to, // Recipient email (item owner's email)
        subject,
        html
    };

    // Send the email
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error("Failed to send notification:", err);
        } else {
            console.log("Notification sent:", info.response);
        }
    });
};
