import {
    useCallback,
    useEffect,
    useState,
} from 'react'

import {
    decodeFunctionData,
    formatUnits,
} from 'viem'

import {
    useAccount,
} from 'wagmi'

import {
    batchPaymentAbi,
} from '../contracts/batchPaymentAbi'

import {
    USDC_DECIMALS,
} from '../config/tokens'

const ARC_SCAN_API =
    'https://api-testnet.arc-scan.org'

const MAX_BATCHES = 50

export type RecentBatch = {
    transactionHash: `0x${string}`
    blockNumber: bigint
    sender: `0x${string}`
    contractAddress: `0x${string}`
    recipientCount: number
    totalAmount: string
    timestamp: number
}

type ArcTransaction = {
    blockNumber: string
    timeStamp: string
    hash: `0x${string}`
    from: `0x${string}`
    to: `0x${string}`
    input?: `0x${string}` | ''

    isError?: string
    txreceipt_status?: string
}

type ArcTransactionsResponse = {
    status: string
    message: string

    result:
    | ArcTransaction[]
    | string
}

type RawTransaction = {
    hash?: `0x${string}`
    from?: `0x${string}`
    to?: `0x${string}`
    input?: `0x${string}`
    blockNumber?: `0x${string}`
}

type RawTransactionResponse = {
    transaction?: RawTransaction
    tx?: RawTransaction

    receipt?: {
        status?: `0x${string}`
    }
}

export function useRecentBatches() {
    const {
        address: walletAddress,
    } = useAccount()

    const [
        batches,
        setBatches,
    ] = useState<RecentBatch[]>([])

    const [
        isLoading,
        setIsLoading,
    ] = useState(true)

    const [
        error,
        setError,
    ] = useState<Error | null>(
        null,
    )

    const getRawTransaction =
        useCallback(
            async (
                hash: `0x${string}`,
            ): Promise<RawTransactionResponse> => {
                const response =
                    await fetch(
                        `${ARC_SCAN_API}/v1/txs/${hash}/raw`,
                    )

                if (!response.ok) {
                    throw new Error(
                        `Unable to load transaction ${hash}`,
                    )
                }

                return await response.json() as RawTransactionResponse
            },
            [],
        )

    const fetchBatches =
        useCallback(async () => {
            if (!walletAddress) {
                setBatches([])
                setIsLoading(false)
                return
            }

            try {
                setIsLoading(true)
                setError(null)

                /*
                 * Query ALL normal transactions
                 * for the connected wallet.
                 */
                const params =
                    new URLSearchParams({
                        module: 'account',
                        action: 'txlist',

                        address:
                            walletAddress,

                        startblock:
                            '0',

                        endblock:
                            '999999999',

                        page:
                            '1',

                        offset:
                            '200',

                        sort:
                            'desc',
                    })

                const response =
                    await fetch(
                        `${ARC_SCAN_API}/api?${params.toString()}`,
                    )

                if (!response.ok) {
                    throw new Error(
                        `Arcscan HTTP error ${response.status}`,
                    )
                }

                const data =
                    await response.json() as ArcTransactionsResponse

                if (
                    !Array.isArray(
                        data.result,
                    )
                ) {
                    if (
                        data.status === '0'
                    ) {
                        setBatches([])
                        return
                    }

                    throw new Error(
                        typeof data.result ===
                            'string'
                            ? data.result
                            : 'Invalid Arcscan response',
                    )
                }

                const recentBatches:
                    RecentBatch[] = []

                for (
                    const transaction of
                    data.result
                ) {
                    /*
                     * Only transactions SENT BY
                     * the connected wallet.
                     */
                    if (
                        transaction.from
                            .toLowerCase() !==
                        walletAddress
                            .toLowerCase()
                    ) {
                        continue
                    }

                    /*
                     * Skip failed transactions.
                     */
                    if (
                        transaction.isError ===
                        '1' ||
                        transaction
                            .txreceipt_status ===
                        '0'
                    ) {
                        continue
                    }

                    /*
                     * Contract interactions have
                     * a destination and calldata.
                     */
                    if (
                        !transaction.to
                    ) {
                        continue
                    }

                    try {
                        const raw =
                            await getRawTransaction(
                                transaction.hash,
                            )

                        const rawTx =
                            raw.transaction ??
                            raw.tx

                        if (!rawTx) {
                            continue
                        }

                        const input =
                            rawTx.input

                        if (
                            !input ||
                            input === '0x'
                        ) {
                            continue
                        }

                        /*
                         * Try to decode as ArcBatch
                         * batchPay().
                         *
                         * If the contract address changed
                         * between deployments, this still
                         * works as long as the function ABI
                         * is the same.
                         */
                        const decoded =
                            decodeFunctionData({
                                abi:
                                    batchPaymentAbi,

                                data:
                                    input,
                            })

                        if (
                            decoded.functionName !==
                            'batchPay'
                        ) {
                            continue
                        }

                        const [
                            recipients,
                            amounts,
                        ] =
                            decoded.args as readonly [
                                readonly `0x${string}`[],
                                readonly bigint[],
                            ]

                        let totalAmount =
                            0n

                        for (
                            const amount of
                            amounts
                        ) {
                            totalAmount +=
                                amount
                        }

                        recentBatches.push({
                            transactionHash:
                                transaction.hash,

                            blockNumber:
                                BigInt(
                                    transaction
                                        .blockNumber,
                                ),

                            sender:
                                transaction.from,

                            contractAddress:
                                transaction.to,

                            recipientCount:
                                recipients.length,

                            totalAmount:
                                formatUnits(
                                    totalAmount,
                                    USDC_DECIMALS,
                                ),

                            timestamp:
                                Number(
                                    transaction
                                        .timeStamp,
                                ),
                        })
                    } catch {
                        /*
                         * Not every contract interaction
                         * is an ArcBatch batchPay call.
                         * Ignore other contract methods.
                         */
                        continue
                    }
                }

                recentBatches.sort(
                    (
                        a,
                        b,
                    ) =>
                        b.timestamp -
                        a.timestamp,
                )

                setBatches(
                    recentBatches.slice(
                        0,
                        MAX_BATCHES,
                    ),
                )
            } catch (err) {
                console.error(
                    'Failed to load wallet batch history:',
                    err,
                )

                setError(
                    err instanceof Error
                        ? err
                        : new Error(
                            'Unable to load wallet batch history',
                        ),
                )
            } finally {
                setIsLoading(false)
            }
        }, [
            walletAddress,
            getRawTransaction,
        ])

    useEffect(() => {
        fetchBatches()
    }, [
        fetchBatches,
    ])

    return {
        batches,
        isLoading,
        error,

        refetch:
            fetchBatches,
    }
}