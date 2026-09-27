import { useRecentBatches } from '../hooks/useRecentBatches'

const ARC_EXPLORER_URL =
    'https://testnet.arcscan.app'

export default function RecentBatches() {
    const {
        batches,
        isLoading,
        error,
        refetch,
    } = useRecentBatches()

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

                <button
                    type="button"
                    className="refresh-button"
                    onClick={() =>
                        refetch()
                    }
                    disabled={isLoading}
                >
                    {isLoading
                        ? 'Loading...'
                        : 'Refresh'}
                </button>
            </div>
            {error && (
                <div className="recent-message error">
                    <strong>Unable to load recent batches.</strong>

                    <div
                        style={{
                            marginTop: '8px',
                            fontSize: '12px',
                            overflowWrap: 'anywhere',
                        }}
                    >
                        {error.message}
                    </div>
                </div>
            )}

            {!error &&
                isLoading &&
                batches.length === 0 && (
                    <div className="recent-message">
                        Loading recent
                        batches...
                    </div>
                )}

            {!error &&
                !isLoading &&
                batches.length === 0 && (
                    <div className="recent-message">
                        No batch payments yet.
                    </div>
                )}

            {batches.length > 0 && (
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
                                Transaction
                            </span>
                        </div>

                        {batches.map(
                            (batch) => (
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