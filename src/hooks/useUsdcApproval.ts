import {
    useAccount,
    useReadContract,
    useWaitForTransactionReceipt,
    useWriteContract,
} from 'wagmi'

import { erc20Abi } from '../contracts/erc20Abi'
import { USDC_ADDRESS } from '../config/tokens'
import { BATCH_PAYMENT_ADDRESS } from '../config/contracts'
import { arcMainnet } from '../config/wagmi'

export function useUsdcApproval(requiredAmount: bigint) {
    const { address, chainId } = useAccount()

    const {
        data: allowance,
        refetch: refetchAllowance,
        isLoading: isAllowanceLoading,
    } = useReadContract({
        address: USDC_ADDRESS,
        abi: erc20Abi,
        functionName: 'allowance',
        args: address
            ? [address, BATCH_PAYMENT_ADDRESS]
            : undefined,
        chainId: arcMainnet.id,
        query: {
            enabled:
                Boolean(address) &&
                chainId === arcMainnet.id,
        },
    })

    const {
        writeContract,
        data: approvalHash,
        error: approvalError,
        isPending: isApprovalPending,
    } = useWriteContract()

    const {
        isLoading: isApprovalConfirming,
        isSuccess: isApprovalConfirmed,
    } = useWaitForTransactionReceipt({
        hash: approvalHash,
        chainId: arcMainnet.id,
        query: {
            enabled: Boolean(approvalHash),
        },
    })

    const currentAllowance = allowance ?? 0n

    const needsApproval =
        requiredAmount > currentAllowance

    const approve = () => {
        if (requiredAmount <= 0n) {
            return
        }

        writeContract({
            address: USDC_ADDRESS,
            abi: erc20Abi,
            functionName: 'approve',
            args: [
                BATCH_PAYMENT_ADDRESS,
                requiredAmount,
            ],
            chainId: arcMainnet.id,
        })
    }

    return {
        allowance: currentAllowance,
        needsApproval,

        approve,

        approvalHash,
        approvalError,

        isAllowanceLoading,
        isApprovalPending,
        isApprovalConfirming,
        isApprovalConfirmed,

        refetchAllowance,
    }
}