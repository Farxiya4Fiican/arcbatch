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

import {
    getRecentBatchesFromRpc,
} from '../services/rpcBatchHistory'

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

function createArcscanError(
    err: unknown,
) {
    if (
        err instanceof TypeError
    ) {
        return new Error(
            'Arcscan API is currently unreachable.',
        )
    }

    if (
        err instanceof Error
    ) {
        return err
    }

    return new Error(
        'Unable to load wallet batch history.',
    )
}

export function useRecentBatches() {
    const {
        address:
        walletAddress,
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

    /*
     * Arcscan raw transaction.
     */
    const getRawTransaction =
        useCallback(
            async (
                hash: `0x${string}`,
            ): Promise<RawTransactionResponse> => {
                let response:
                    Response

                try {
                    response =
                        await fetch(
                            `${ARC_SCAN_API}/v1/txs/${hash}/raw`,
                        )
                } catch (err) {
                    throw createArcscanError(
                        err,
                    )
                }

                if (
                    !response.ok
                ) {
                    throw new Error(
                        `Arcscan unavailable while loading transaction (${response.status}).`,
                    )
                }

                try {
                    const data:
                        RawTransactionResponse =
                        await response.json()

                    return data
                } catch {
                    throw new Error(
                        'Arcscan returned an invalid transaction response.',
                    )
                }
            },
            [],
        )

    const fetchBatches =
        useCallback(
            async () => {
                if (
                    !walletAddress
                ) {
                    setBatches([])
                    setError(null)
                    setIsLoading(
                        false,
                    )

                    return
                }

                setIsLoading(
                    true,
                )

                setError(
                    null,
                )

                try {
                    /*
                     * =================================
                     * PRIMARY SOURCE: ARCSCAN
                     * =================================
                     */

                    const params =
                        new URLSearchParams(
                            {
                                module:
                                    'account',

                                action:
                                    'txlist',

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
                            },
                        )

                    let response:
                        Response

                    try {
                        response =
                            await fetch(
                                `${ARC_SCAN_API}/api?${params.toString()}`,
                            )
                    } catch (
                    fetchError
                    ) {
                        throw createArcscanError(
                            fetchError,
                        )
                    }

                    if (
                        !response.ok
                    ) {
                        throw new Error(
                            `Arcscan API is unavailable (${response.status}).`,
                        )
                    }

                    let data:
                        ArcTransactionsResponse

                    try {
                        data =
                            await response.json()
                    } catch {
                        throw new Error(
                            'Arcscan returned an invalid response.',
                        )
                    }

                    if (
                        !Array.isArray(
                            data.result,
                        )
                    ) {
                        const resultMessage =
                            typeof data.result ===
                                'string'
                                ? data.result
                                : ''

                        const normalizedMessage =
                            resultMessage
                                .toLowerCase()

                        const noTransactions =
                            data.status ===
                            '0' &&
                            (
                                normalizedMessage
                                    .includes(
                                        'no transactions',
                                    ) ||
                                normalizedMessage
                                    .includes(
                                        'no records',
                                    ) ||
                                resultMessage ===
                                ''
                            )

                        if (
                            noTransactions
                        ) {
                            setBatches(
                                [],
                            )

                            return
                        }

                        throw new Error(
                            resultMessage ||
                            data.message ||
                            'Arcscan returned an invalid response.',
                        )
                    }

                    const recentBatches:
                        RecentBatch[] =
                        []

                    for (
                        const transaction of
                        data.result
                    ) {
                        /*
                         * Only transactions sent
                         * by connected wallet.
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
                         * Ignore failed txs.
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

                            if (
                                !rawTx
                            ) {
                                continue
                            }

                            const input =
                                rawTx.input

                            if (
                                !input ||
                                input ===
                                '0x'
                            ) {
                                continue
                            }

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
                                decoded.args

                            let totalAmount =
                                0n

                            for (
                                const amount of
                                amounts
                            ) {
                                totalAmount +=
                                    amount
                            }

                            recentBatches.push(
                                {
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
                                },
                            )
                        } catch (
                        transactionError
                        ) {
                            /*
                             * Arcscan failure should
                             * trigger RPC fallback.
                             */
                            if (
                                transactionError
                                instanceof Error &&
                                transactionError
                                    .message
                                    .toLowerCase()
                                    .includes(
                                        'arcscan',
                                    )
                            ) {
                                throw transactionError
                            }

                            /*
                             * Otherwise this was
                             * probably another contract
                             * interaction.
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

                    setError(
                        null,
                    )
                } catch (
                arcscanError
                ) {
                    /*
                     * =================================
                     * FALLBACK SOURCE: ALCHEMY RPC
                     * =================================
                     */

                    console.warn(
                        'Arcscan failed. Trying RPC fallback...',
                        arcscanError,
                    )

                    try {
                        const fallbackBatches =
                            await getRecentBatchesFromRpc(
                                walletAddress,
                            )

                        setBatches(
                            fallbackBatches,
                        )

                        setError(
                            null,
                        )


                    } catch (
                    fallbackError
                    ) {
                        console.error(
                            'Arcscan failed:',
                            arcscanError,
                        )

                        console.error(
                            'RPC fallback also failed:',
                            fallbackError,
                        )

                        setBatches(
                            [],
                        )

                        setError(
                            fallbackError instanceof
                                Error
                                ? fallbackError
                                : new Error(
                                    'Unable to load batch history from Arcscan or RPC.',
                                ),
                        )
                    }
                } finally {
                    setIsLoading(
                        false,
                    )
                }
            },
            [
                walletAddress,
                getRawTransaction,
            ],
        )

    /*
     * Initial load and
     * wallet change.
     */
    useEffect(() => {
        fetchBatches()
    }, [
        fetchBatches,
    ])

    /*
     * Automatically refresh when
     * a new batch is confirmed.
     */
    useEffect(() => {
        let retryOne:
            ReturnType<
                typeof setTimeout
            > | undefined

        let retryTwo:
            ReturnType<
                typeof setTimeout
            > | undefined

        const handleBatchCreated =
            () => {
                fetchBatches()

                retryOne =
                    setTimeout(
                        () => {
                            fetchBatches()
                        },
                        2500,
                    )

                retryTwo =
                    setTimeout(
                        () => {
                            fetchBatches()
                        },
                        6000,
                    )
            }

        window.addEventListener(
            'arcbatch-batch-created',
            handleBatchCreated,
        )

        return () => {
            window.removeEventListener(
                'arcbatch-batch-created',
                handleBatchCreated,
            )

            if (
                retryOne
            ) {
                clearTimeout(
                    retryOne,
                )
            }

            if (
                retryTwo
            ) {
                clearTimeout(
                    retryTwo,
                )
            }
        }
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