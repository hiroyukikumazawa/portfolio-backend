// const { ethers } = require('ethers');

// const startConnection = () => {
//   // Define the WebSocket URL
//   const wsUrl = "wss://base-rpc.publicnode.com";

//   // Create a new WebSocketProvider instance
//   const ethereumProvider = new ethers.WebSocketProvider("wss://base-rpc.publicnode.com")

//   // Define what happens when a message is received
//   ethereumProvider.websocket.onmessage = (message) => {
//     // Assuming the message contains the block number directly for simplicity
//     const blockNumber = JSON.parse(message.data).result;
//     console.log(`New block: ${blockNumber}`);
//   };

//   // Optionally, handle open event to confirm connection
//   ethereumProvider.websocket.onopen = () => {
//     console.log('WebSocket connection successfully opened');
//   };

//   // Optionally, handle errors
//   ethereumProvider.websocket.onerror = (error) => {
//     console.error('WebSocket encountered an error:', error);
//   };

//   // Optionally, handle close events
//   ethereumProvider.websocket.onclose = (event) => {
//     console.log(`WebSocket closed: ${event.code} ${event.reason}`);
//     // The reconnection logic is now handled by the WebSocketProvider class, so no need to handle here
//   };
// };

// startConnection();

const { getCommitsFromUser } = require("./utils/githubServices.js")

getCommitsFromUser('akash-network', 'website', 'hiroyukikumazawa.jp@gmail.com')
// getPullRequests('akash-network', 'website', 'hiroyukikumazawa')
