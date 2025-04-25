import {transporter} from '../configs/mail.js'

async function warmUpMailer() {
    try {
        await transporter.verify() // Establishes the connection
        console.log('Nodemailer is warmed up.')

        // Optional: send dummy email
        await transporter.sendMail({
            from: process.env.GMAIL_USER_FROM,
            to: process.env.GMAIL_USER_TO,
            subject: 'Warming up mailer',
            text: 'This is a warm-up email.',
        })
    } catch (err) {
        console.error('Failed to warm up Nodemailer:', err)
    }
}

export { warmUpMailer }
