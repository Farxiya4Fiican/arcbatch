import {
    useWaitForTransactionReceipt,
    useWriteContract,
} from 'wagmi'

import { batchPaymentAbi } from '../contracts/batchPaymentAbi'
import { BATCH_PAYMENT_ADDRESS } from '../config/contracts'
import { arcTestnet } from '../config/wagmi'

export function useBatchPayment() {
    const {
        writeContract,
        data: transactionHash,
        error: writeError,
        isPending: isWritePending,
        reset,
    } = useWriteContract()

    const {
        data: receipt,
        error: receiptError,
        isLoading: isConfirming,
        isSuccess: isConfirmed,
    } = useWaitForTransactionReceipt({
        hash: transactionHash,
        chainId: arcTestnet.id,
        confirmations: 1,
        query: {
            enabled: Boolean(transactionHash),
        },
    })

    const sendBatch = (
        recipients: readonly `0x${string}`[],
        amounts: readonly bigint[],
    ) => {
        writeContract({
            address: BATCH_PAYMENT_ADDRESS,
            abi: batchPaymentAbi,
            functionName: 'batchPay',
            args: [
                recipients,
                amounts,
            ],
            chainId: arcTestnet.id,
        })
    }

    return {
        sendBatch,

        transactionHash,
        receipt,

        error:
            writeError ??
            receiptError,

        isPending:
            isWritePending,

        isConfirming,

        isConfirmed,

        reset,
    }
}