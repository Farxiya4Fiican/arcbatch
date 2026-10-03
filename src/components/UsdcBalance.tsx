import { formatUnits } from 'viem'
import { useAccount, useReadContract } from 'wagmi'

import { erc20Abi } from '../contracts/erc20Abi'
import {
  USDC_ADDRESS,
  USDC_DECIMALS,
} from '../config/tokens'
import { arcMainnet } from '../config/wagmi'

export default function UsdcBalance() {
  const {
    address,
    isConnected,
    chainId,
  } = useAccount()

  const {
    data: balance,
    isLoading,
    error,
  } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: arcMainnet.id,
    query: {
      enabled:
        isConnected &&
        Boolean(address) &&
        chainId === arcMainnet.id,
    },
  })

  if (!isConnected) {
    return null
  }

  if (chainId !== arcMainnet.id) {
    return (
      <div className="balance-card">
        <span className="balance-label">
          Arc Mainnet balance
        </span>

        <strong>Switch network to view balance</strong>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="balance-card">
        <span className="balance-label">
          Arc Mainnet balance
        </span>

        <strong>Loading...</strong>
      </div>
    )
  }

  if (error) {
    return (
      <div className="balance-card">
        <span className="balance-label">
          Arc Mainnet balance
        </span>

        <strong>Unable to load balance</strong>

        <span className="balance-error">
          {error.message}
        </span>
      </div>
    )
  }
  const formattedBalance =
    balance !== undefined
      ? formatUnits(balance, USDC_DECIMALS)
      : '0'

  return (
    <div className="balance-card">
      <span className="balance-label">
        Arc Mainnet balance
      </span>

      <strong>
        {Number(formattedBalance).toLocaleString(
          undefined,
          {
            maximumFractionDigits: 2,
          },
        )}{' '}
        USDC
      </strong>
    </div>
  )
}