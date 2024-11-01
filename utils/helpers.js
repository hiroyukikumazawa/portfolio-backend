const nodemailer = require('nodemailer');
require('dotenv').config();

class MailerService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
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
    }

    sendMail(mailOptions, callback) {
        this.transporter.sendMail(mailOptions, callback);
    }
}

module.exports = new MailerService();
