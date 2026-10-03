import {
  createConfig,
  http,
} from 'wagmi'

import {
  defineChain,
} from 'viem'

const alchemyApiKey =
  import.meta.env
    .VITE_ALCHEMY_API_KEY

if (!alchemyApiKey) {
  throw new Error(
    'VITE_ALCHEMY_API_KEY is not configured',
  )
}

export const arcMainnet =
  defineChain({
    id: 5042,

    name: 'Arc Mainnet',

    nativeCurrency: {
      name: 'USDC',
      symbol: 'USDC',
      decimals: 18,
    },

    rpcUrls: {
      default: {
        http: [
          `https://arc-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
        ],
      },
    },
  })

export const arcRpcUrl =
  `https://arc-mainnet.g.alchemy.com/v2/${alchemyApiKey}`

export const wagmiConfig =
  createConfig({
    chains: [
      arcMainnet,
    ],

    transports: {
      [arcMainnet.id]:
        http(
          arcRpcUrl,
        ),
    },
  })