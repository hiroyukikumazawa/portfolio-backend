const socketManager = require("../managers/socketManager");
const { Connection, clusterApiUrl } = require('@solana/web3.js');
const WebSocket = require('ws');

const { ethers } = require('ethers');
const stateManager = require("../managers/stateManager");

// WebSocket URL for the Ethereum mainnet (replace with your actual URL)
const wssUrls = [
    {
        network: 'ethereum',
        wssUrl: 'wss://ethereum-rpc.publicnode.com',
    },
    // {
    //     network: 'bnb',
    //     wssUrl: 'wss://bsc-rpc.publicnode.com',
    // },
    {
        network: 'base',
        wssUrl: 'wss://base-rpc.publicnode.com',
    },
    // {
    //     network: 'optimism',
    //     wssUrl: 'wss://optimism-rpc.publicnode.com',
    // },
    // {
    //     network: 'arbitrum',
    //     wssUrl: 'wss://arbitrum-one-rpc.publicnode.com'
    // },
]

wssUrls.map((item, idx) => {
    const ethereumProvider = new ethers.WebSocketProvider(item.wssUrl);

    // This function will be called every time a new block is mined
    ethereumProvider.on("block", (blockNumber) => {
        const io = socketManager.getIO();
        const data = { network: item.network, block: blockNumber }
        io.emit('newBlock', data)
        stateManager.updateBlocks(data)
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


const solanaProvider = new Connection(clusterApiUrl('mainnet-beta'));

// This function will be called every time a new block is confirmed
const subscriptionId = solanaProvider.onSlotChange((slotInfo) => {
    const io = socketManager.getIO();
    const data = { network: 'solana', block: slotInfo.slot }
    io.emit('newBlock', data)
    stateManager.updateBlocks(data)
    // Optionally, retrieve the full block details
    // solanaProvider.getBlock(slotInfo.slot).then(block => {
    //     console.log("Block details:", block);
    // }).catch(err => {
    //     console.error("Error fetching block details:", err);
    // });
});


// Replace 'ws://localhost:26657/websocket' with the actual URL of your Cosmos node's WebSocket service
const cosmosWsUrl = 'wss://cosmos-rpc.publicnode.com:443/websocket';
const cosmosWs = new WebSocket(cosmosWsUrl);

cosmosWs.on('open', function open() {
    const query = '{"jsonrpc":"2.0","method":"subscribe","id":"0","params":{"query":"tm.event=\'NewBlockHeader\'"}}';
    cosmosWs.send(query);
});

cosmosWs.on('message', function incoming(data) {
    const response = JSON.parse(data);
    if (response.result?.data?.value?.header) {
        const blockHeight = response.result.data.value.header.height;
        const io = socketManager.getIO();
        const data = { network: 'atom', block: blockHeight };
        io.emit('newBlock', data);
        stateManager.updateBlocks(data)
    }
});

cosmosWs.on('error', function error(err) {
    console.error('WebSocket error:', err);
});
