import { createConfig, http } from 'wagmi'
import { metaMask } from 'wagmi/connectors'
import { defineChain } from 'viem'

export const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Network Testnet',

  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 18,
  },

  rpcUrls: {
    default: {
      http: [
        'https://rpc.solidrpc.io/public/evm/5042002',
      ],
    },
  },

  blockExplorers: {
    default: {
      name: 'ArcScan',
      url: 'https://testnet.arcscan.app',
    },
  },

  testnet: true,
})

export const wagmiConfig = createConfig({
  chains: [arcTestnet],

  connectors: [
    metaMask(),
  ],

  transports: {
    [arcTestnet.id]: http(
      'https://rpc.solidrpc.io/public/evm/5042002',
    ),
  },
})