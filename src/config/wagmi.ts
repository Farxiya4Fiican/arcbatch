import { createConfig, http } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { defineChain } from 'viem'

const arcRpcUrl = import.meta.env.VITE_ARC_RPC_URL

if (!arcRpcUrl) {
  throw new Error(
    'VITE_ARC_RPC_URL is not configured',
  )
}

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
      http: [arcRpcUrl],
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
    injected(),
  ],

  transports: {
    [arcTestnet.id]: http(arcRpcUrl),
  },
})