import {
    useAccount,
} from 'wagmi'

import {
    USDC_ADDRESS,
} from '../config/tokens'

import {
    arcMainnet,
} from '../config/wagmi'

import {
    BATCH_PAYMENT_ADDRESS,
    BATCH_PAYMENT_DEPLOYMENT_BLOCK,
} from '../config/contracts'

const ARC_EXPLORER_URL =
    'https://explorer.arc.io'

export default function Settings() {
    const {
        address,
        isConnected,
    } = useAccount()

    const shortenAddress = (
        value: string,
    ) => {
        return `${value.slice(
            0,
            8,
        )}...${value.slice(-6)}`
    }

    return (
        <section className="settings-page">
            <div className="settings-header">
                <div>
                    <h2>
                        Settings
                    </h2>

                    <p>
                        View ArcBatch network,
                        contract and wallet
                        configuration.
                    </p>
                </div>
            </div>

            <div className="settings-card">
                <div className="settings-card-header">
                    <div className="settings-icon">
                        ⌁
                    </div>

                    <div>
                        <h3>
                            Network
                        </h3>

                        <p>
                            Arc network configuration
                            used by ArcBatch.
                        </p>
                    </div>
                </div>

                <div className="settings-list">
                    <div className="settings-row">
                        <span>
                            Network
                        </span>

                        <strong>
                            Arc Mainnet
                        </strong>
                    </div>

                    <div className="settings-row">
                        <span>
                            Chain ID
                        </span>

                        <strong>
                            {arcMainnet.id}
                        </strong>
                    </div>

                    <div className="settings-row">
                        <span>
                            Currency
                        </span>

                        <strong>
                            USDC
                        </strong>
                    </div>

                    <div className="settings-row">
                        <span>
                            USDC contract
                        </span>

                        <code
                            title={
                                USDC_ADDRESS
                            }
                        >
                            {shortenAddress(
                                USDC_ADDRESS,
                            )}
                        </code>
                    </div>

                    <div className="settings-row">
                        <span>
                            Environment
                        </span>

                        <span className="testnet-badge">
                            Mainnet
                        </span>
                    </div>
                </div>
            </div>

            <div className="settings-card">
                <div className="settings-card-header">
                    <div className="settings-icon">
                        ▣
                    </div>

                    <div>
                        <h3>
                            BatchPayment contract
                        </h3>

                        <p>
                            Smart contract currently
                            used for ArcBatch payments.
                        </p>
                    </div>
                </div>

                <div className="settings-list">
                    <div className="settings-row">
                        <span>
                            Contract address
                        </span>

                        <code
                            title={
                                BATCH_PAYMENT_ADDRESS
                            }
                        >
                            {shortenAddress(
                                BATCH_PAYMENT_ADDRESS,
                            )}
                        </code>
                    </div>

                    <div className="settings-row">
                        <span>
                            Deployment block
                        </span>

                        <strong>
                            {BATCH_PAYMENT_DEPLOYMENT_BLOCK.toString()}
                        </strong>
                    </div>

                    <div className="settings-row">
                        <span>
                            Network
                        </span>

                        <strong>
                            Arc Mainnet
                        </strong>
                    </div>

                    <div className="settings-row">
                        <span>
                            Status
                        </span>

                        <span className="status-badge">
                            Active
                        </span>
                    </div>

                    <div className="settings-row">
                        <span>
                            Explorer
                        </span>

                        <a
                            className="settings-link"
                            href={`${ARC_EXPLORER_URL}/address/${BATCH_PAYMENT_ADDRESS}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            View contract
                        </a>
                    </div>
                </div>
            </div>

            <div className="settings-card">
                <div className="settings-card-header">
                    <div className="settings-icon">
                        ◉
                    </div>

                    <div>
                        <h3>
                            Wallet
                        </h3>

                        <p>
                            Connected wallet information
                            used by ArcBatch.
                        </p>
                    </div>
                </div>

                <div className="settings-list">
                    <div className="settings-row">
                        <span>
                            Status
                        </span>

                        {isConnected ? (
                            <span className="status-badge">
                                Connected
                            </span>
                        ) : (
                            <span>
                                Not connected
                            </span>
                        )}
                    </div>

                    <div className="settings-row">
                        <span>
                            Wallet address
                        </span>

                        <code
                            title={
                                address ?? ''
                            }
                        >
                            {address
                                ? shortenAddress(
                                    address,
                                )
                                : '—'}
                        </code>
                    </div>

                    <div className="settings-row">
                        <span>
                            Explorer
                        </span>

                        {address ? (
                            <a
                                className="settings-link"
                                href={`${ARC_EXPLORER_URL}/address/${address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View wallet
                            </a>
                        ) : (
                            <span>
                                —
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}