const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter = nodemailer.createTransport({
    host: "us2.smtp.mailhostbox.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        ciphers: 'HIGH',
        rejectUnauthorized: false
    }
});

let mailOptions = {
    from: `"From portfolio" <${process.env.EMAIL_USER}>`,
    to: 'hiroyukikumazawa.jp@gmail.com',
    subject: 'Message from portfolio',
    html: `<html><body><p>Dear User,</p><p>We are excited to share updates with you! Please read the information below carefully and feel free to get in touch if you have any questions.</p><p>Best regards,<br>Hiroyuki</p></body></html>`,
    replyTo: process.env.EMAIL_USER,
    headers: {
        'List-Unsubscribe': `<mailto:${process.env.EMAIL_USER}?subject=unsubscribe>`,
    }
};

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
});
