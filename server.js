import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Create nodemailer transporter using Gmail
// You need to use an App Password (not your regular Gmail password)
// Go to: Google Account > Security > 2-Step Verification > App passwords
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS  // Use App Password from Google
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ status: 'ok', message: 'API is working!', time: new Date().toISOString() });
});

// Send email endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { recipientEmail, senderEmail, amount, note } = req.body;

    if (!recipientEmail || !senderEmail || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('📧 Sending email to:', recipientEmail);

    const mailOptions = {
      from: `"zkBank" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `💰 You received ${amount} USDC!`,
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; background: #f4f6f8; padding: 24px;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); padding: 32px;">
            <h2 style="color: #722ed1; font-size: 24px;">💰 You received crypto!</h2>
            <div style="background: linear-gradient(135deg, #722ed1 0%, #1890ff 100%); border-radius: 12px; padding: 24px; margin: 20px 0; text-align: center;">
              <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 14px;">Amount Received</p>
              <h1 style="color: #ffffff; margin: 8px 0; font-size: 48px;">${amount} USDC</h1>
            </div>
            <p style="font-size: 16px; color: #333;">
              <strong>${senderEmail}</strong> just sent you <strong>${amount} USDC</strong> using zkBank!
            </p>
            ${note ? `
            <div style="background: #f9f9f9; border-left: 4px solid #722ed1; padding: 12px 16px; margin: 16px 0;">
              <p style="margin: 0; color: #666; font-size: 14px;">📝 Note:</p>
              <p style="margin: 8px 0 0 0; color: #333;">"${note}"</p>
            </div>
            ` : ''}
            <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
            <h3 style="color: #333;">How to claim:</h3>
            <ol style="color: #555;">
              <li>Visit zkBank</li>
              <li>Verify Google Account</li>
              <li>Click "Check for Incoming Transfers"</li>
              <li>Click "Claim USDC"</li>
            </ol>
            <p style="color: #888; font-size: 12px; text-align: center; margin-top: 24px;">
              Powered by zkBank
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('❌ Email error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`   Test: http://localhost:${PORT}/api/test`);
});
