require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced CORS configuration
app.use(cors({
  origin: "https://jaydeeo-portfolio.vercel.app", // Replace with your frontend URL
  methods: ['POST']
}));

app.use(express.json());

// Improved email endpoint
app.post('/send-email', async (req, res) => {
  const { email, message } = req.body;

  if (!email || !message) {
    return res.status(400).json({ error: 'Email and message are required' });
  }

  try {
    // More robust transporter configuration
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false // Only for testing!
      }
    });

    // Verify connection configuration
    await transporter.verify((error, success) => {
      if (error) {
        console.log('Server verification error:', error);
      } else {
        console.log('Server is ready to take our messages');
      }
    });

    const mailOptions = {
      from: `"Contact Form" <${process.env.EMAIL_USER}>`,
      replyTo: email,
      to: process.env.YOUR_EMAIL,
      subject: `New message from ${email}`,
      text: message,
      html: `<p>${message}</p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    res.status(200).json({ success: true, messageId: info.messageId });
    
  } catch (error) {
    console.error('Full error details:', error);
    let errorMessage = 'Failed to send message';
    
    // Handle specific Gmail errors
    if (error.code === 'EAUTH') {
      errorMessage = 'Authentication failed - check your email credentials';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Connection to email server failed';
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Using email: ${process.env.EMAIL_USER}`);
});
