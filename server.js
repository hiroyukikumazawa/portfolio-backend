const express = require('express');
const multer = require('multer');
const http = require('http');
const path = require('path');
const socketServer = require('socket.io');
const cors = require('cors');
const mailerService = require('./utils/helpers');
const socketManager = require('./managers/socketManager');
require('dotenv').config();

const PORT = 9901;
const startServer = async () => {
    const app = express();
    const server = http.createServer(app);
    
    const io = await socketManager.init(server);
    
    require('./networks/blocks.js')
    // Set up storage engine
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/') // Destination folder
        },
        filename: function (req, file, cb) {
            const _fileName = path.basename(file.originalname, path.extname(file.originalname)) + '-' + Date.now() + path.extname(file.originalname);
            io.emit('new-release', _fileName);
            cb(null, _fileName);
        }
    });

    const upload = multer({ storage: storage });

    // Middleware to enable CORS with dynamic origin support
    app.use(cors({ origin: "*" }))

    // Serve static files from the 'dist' directory
    app.use(express.static(path.join(__dirname, '/dist')));

    // Use built-in middleware for parsing JSON and URL-encoded bodies
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.post('/send-email', (req, res) => {
        const { name, email, message } = req.body;
        const mailOptions = {
            from: `"From ${email}" <${process.env.EMAIL_USER}>`,
            to: 'hiroyukikumazawa.jp@gmail.com',
            subject: `Message from ${name}`,
            html: `<html><body><p>${message}</p><p><b>${name} <br/> ${email}</b></p></body></html>`,
            replyTo: email,
            headers: {
                'List-Unsubscribe': `<mailto:${process.env.EMAIL_USER}?subject=unsubscribe>`,
            }
        };

        mailerService.sendMail(mailOptions, (error, info) => {
            if (error) {
                res.status(500).send({ message: 'Failed to send email', error });
            } else {
                res.status(200).send({ message: 'Email sent successfully', messageId: info.messageId });
            }
        });
        res.send('success');
    });

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname + '/dist/index.html'));
    });

    io.on('connection', (socket) => {
        console.log('A user connected');
        socket.on('test', (msg) => {
            socket.emit('test', msg)
        });

        socket.on('ping', (msg) => {
            socket.emit('pong', 'hello')
        });

        socket.on('disconnect', () => {
            console.log('A user disconnected');
        });
    });

    server.listen(PORT, '0.0.0.0', () => {
        console.log(`Server listening at http://localhost:${PORT}`);
    });
}

startServer();
