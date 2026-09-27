import { createConfig, http } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { defineChain } from 'viem'

const alchemyApiKey =
  import.meta.env.VITE_ALCHEMY_API_KEY

if (!alchemyApiKey) {
  throw new Error(
    'VITE_ALCHEMY_API_KEY is not configured',
  )
}

const arcRpcUrl =
  `https://arc-testnet.g.alchemy.com/v2/${alchemyApiKey}`

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
  chains: [
    arcTestnet,
  ],

  connectors: [
    injected(),
  ],

  transports: {
    [arcTestnet.id]: http(
      arcRpcUrl,
    ),
  },
})