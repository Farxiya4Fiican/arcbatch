import {
  useAccount,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from 'wagmi'

import { arcMainnet } from '../config/wagmi'

export default function ConnectWallet() {
  const {
    address,
    isConnected,
    chainId,
  } = useAccount()

  const {
    connectors,
    connect,
    error,
    isPending,
  } = useConnect()

  const { disconnect } = useDisconnect()

  const {
    switchChain,
    isPending: isSwitching,
  } = useSwitchChain()

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : ''

  if (isConnected) {
    return (
      <div className="wallet-connected">

        <div className="wallet-info">
          <span className="status-dot" />

          <div>
            <span className="wallet-label">
              Connected wallet
            </span>

            <strong>
              {shortAddress}
            </strong>
          </div>
        </div>

        {chainId !== arcMainnet.id && (
          <button
            className="btn btn-primary"
            disabled={isSwitching}
            onClick={() =>
              switchChain({
                chainId: arcMainnet.id,
              })
            }
          >
            {isSwitching
              ? 'Switching...'
              : 'Switch to Arc Mainnet'}
          </button>
        )}

        <button
          className="btn btn-secondary"
          onClick={() => disconnect()}
        >
          Disconnect
        </button>

      </div>
    )
  }

  return (
    <div className="wallet-actions">

      {connectors
        .filter((connector) => connector.name === 'MetaMask')
        .map((connector) => (
          <button
            className="btn btn-primary"
            key={connector.uid}
            disabled={isPending}
            onClick={() =>
              connect({
                connector,
              })
            }
          >
            {isPending
              ? 'Connecting...'
              : 'Connect MetaMask'}
          </button>
        ))}

      {error && (
        <p className="wallet-error">
          {error.message}
        </p>
      )}

    </div>
  )
}