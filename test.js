const WebSocket = require('ws');

// Replace 'ws://localhost:26657/websocket' with the actual URL of your Cosmos node's WebSocket service
const wsUrl = 'wss://evm-ws.arctic-1.seinetwork.io';
const cosmosWs = new WebSocket(wsUrl);

cosmosWs.on('open', function open() {
    const query = '{"jsonrpc":"2.0","method":"subscribe","id":"0","params":{"query":"tm.event=\'NewBlockHeader\'"}}';
    cosmosWs.send(query);
});

cosmosWs.on('message', function incoming(data) {
    const response = JSON.parse(data);
    if (response.result?.data?.value?.header) {
        const blockHeight = response.result.data.value.header.height;
        console.log(blockHeight);
        // const io = socketManager.getIO();
        // io.emit('newBlock', { network: 'Cosmos Hub', block: blockHeight });
    }
});

cosmosWs.on('error', function error(err) {
    console.error('WebSocket error:', err);
});
