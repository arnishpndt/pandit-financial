require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Email Transporter (Configure with your SMTP credentials in .env)
const transporter = nodemailer.createTransport({
    service: 'gmail', // Example: 'gmail', 'outlook', or generic SMTP
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Routes
app.post('/api/contact', async (req, res) => {
    const { name, email, phone, message } = req.body;

    console.log('Received Payload:', req.body);

    if (!name || !email) {
        return res.status(400).json({ error: 'Name and Email are required.' });
    }

    try {
        // Compose Email
        const mailOptions = {
            from: process.env.EMAIL_USER, // Sender address (Must be your authenticated email)
            to: process.env.EMAIL_TO || process.env.EMAIL_USER, // Receiver address
            replyTo: email, // <--- IMPORTANT: This allows you to hit "Reply" and email the visitor
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

        // Send Email
        // Note: Unless configured in .env, this will fail. 
        // We catch the error but log success for specific testing if in dev mode
        if (process.env.EMAIL_USER) {
            await transporter.sendMail(mailOptions);
            console.log('Email sent successfully');
        } else {
            console.log('No email credentials provided. Skipping email send (Simulated Success).');
        }

        res.status(200).json({ success: true, message: 'Message sent successfully!' });

    } catch (error) {
        console.error('Email Error:', error);
        res.status(500).json({ error: 'Failed to send message.' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
