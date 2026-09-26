export const batchPaymentAbi = [
    {
        type: 'function',
        name: 'batchPay',
        stateMutability: 'nonpayable',
        inputs: [
            {
                name: 'recipients',
                type: 'address[]',
            },
            {
                name: 'amounts',
                type: 'uint256[]',
            },
        ],
        outputs: [],
    },
    {
        type: 'function',
        name: 'usdc',
        stateMutability: 'view',
        inputs: [],
        outputs: [
            {
                name: '',
                type: 'address',
            },
        ],
    },
    {
        type: 'function',
        name: 'MAX_RECIPIENTS',
        stateMutability: 'view',
        inputs: [],
        outputs: [
            {
                name: '',
                type: 'uint256',
            },
        ],
    },
    {
        type: 'event',
        name: 'BatchPaymentExecuted',
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: 'sender',
                type: 'address',
            },
            {
                indexed: false,
                name: 'recipientCount',
                type: 'uint256',
            },
            {
                indexed: false,
                name: 'totalAmount',
                type: 'uint256',
            },
        ],
    },
] as const