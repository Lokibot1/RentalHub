import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: process.env.MAIL_SERVICE,
  auth: {
    user: process.env.MAIL_AUTH_USER, // Gmail address
    pass: process.env.MAIL_AUTH_PASS, // App Password from Google
  },
})

const mailOptions = {
  from: process.env.MAIL_AUTH_USER,
  to: '',
  subject: 'OTP Verification',
  html: '',
}

// Function to send the approval notification email
export const sendApprovalNotification = (email, item_name, rental_quantity, rental_transaction_id, owner_contact) => {
  const subject = 'Rental Request Approved';
  const html = `
    <p>Your rental request for <strong>${item_name}</strong> has been approved.</p>
    <p>Rental Quantity: ${rental_quantity}</p>
    <p>Rental Transaction ID: ${rental_transaction_id}</p>
    <p>Please contact the item owner using the information below for further details regarding the transaction:</p>
    <ul>
      <li><strong>Phone Number:</strong> ${owner_contact.contact_number}</li>
      <li><strong>Email:</strong> ${owner_contact.email}</li>
      <li><strong>Social Media:</strong> ${owner_contact.social_media}</li>
    </ul>
  `;

  const mailOptions = {
    from: process.env.MAIL_AUTH_USER, // Sender email
    to: email, // Recipient email (item owner's email)
    subject: subject,
    html: html,
  };

  // Send the email
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error("Failed to send approval notification:", err);
    } else {
      console.log("Approval notification sent:", info.response);
    }
  });
};

export { transporter, mailOptions }
