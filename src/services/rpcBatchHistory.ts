import {
    decodeFunctionData,
    formatUnits,
} from 'viem'

import {
    batchPaymentAbi,
} from '../contracts/batchPaymentAbi'

import {
    USDC_DECIMALS,
} from '../config/tokens'

import {
    arcRpcUrl,
} from '../config/wagmi'

import type {
    RecentBatch,
} from '../hooks/useRecentBatches'

const MAX_BATCHES =
    50

const MAX_TRANSFER_PAGES =
    5

type RpcResponse<T> = {
    jsonrpc: string
    id: number

    result?: T

    error?: {
        code: number
        message: string
    }
}

type AssetTransfer = {
    blockNum: `0x${string}`
    hash: `0x${string}`
    from: `0x${string}`
    to?: `0x${string}` | null

    metadata?: {
        blockTimestamp?: string
    }
}

type AssetTransfersResult = {
    transfers: AssetTransfer[]
    pageKey?: string
}

type RpcTransaction = {
    hash: `0x${string}`
    from: `0x${string}`
    to: `0x${string}` | null
    input: `0x${string}`
    blockNumber: `0x${string}` | null
}

type RpcBlock = {
    timestamp: `0x${string}`
}

/*
 * Generic JSON-RPC request.
 */
async function rpcRequest<T>(
    method: string,
    params: unknown[],
): Promise<T> {
    const response =
        await fetch(
            arcRpcUrl,
            {
                method:
                    'POST',

                headers: {
                    'Content-Type':
                        'application/json',
                },

                body:
                    JSON.stringify(
                        {
                            jsonrpc:
                                '2.0',

                            id:
                                Date.now(),

                            method,

                            params,
                        },
                    ),
            },
        )

    if (
        !response.ok
    ) {
        if (
            response.status ===
            429
        ) {
            throw new Error(
                'Alchemy rate limit reached. Please wait a moment and try again.',
            )
        }

        throw new Error(
            `RPC request failed (${response.status}).`,
        )
    }

    const data:
        RpcResponse<T> =
        await response.json()

    if (
        data.error
    ) {
        throw new Error(
            data.error.message,
        )
    }

    if (
        data.result ===
        undefined
    ) {
        throw new Error(
            'RPC returned no result.',
        )
    }

    return data.result
}

/*
 * Load all candidate transactions
 * sent by the connected wallet.
 */
async function getWalletTransfers(
    walletAddress:
        `0x${string}`,
): Promise<AssetTransfer[]> {
    const transfers:
        AssetTransfer[] =
        []

    let pageKey:
        string | undefined

    let page =
        0

    do {
        const params:
            Record<
                string,
                unknown
            > = {
            fromBlock:
                '0x0',

            toBlock:
                'latest',

            fromAddress:
                walletAddress,

            category: [
                'external',
            ],

            withMetadata:
                true,

            excludeZeroValue:
                false,

            maxCount:
                '0x64',
        }

        if (
            pageKey
        ) {
            params.pageKey =
                pageKey
        }

        const result =
            await rpcRequest<
                AssetTransfersResult
            >(
                'alchemy_getAssetTransfers',
                [
                    params,
                ],
            )

        transfers.push(
            ...result.transfers,
        )

        pageKey =
            result.pageKey

        page +=
            1
    } while (
        pageKey &&
        page <
        MAX_TRANSFER_PAGES
    )

    return transfers
}

/*
 * Get one complete transaction.
 */
async function getTransaction(
    hash:
        `0x${string}`,
): Promise<
    RpcTransaction | null
> {
    return await rpcRequest<
        RpcTransaction | null
    >(
        'eth_getTransactionByHash',
        [
            hash,
        ],
    )
}

/*
 * Get timestamp from a block.
 */
async function getBlockTimestamp(
    blockNumber:
        `0x${string}`,
): Promise<number> {
    const block =
        await rpcRequest<
            RpcBlock
        >(
            'eth_getBlockByNumber',
            [
                blockNumber,
                false,
            ],
        )

    return Number(
        BigInt(
            block.timestamp,
        ),
    )
}

/*
 * Load ArcBatch history from
 * Alchemy when Arcscan is down.
 */
export async function getRecentBatchesFromRpc(
    walletAddress:
        `0x${string}`,
): Promise<RecentBatch[]> {
    const transfers =
        await getWalletTransfers(
            walletAddress,
        )

    /*
     * Remove duplicate transaction
     * hashes before requesting tx data.
     */
    const uniqueHashes =
        Array.from(
            new Set(
                transfers.map(
                    (
                        transfer,
                    ) =>
                        transfer.hash,
                ),
            ),
        )

    const recentBatches:
        RecentBatch[] =
        []

    /*
     * Process sequentially so we do
     * not hit Alchemy with many
     * requests at the same time.
     */
    for (
        const hash of
        uniqueHashes
    ) {
        if (
            recentBatches.length >=
            MAX_BATCHES
        ) {
            break
        }

        try {
            const transaction =
                await getTransaction(
                    hash,
                )

            if (
                !transaction
            ) {
                continue
            }

            if (
                transaction.from
                    .toLowerCase() !==
                walletAddress
                    .toLowerCase()
            ) {
                continue
            }

            if (
                !transaction.to
            ) {
                continue
            }

            if (
                !transaction.input ||
                transaction.input ===
                '0x'
            ) {
                continue
            }

            const decoded =
                decodeFunctionData({
                    abi:
                        batchPaymentAbi,

                    data:
                        transaction.input,
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

            if (
                !transaction.blockNumber
            ) {
                continue
            }

            const matchingTransfer =
                transfers.find(
                    (
                        transfer,
                    ) =>
                        transfer.hash
                            .toLowerCase() ===
                        hash
                            .toLowerCase(),
                )

            let timestamp =
                0

            const metadataTimestamp =
                matchingTransfer
                    ?.metadata
                    ?.blockTimestamp

            if (
                metadataTimestamp
            ) {
                const parsed =
                    Date.parse(
                        metadataTimestamp,
                    )

                if (
                    Number.isFinite(
                        parsed,
                    )
                ) {
                    timestamp =
                        Math.floor(
                            parsed /
                            1000,
                        )
                }
            }

            /*
             * If transfer metadata
             * has no timestamp, read
             * it from the block.
             */
            if (
                timestamp ===
                0
            ) {
                timestamp =
                    await getBlockTimestamp(
                        transaction
                            .blockNumber,
                    )
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

                    timestamp,
                },
            )
        } catch (
        transactionError
        ) {
            /*
             * A transaction that cannot
             * be decoded as batchPay()
             * is simply another wallet
             * interaction.
             */
            if (
                transactionError
                instanceof Error &&
                transactionError
                    .message
                    .toLowerCase()
                    .includes(
                        'rate limit',
                    )
            ) {
                throw transactionError
            }

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

    return recentBatches.slice(
        0,
        MAX_BATCHES,
    )
}