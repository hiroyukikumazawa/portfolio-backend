# Hiroyuki Kumazawa's Portfolio Backend

This repository contains the backend code for Hiroyuki Kumazawa's portfolio website, a Node.js application built with Express, Socket.IO, and additional libraries to handle various functionalities including real-time blockchain network interactions, email communications, and more.

## Features

- **Real-Time Blockchain Updates**: Connects to various blockchain networks like Ethereum, Solana, and Cosmos via WebSocket to stream real-time block information.
- **Email Notification Service**: Supports sending emails via an integrated SMTP server setup.
- **File Uploads**: Handles file uploads with Multer for potential portfolio updates or administrative use.

## Prerequisites

- Node.js (version 18.x or later recommended)
- npm (Node Package Manager)

## Installation

1. **Clone the Repository**

    ```bash
    git clone https://github.com/hiroyukikumazawa/portfolio-backend.git
    cd portfolio-backend
    ```

2. **Install Dependencies**

    ```bash
    npm install
    ```

3. **Environment Setup**

    Create a `.env` file in the root directory of your project and update it with the necessary environment variables.

    ```plaintext
    EMAIL_USER=your-email@example.com
    EMAIL_PASS=your-email-password
    ```

## Running the Application

Start the server with the following command:

```bash
node server.js
```

This will start the backend server on port 9901.

## Usage

- **Endpoint `/send-email`**: Post a request with JSON payload containing `name`, `email`, and `message` fields to send an email.
- **Endpoint `/blocks`**: Get the latest block information from connected blockchain networks.
- **WebSocket Connection**: Connect via Socket.IO client to receive real-time updates on new blockchain blocks and other events.

## Contributing

Contributions are welcome!

## License

This project is licensed under the MIT License.

## Acknowledgements

- [Express.js](https://expressjs.com/)
- [Socket.IO](https://socket.io/)
- [Nodemailer](https://nodemailer.com/about/)
- [Multer](https://github.com/expressjs/multer)
