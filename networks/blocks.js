const socketManager = require("../managers/socketManager");
const { ethers } = require('ethers');

// WebSocket URL for the Ethereum mainnet (replace with your actual URL)
const wssUrls = [
    {
        network: 'ethereum',
        wssUrl: 'wss://ethereum-rpc.publicnode.com',
    },
    {
        network: 'bnb',
        wssUrl: 'wss://bsc-rpc.publicnode.com',
    },
    {
        network: 'base',
        wssUrl: 'wss://base-rpc.publicnode.com',
    },
    {
        network: 'optimism',
        wssUrl: 'wss://optimism-rpc.publicnode.com',
    },
    {
        network: 'arbitrum',
        wssUrl: 'wss://arbitrum-one-rpc.publicnode.com'
    }
]

wssUrls.map((item, idx) => {
    const ethereumProvider = new ethers.WebSocketProvider(item.wssUrl);

    // This function will be called every time a new block is mined
    ethereumProvider.on("block", (blockNumber) => {
        const io = socketManager.getIO();
        io.emit('newBlock', { network: item.network, block: blockNumber })
        // Optionally, retrieve the full block details
        // provider.getBlock(blockNumber).then(block => {
        //     console.log("Block details:", block);
        // }).catch(err => {
        //     console.error("Error fetching block details:", err);
        // });
    });

    // Handle any errors that occur
    ethereumProvider.on("error", (error) => {
        console.error("WebSocket error:", error);
    });
})
