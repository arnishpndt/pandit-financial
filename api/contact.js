require('dotenv').config();
const nodemailer = require('nodemailer');

// Export a default function for Vercel Serverless
module.exports = async (req, res) => {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { name, email, phone, message } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: 'Name and Email are required.' });
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_TO || process.env.EMAIL_USER,
            replyTo: email,
            subject: `New Inquiry from ${name}`,
            text: `
                Name: ${name}
                Email: ${email}
                Phone: ${phone || 'Not provided'}
                
                Message:
                ${message}
            `,
            html: `
                <h3>New Contact Request</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                <br>
                <p><strong>Message:</strong></p>
                <p>${message ? message.replace(/\n/g, '<br>') : 'No message provided'}</p>
            `
        };

        if (process.env.EMAIL_USER) {
            await transporter.sendMail(mailOptions);
        } else {
            console.log('No email credentials. Simulated success.');
        }

        return res.status(200).json({ success: true, message: 'Message sent successfully!' });

    } catch (error) {
        console.error('Email Error:', error);
        return res.status(500).json({ error: 'Failed to send message.' });
    }
};
