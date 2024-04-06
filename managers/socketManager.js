let io = null;
let liveSocketClient = null;

module.exports = {
    init: async (httpServer) => {
        io = await require('socket.io')(httpServer, {
            cors: {
                origin: '*',
            }
        });
        return io;
    },
    getIO: () => {
        if (!io) {
            return false;
        }
        return io;
    },
};
