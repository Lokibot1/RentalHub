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

export { transporter, mailOptions }
