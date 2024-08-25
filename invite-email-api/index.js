require('dotenv').config();

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const { URL } = require('url');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON request bodies

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify SMTP connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error configuring SMTP transporter:', error);
  } else {
    console.log('SMTP transporter is configured successfully.');
  }
});

// Function to parse WebSocket URL and extract parameters
const parseSocketUrl = (socketUrl) => {
  try {
    const url = new URL(socketUrl);
    const params = new URLSearchParams(url.search);
    return {
      userUID: params.get('userUID'),
      canvasId: params.get('canvasId'),
      token: params.get('token')
    };
  } catch (error) {
    console.error('Error parsing WebSocket URL:', error);
    return null;
  }
};

// API Endpoint to Send Invitation Emails
app.post('/send-invite', async (req, res) => {
  const { emails, Socket } = req.body;

  // Validate request body
  if (!emails || !Array.isArray(emails) || emails.length === 0 || !Socket) {
    return res.status(400).json({ error: 'Invalid request. "emails" must be a non-empty array and "Socket" is required.' });
  }

  // Parse WebSocket URL to get parameters
  const socketParams = parseSocketUrl(Socket);
  if (!socketParams || !socketParams.userUID || !socketParams.canvasId || !socketParams.token) {
    return res.status(400).json({ error: 'Invalid WebSocket URL. Could not extract required parameters.' });
  }

  // Validate email format
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const invalidEmails = emails.filter(email => !emailPattern.test(email));

  if (invalidEmails.length > 0) {
    return res.status(400).json({ error: 'Some email addresses are invalid.', invalidEmails });
  }

  // Function to generate email content with the provided URL
  const generateMailOptions = (recipientEmail, userUID, canvasId, token) => ({
    from: process.env.SMTP_USER,
    to: recipientEmail,
    subject: 'WhiteBoard Invite',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
              .container { max-width: 600px; margin: 20px auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); background: linear-gradient(135deg, #e0e0e0 0%, #ffffff 100%); }
              .header { background: linear-gradient(135deg, #8e9baf, #4a4e69); color: #ffffff; padding: 15px; text-align: center; border-radius: 8px 8px 0 0; }
              .header h1 { margin: 0; font-size: 28px; }
              .content { padding: 20px; text-align: center; }
              .content p { font-size: 16px; line-height: 1.6; margin: 10px 0; color: #333333; }
              .button { display: inline-block; padding: 12px 24px; font-size: 16px; font-weight: bold; color: #000; background: linear-gradient(135deg, #6c757d, #4b4f56); text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; font-size: 14px; color: #888888; padding: 10px; border-top: 1px solid #eeeeee; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Welcome to PulseZest-Whiteboard</h1>
              </div>
              <div class="content">
                  <p>Hello,</p>
                  <p>You have been invited to join PulseZest-Whiteboard. Click the button below to accept the invitation and get started.</p>
                  <a href="http://localhost:3000/dashboard/${userUID}/${canvasId}/${token}" class="button">Accept Invitation</a>
                  <p>Best regards,<br>The PulseZest-Whiteboard Team</p>
              </div>
              <div class="footer">
                  &copy; 2024 PulseZest. All rights reserved.
              </div>
          </div>
      </body>
      </html>
    `,
  });

  try {
    const { userUID, canvasId, token } = socketParams;

    const sendMailPromises = emails.map((recipientEmail) => {
      const mailOptions = generateMailOptions(recipientEmail, userUID, canvasId, token);
      return transporter.sendMail(mailOptions);
    });

    await Promise.all(sendMailPromises);

    console.log(`Invitations sent to: ${emails.join(', ')}`);
    return res.status(200).json({ message: 'Invitations sent successfully.' });
  } catch (error) {
    console.error('Error sending invitations:', error);
    return res.status(500).json({ error: 'An error occurred while sending invitations.' });
  }
});

// Start the Server
app.listen(PORT, () => {
  console.log(`Email invite API server is running on port ${PORT}`);
});