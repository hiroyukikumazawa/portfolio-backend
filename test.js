const WebSocket = require('ws');
const { Connection, clusterApiUrl } = require('@solana/web3.js');
const { ethers } = require('ethers');


/* Cosmos wss urls */
const cosmosWssUrls = [
    {
        network: 'atom',
        wssUrl: 'wss://cosmos-rpc.publicnode.com:443/websocket',
    },
    {
        network: 'sei',
        wssUrl: 'wss://sei-rpc.publicnode.com:443/websocket',
    }
]

/* EVM wss urls */
const evmWssUrls = [
    {
        network: 'ethereum',
        wssUrl: 'wss://ethereum-rpc.publicnode.com',
    },
    {
        network: 'base',
        wssUrl: 'wss://base-rpc.publicnode.com',
    },
]

/* Solana */
const solanaNetwork = 'mainnet-beta';


/**
 * Sets up a WebSocket connection for the Cosmos-based networks.
 *
 * @param {Object} item - The configuration object for the WebSocket connection.
 * @param {string} item.network - The name of the network.
 * @param {string} item.wssUrl - The WebSocket URL to connect to.
 */
function setupCosmosWebSocket(item) {

    function cosmosConnect() {
        const cosmosWs = new WebSocket(item.wssUrl);
        cosmosWs.on('open', function open() {
            const query = '{"jsonrpc":"2.0","method":"subscribe","id":"0","params":{"query":"tm.event=\'NewBlockHeader\'"}}';
            cosmosWs.send(query);
        });
        cosmosWs.on('message', function incoming(data) {
            const response = JSON.parse(data);
            if (response.result?.data?.value?.header) {
                const blockHeight = response.result.data.value.header.height;
                console.log(item.network, blockHeight)
            }
        });
        cosmosWs.on('close', function close() {
            console.log(`Cosmos WebSocket was closed. Attempting to reconnect...${Date.now()}`);
            setTimeout(cosmosConnect, 10000);
        });
        cosmosWs.on('error', function error(err) {
            console.error('WebSocket error:', err);
            cosmosWs.close();
        });
    }
    cosmosConnect();
}
cosmosWssUrls.forEach(setupCosmosWebSocket);


/**
 * Sets up a WebSocket connection for the EVM-based networks.
 *
 * @param {Object} item - The configuration object for the WebSocket connection.
 * @param {string} item.network - The name of the network.
 * @param {string} item.wssUrl - The WebSocket URL to connect to.
 */
function setupEthereumWebSocket(item) {
    function evmConnect() {
        const ethereumProvider = new ethers.WebSocketProvider(item.wssUrl);
        ethereumProvider.on("block", (blockNumber) => {
            console.log(item.network, blockNumber)
        });
        ethereumProvider.on("error", (error) => {
            console.error("EVM WebSocket error in " + item.network + ":", error);
            ethereumProvider.removeAllListeners();
            ethereumProvider.destroy();
            setTimeout(evmConnect, 10000);
        });
    }

    evmConnect();
}
evmWssUrls.forEach(setupEthereumWebSocket);

/**
 * Sets up a WebSocket connection for a Solana network.
 */
function setupSolanaConnection() {
    const solanaProvider = new Connection(clusterApiUrl(solanaNetwork));
    function subscribeToSlots() {
        return solanaProvider.onSlotChange((slotInfo) => {
            console.log('Solana', slotInfo.slot)
        });
    }
    let subscriptionId = subscribeToSlots();
    solanaProvider._rpcWebSocket.on('close', () => {
        console.error("WebSocket closed. Reconnecting...");
        if (subscriptionId) {
            solanaProvider.removeSlotChangeListener(subscriptionId).catch(console.error);
        }
        setTimeout(() => {
            // subscriptionId = subscribeToSlots();
        }, 10000);
    });
    solanaProvider._rpcWebSocket.on('error', (err) => {
        console.error("Solana WebSocket error:", err);
        solanaProvider._rpcWebSocket.close();
    });
}

setupSolanaConnection();