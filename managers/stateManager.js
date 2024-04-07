let blocks = [
    {
        network: 'ethereum',
        block: 0,
    },
    {
        network: 'atom',
        block: 0,
    },
    {
        network: 'sei',
        block: 0,
    },
    {
        network: 'solana',
        block: 0,
    },
    // {
    //     network: 'bnb',
    //     block: 0,
    // },
    {
        network: 'base',
        block: 0,
    },
    // {
    //     network: 'arbitrum',
    //     block: 0,
    // },
    // {
    //     network: 'optimism',
    //     block: 0,
    // },
];

module.exports = {
    updateBlocks: (data) => {
        const idx = blocks.findIndex((item) => { return item.network == data.network });
        if (idx == -1) {
            blocks = [...blocks, data];
        } else {
            const _prevBlocks = [...blocks];
            _prevBlocks[idx] = data;
            blocks = _prevBlocks;
        }
        return blocks;
    },
    getBlocks: () => {
        return blocks;
    },
};
