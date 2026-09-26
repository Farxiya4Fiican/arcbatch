import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import { useQueryClient } from '@tanstack/react-query'

import {
  isAddress,
  parseUnits,
} from 'viem'

import { useUsdcApproval } from '../hooks/useUsdcApproval'
import { useBatchPayment } from '../hooks/useBatchPayment'

import {
  USDC_DECIMALS,
} from '../config/tokens'

type Recipient = {
  id: number
  address: string
  amount: string
}

export default function BatchPaymentForm() {
  const queryClient = useQueryClient()

  const [recipients, setRecipients] = useState<Recipient[]>([
    {
      id: 1,
      address: '',
      amount: '',
    },
  ])

  const addRecipient = () => {
    setRecipients((current) => [
      ...current,
      {
        id: Date.now(),
        address: '',
        amount: '',
      },
    ])
  }

  const removeRecipient = (id: number) => {
    setRecipients((current) => {
      if (current.length === 1) {
        return current
      }

      return current.filter(
        (recipient) => recipient.id !== id,
      )
    })
  }

  const updateRecipient = (
    id: number,
    field: 'address' | 'amount',
    value: string,
  ) => {
    setRecipients((current) =>
      current.map((recipient) =>
        recipient.id === id
          ? {
            ...recipient,
            [field]: value,
          }
          : recipient,
      ),
    )
  }

  const hasErrors = recipients.some(
    (recipient) => {
      const amount =
        Number(recipient.amount)

      return (
        !isAddress(recipient.address) ||
        !Number.isFinite(amount) ||
        amount <= 0
      )
    },
  )

  const totalAmount = useMemo(() => {
    return recipients.reduce(
      (total, recipient) => {
        const amount =
          Number(recipient.amount)

        if (!Number.isFinite(amount)) {
          return total
        }

        return total + amount
      },
      0,
    )
  }, [recipients])

  const requiredAmount = useMemo(() => {
    try {
      return parseUnits(
        totalAmount.toFixed(
          USDC_DECIMALS,
        ),
        USDC_DECIMALS,
      )
    } catch {
      return 0n
    }
  }, [totalAmount])

  const {
    needsApproval,
    approve,

    isAllowanceLoading,

    isApprovalPending,
    isApprovalConfirming,
    isApprovalConfirmed,

    approvalError,

    refetchAllowance,
  } = useUsdcApproval(
    requiredAmount,
  )

  const {
    sendBatch,

    transactionHash,

    error: batchError,

    isPending: isBatchPending,
    isConfirming: isBatchConfirming,
    isConfirmed: isBatchConfirmed,
  } = useBatchPayment()

  /*
   * When approval is confirmed,
   * refresh the current USDC allowance.
   */
  useEffect(() => {
    if (!isApprovalConfirmed) {
      return
    }

    refetchAllowance()
  }, [
    isApprovalConfirmed,
    refetchAllowance,
  ])

  /*
   * When batch transaction is confirmed:
   *
   * 1. Refresh blockchain queries
   * 2. Refresh wallet balance
   * 3. Refresh allowance
   * 4. Reset the form
   */
  useEffect(() => {
    if (!isBatchConfirmed) {
      return
    }

    queryClient.invalidateQueries()

    refetchAllowance()

    setRecipients([
      {
        id: Date.now(),
        address: '',
        amount: '',
      },
    ])
  }, [
    isBatchConfirmed,
    queryClient,
    refetchAllowance,
  ])

  const handleBatchPayment = () => {
    if (
      hasErrors ||
      totalAmount <= 0
    ) {
      return
    }

    const recipientAddresses =
      recipients.map(
        (recipient) =>
          recipient.address as `0x${string}`,
      )

    const amounts =
      recipients.map(
        (recipient) =>
          parseUnits(
            recipient.amount,
            USDC_DECIMALS,
          ),
      )

    sendBatch(
      recipientAddresses,
      amounts,
    )
  }

  const isBusy =
    isAllowanceLoading ||
    isApprovalPending ||
    isApprovalConfirming ||
    isBatchPending ||
    isBatchConfirming

  return (
    <section className="card payment-card">
      <div className="card-header">
        <div>
          <span className="section-icon">
            ▣
          </span>

          <h2>
            New batch payment
          </h2>
        </div>
      </div>

      <div className="payment-table">
        <div className="payment-head">
          <span>#</span>

          <span>
            Recipient address
          </span>

          <span>
            Amount (USDC)
          </span>

          <span />
        </div>

        {recipients.map(
          (recipient, index) => {
            const amount =
              Number(
                recipient.amount,
              )

            const addressInvalid =
              Boolean(
                recipient.address,
              ) &&
              !isAddress(
                recipient.address,
              )

            const amountInvalid =
              Boolean(
                recipient.amount,
              ) &&
              (
                !Number.isFinite(
                  amount,
                ) ||
                amount <= 0
              )

            return (
              <div
                className="payment-row"
                key={recipient.id}
              >
                <span>
                  {index + 1}
                </span>

                <input
                  type="text"
                  placeholder="0x..."
                  value={
                    recipient.address
                  }
                  className={
                    addressInvalid
                      ? 'input-error'
                      : ''
                  }
                  onChange={(
                    event,
                  ) =>
                    updateRecipient(
                      recipient.id,
                      'address',
                      event.target.value,
                    )
                  }
                />

                <div className="amount-field">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={
                      recipient.amount
                    }
                    className={
                      amountInvalid
                        ? 'input-error'
                        : ''
                    }
                    onChange={(
                      event,
                    ) =>
                      updateRecipient(
                        recipient.id,
                        'amount',
                        event.target.value,
                      )
                    }
                  />

                  <span>
                    USDC
                  </span>
                </div>

                <button
                  type="button"
                  className="icon-button"
                  disabled={
                    recipients.length === 1 ||
                    isBusy
                  }
                  onClick={() =>
                    removeRecipient(
                      recipient.id,
                    )
                  }
                  aria-label={
                    `Remove recipient ${index + 1
                    }`
                  }
                >
                  ×
                </button>
              </div>
            )
          },
        )}
      </div>

      <div className="payment-actions">
        <div className="secondary-actions">
          <button
            type="button"
            className="outline-button"
            disabled={isBusy}
            onClick={
              addRecipient
            }
          >
            + Add recipient
          </button>

          <button
            type="button"
            className="outline-button"
            disabled={isBusy}
          >
            Import CSV
          </button>
        </div>

        <div className="totals">
          <span>
            Recipients:{' '}
            <strong>
              {
                recipients.length
              }
            </strong>
          </span>

          <span className="divider" />

          <span>
            Total:{' '}
            <strong>
              {
                totalAmount.toFixed(
                  2,
                )
              }{' '}
              USDC
            </strong>
          </span>
        </div>
      </div>

      {needsApproval &&
        !hasErrors ? (
        <button
          type="button"
          className="primary-action"
          disabled={
            isAllowanceLoading ||
            isApprovalPending ||
            isApprovalConfirming
          }
          onClick={
            approve
          }
        >
          {isApprovalPending
            ? 'Confirm approval in MetaMask...'
            : isApprovalConfirming
              ? 'Waiting for approval confirmation...'
              : `Approve ${totalAmount.toFixed(
                2,
              )} USDC`}
        </button>
      ) : (
        <button
          type="button"
          className="primary-action"
          disabled={
            hasErrors ||
            isAllowanceLoading ||
            isBatchPending ||
            isBatchConfirming
          }
          onClick={
            handleBatchPayment
          }
        >
          {isBatchPending
            ? 'Confirm in MetaMask...'
            : isBatchConfirming
              ? 'Waiting for confirmation...'
              : 'Send batch'}

          {!isBatchPending &&
            !isBatchConfirming && (
              <span>
                →
              </span>
            )}
        </button>
      )}

      {approvalError && (
        <p className="transaction-error">
          {
            approvalError.message
          }
        </p>
      )}

      {batchError && (
        <p className="transaction-error">
          {
            batchError.message
          }
        </p>
      )}

      {transactionHash &&
        !isBatchConfirmed && (
          <p className="transaction-success">
            Transaction submitted:{' '}
            {
              transactionHash.slice(
                0,
                10,
              )
            }
            ...
          </p>
        )}

      {isBatchConfirmed && (
        <p className="transaction-success">
          Batch payment confirmed
          successfully.
        </p>
      )}
    </section>
  )
}