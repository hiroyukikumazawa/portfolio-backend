const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const http = require('http');
const socketServer = require('socket.io');
const cors = require('cors');
const mailerService = require('./utils/helpers');
const socketManager = require('./managers/socketManager');
const stateManager = require('./managers/stateManager.js');
const { blockStart } = require('./networks/blocks.js');
const { getCommitsFromUser } = require("./utils/githubServices.js");
const { githubRepos } = require("./utils/constant.js");

require('dotenv').config();

const PORT = 9901;
const BLOGS_DIR = path.join(__dirname, 'blogs'); // Directory to store blog files

// Ensure the blogs directory exists
if (!fs.existsSync(BLOGS_DIR)) {
    fs.mkdirSync(BLOGS_DIR);
}

const startServer = async () => {
    const app = express();
    const server = http.createServer(app);

    const io = await socketManager.init(server);

    blockStart();

    // Set up storage engine
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/'); // Destination folder
        },
        filename: function (req, file, cb) {
            const _fileName = path.basename(file.originalname, path.extname(file.originalname)) + '-' + Date.now() + path.extname(file.originalname);
            io.emit('new-release', _fileName);
            cb(null, _fileName);
        }
    });

    const upload = multer({ storage: storage });

    // Middleware
    app.use(cors({ origin: "*" }));
    app.use(express.static(path.join(__dirname, '/dist')));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Blog CRUD Routes

    // Middleware to check for password
    const checkPassword = (req, res, next) => {
        const password = req.headers['x-api-password'];
        if (password === process.env.BLOG_API_PASSWORD) {
            return next();
        }
        res.status(403).send({ message: 'Forbidden: Invalid password' });
    };

    // Create a new blog post
    app.post('/blogs', checkPassword, (req, res) => {
        const { title, content, author } = req.body;
        const id = Date.now().toString();
        const createdAt = new Date().toISOString();
        const blog = { id, title, content, author, createdAt };

        fs.writeFile(path.join(BLOGS_DIR, `${id}.json`), JSON.stringify(blog, null, 2), (err) => {
            if (err) return res.status(500).send({ message: 'Failed to save blog', error: err });
            res.status(201).send({ message: 'Blog created successfully', blog });
        });
    });

    // Read all blog posts
    app.get('/blogs', (req, res) => {
        fs.readdir(BLOGS_DIR, (err, files) => {
            if (err) return res.status(500).send({ message: 'Failed to load blogs', error: err });

            const blogs = files.map(file => {
                const data = fs.readFileSync(path.join(BLOGS_DIR, file));
                return JSON.parse(data);
            });
            res.send(blogs);
        });
    });

    // Read a specific blog post
    app.get('/blogs/:id', (req, res) => {
        const { id } = req.params;
        const filePath = path.join(BLOGS_DIR, `${id}.json`);

        if (!fs.existsSync(filePath)) return res.status(404).send({ message: 'Blog not found' });

        const data = fs.readFileSync(filePath);
        res.send(JSON.parse(data));
    });

    // Update a blog post
    app.put('/blogs/:id', checkPassword, (req, res) => {
        const { id } = req.params;
        const { title, content, author } = req.body;
        const filePath = path.join(BLOGS_DIR, `${id}.json`);

        if (!fs.existsSync(filePath)) return res.status(404).send({ message: 'Blog not found' });

        const blog = JSON.parse(fs.readFileSync(filePath));
        const updatedBlog = { ...blog, title, content, author };

        fs.writeFile(filePath, JSON.stringify(updatedBlog, null, 2), (err) => {
            if (err) return res.status(500).send({ message: 'Failed to update blog', error: err });
            res.send({ message: 'Blog updated successfully', blog: updatedBlog });
        });
    });

    // Delete a blog post
    app.delete('/blogs/:id', checkPassword, (req, res) => {
        const { id } = req.params;
        const filePath = path.join(BLOGS_DIR, `${id}.json`);

        if (!fs.existsSync(filePath)) return res.status(404).send({ message: 'Blog not found' });

        fs.unlink(filePath, (err) => {
            if (err) return res.status(500).send({ message: 'Failed to delete blog', error: err });
            res.send({ message: 'Blog deleted successfully' });
        });
    });

    // Existing routes
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

    app.get('/blocks', (req, res) => {
        const blocks = stateManager.getBlocks();
        res.send(blocks);
    });

    app.get('/git-contributions', async (req, res) => {
        const allCommits = {};
        for (let repo in githubRepos) {
            const repoUrl = `https://github.com/${githubRepos[repo]['repoOwner']}/${githubRepos[repo]['repoName']}`;
            const commits = getCommitsFromUser(githubRepos[repo]['repoOwner'], githubRepos[repo]['repoName'], githubRepos[repo]['username']);
            allCommits[repoUrl] = commits;
        }
        res.send(allCommits);
    });

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname + '/dist/index.html'));
    });

    io.on('connection', (socket) => {
        console.log('A user connected');
        socket.on('test', (msg) => {
            socket.emit('test', msg);
        });

        socket.on('ping', (msg) => {
            socket.emit('pong', 'hello');
        });

        socket.on('disconnect', () => {
            console.log('A user disconnected');
        });
    });

    server.listen(PORT, '0.0.0.0', () => {
        console.log(`Server listening at http://localhost:${PORT}`);
    });
};

startServer();
