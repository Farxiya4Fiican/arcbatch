import {
    useState,
} from 'react'

import {
    useRecentBatches,
} from '../hooks/useRecentBatches'

import {
    BATCH_PAYMENT_ADDRESS,
} from '../config/contracts'

const ARC_EXPLORER_URL =
    'https://explorer.arc.io'

export default function RecentBatches() {
    const {
        batches,
        isLoading,
        error,
        refetch,
    } = useRecentBatches()

    const [
        filter,
        setFilter,
    ] = useState<
        'all' |
        'current'
    >('all')

    const filteredBatches =
        filter === 'current'
            ? batches.filter(
                (batch) =>
                    batch.contractAddress
                        .toLowerCase() ===
                    BATCH_PAYMENT_ADDRESS
                        .toLowerCase(),
            )
            : batches

    const currentContractCount =
        batches.filter(
            (batch) =>
                batch.contractAddress
                    .toLowerCase() ===
                BATCH_PAYMENT_ADDRESS
                    .toLowerCase(),
        ).length

    const formatDate = (
        timestamp: number,
    ) => {
        return new Date(
            timestamp * 1000,
        ).toLocaleString()
    }

    const formatAmount = (
        amount: string,
    ) => {
        const value =
            Number(amount)

        if (!Number.isFinite(value)) {
            return amount
        }

        return value.toFixed(2)
    }

    const shortenHash = (
        hash: string,
    ) => {
        return `${hash.slice(
            0,
            8,
        )}...${hash.slice(-6)}`
    }

    const shortenAddress = (
        address: string,
    ) => {
        return `${address.slice(
            0,
            6,
        )}...${address.slice(-4)}`
    }

    return (
        <section className="card recent-card">
            <div className="card-header">
                <div>
                    <span className="section-icon">
                        ↻
                    </span>

                    <h2>
                        Recent batches
                    </h2>
                </div>

                <div className="recent-header-actions">
                    <div className="batch-filters">
                        <button
                            type="button"
                            className={
                                filter === 'all'
                                    ? 'filter-button active'
                                    : 'filter-button'
                            }
                            onClick={() =>
                                setFilter('all')
                            }
                        >
                            All batches ({batches.length})
                        </button>

                        <button
                            type="button"
                            className={
                                filter === 'current'
                                    ? 'filter-button active'
                                    : 'filter-button'
                            }
                            onClick={() =>
                                setFilter('current')
                            }
                        >
                            Current contract ({currentContractCount})
                        </button>
                    </div>

                    <button
                        type="button"
                        className="refresh-button"
                        onClick={() =>
                            refetch()
                        }
                        disabled={
                            isLoading
                        }
                    >
                        {isLoading
                            ? 'Loading...'
                            : 'Refresh'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="recent-message error">
                    <strong>
                        Unable to load recent batches.
                    </strong>

                    <div
                        style={{
                            marginTop:
                                '8px',
                            fontSize:
                                '12px',
                            overflowWrap:
                                'anywhere',
                        }}
                    >
                        {
                            error.message
                        }
                    </div>

                    <button
                        type="button"
                        className="refresh-button"
                        onClick={() =>
                            refetch()
                        }
                        style={{
                            marginTop:
                                '12px',
                        }}
                    >
                        Try again
                    </button>
                </div>
            )}

            {!error &&
                isLoading &&
                batches.length ===
                0 && (
                    <div className="recent-message">
                        Loading your
                        batch history...
                    </div>
                )}

            {!error &&
                !isLoading &&
                batches.length ===
                0 && (
                    <div className="recent-message">
                        No batch payments
                        found for this
                        wallet.
                    </div>
                )}

            {!error &&
                !isLoading &&
                batches.length >
                0 &&
                filteredBatches.length ===
                0 && (
                    <div className="recent-message">
                        No batches found
                        for the selected
                        filter.
                    </div>
                )}

            {filteredBatches.length >
                0 && (
                    <div className="recent-table-wrapper">
                        <div className="recent-table">
                            <div className="recent-head">
                                <span>
                                    Date
                                </span>

                                <span>
                                    Recipients
                                </span>

                                <span>
                                    Total (USDC)
                                </span>

                                <span>
                                    Status
                                </span>

                                <span>
                                    Contract
                                </span>

                                <span>
                                    Transaction
                                </span>
                            </div>

                            {filteredBatches.map(
                                (
                                    batch,
                                ) => (
                                    <div
                                        className="recent-row"
                                        key={
                                            batch.transactionHash
                                        }
                                    >
                                        <span>
                                            {formatDate(
                                                batch.timestamp,
                                            )}
                                        </span>

                                        <span>
                                            {
                                                batch.recipientCount
                                            }
                                        </span>

                                        <span>
                                            {formatAmount(
                                                batch.totalAmount,
                                            )}
                                        </span>

                                        <span>
                                            <span className="status-success">
                                                Confirmed
                                            </span>
                                        </span>

                                        <span>
                                            <a
                                                href={`${ARC_EXPLORER_URL}/address/${batch.contractAddress}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="transaction-link"
                                            >
                                                {shortenAddress(
                                                    batch.contractAddress,
                                                )}
                                            </a>
                                        </span>

                                        <span>
                                            <a
                                                href={`${ARC_EXPLORER_URL}/tx/${batch.transactionHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="transaction-link"
                                            >
                                                {shortenHash(
                                                    batch.transactionHash,
                                                )}
                                            </a>
                                        </span>
                                    </div>
                                ),
                            )}
                        </div>
                    </div>
                )}
        </section>
    )
}