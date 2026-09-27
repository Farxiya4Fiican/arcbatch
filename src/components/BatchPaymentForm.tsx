import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  useQueryClient,
} from '@tanstack/react-query'

import {
  isAddress,
  parseUnits,
} from 'viem'

import {
  useUsdcApproval,
} from '../hooks/useUsdcApproval'

import {
  useBatchPayment,
} from '../hooks/useBatchPayment'

import {
  USDC_DECIMALS,
} from '../config/tokens'

type Recipient = {
  id: number
  address: string
  amount: string
}

export default function BatchPaymentForm() {
  const queryClient =
    useQueryClient()

  const [
    recipients,
    setRecipients,
  ] = useState<Recipient[]>([
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

  const removeRecipient = (
    id: number,
  ) => {
    setRecipients((current) => {
      if (current.length === 1) {
        return current
      }

      return current.filter(
        (recipient) =>
          recipient.id !== id,
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
  const handleCsvClick = () => {
    document
      .getElementById('csv-file-input')
      ?.click()
  }

  const handleCsvFile = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0]

    if (!file) {
      return
    }

    /*
     * Validate file type.
     */
    const isCsvFile =
      file.type === 'text/csv' ||
      file.name
        .toLowerCase()
        .endsWith('.csv')

    if (!isCsvFile) {
      alert(
        'Invalid file type. Please select a CSV file.',
      )

      event.target.value = ''
      return
    }

    const reader =
      new FileReader()

    reader.onload = () => {
      const text =
        reader.result

      if (
        typeof text !== 'string'
      ) {
        alert(
          'Unable to read the CSV file.',
        )

        event.target.value = ''
        return
      }

      /*
       * Support:
       * Windows: \r\n
       * Linux:   \n
       * Old Mac: \r
       */
      const lines =
        text
          .split(/\r\n|\n|\r/)
          .map((line) =>
            line.trim(),
          )
          .filter(
            (line) =>
              line.length > 0,
          )

      /*
       * Empty CSV.
       */
      if (
        lines.length === 0
      ) {
        alert(
          'CSV file is empty.',
        )

        event.target.value = ''
        return
      }

      /*
       * Read header first.
       *
       * Remove UTF-8 BOM if Excel
       * added one to the file.
       */
      const header =
        lines[0]
          .replace(
            /^\uFEFF/,
            '',
          )
          .toLowerCase()
          .split(',')
          .map((value) =>
            value.trim(),
          )

      const addressIndex =
        header.indexOf(
          'address',
        )

      const amountIndex =
        header.indexOf(
          'amount',
        )

      /*
       * Check columns BEFORE checking
       * whether recipient rows exist.
       */
      if (
        addressIndex === -1 ||
        amountIndex === -1
      ) {
        alert(
          'CSV must contain "address" and "amount" columns.',
        )

        event.target.value = ''
        return
      }

      /*
       * Correct header exists,
       * but there are no recipients.
       */
      if (
        lines.length === 1
      ) {
        alert(
          'CSV must contain at least one recipient row.',
        )

        event.target.value = ''
        return
      }

      const importedRecipients:
        Recipient[] = []

      const errors:
        string[] = []

      const seenAddresses =
        new Set<string>()

      /*
       * Process each CSV row.
       */
      for (
        let index = 1;
        index < lines.length;
        index++
      ) {
        const rowNumber =
          index + 1

        const columns =
          lines[index]
            .split(',')
            .map((value) =>
              value.trim(),
            )

        const address =
          columns[addressIndex] ?? ''

        const amount =
          columns[amountIndex] ?? ''

        /*
         * Address validation.
         */
        if (!address) {
          errors.push(
            `Row ${rowNumber}: wallet address is missing.`,
          )

          continue
        }

        if (
          !isAddress(
            address,
          )
        ) {
          errors.push(
            `Row ${rowNumber}: invalid wallet address.`,
          )

          continue
        }

        /*
         * Duplicate address validation.
         */
        const normalizedAddress =
          address.toLowerCase()

        if (
          seenAddresses.has(
            normalizedAddress,
          )
        ) {
          errors.push(
            `Row ${rowNumber}: duplicate wallet address.`,
          )

          continue
        }

        /*
         * Amount required.
         */
        if (!amount) {
          errors.push(
            `Row ${rowNumber}: amount is missing.`,
          )

          continue
        }

        /*
         * Only normal decimal values.
         *
         * Valid:
         * 1
         * 1.5
         * 0.25
         * 10.123456
         *
         * Invalid:
         * -1
         * abc
         * 1e5
         */
        const amountFormat =
          /^\d+(\.\d{1,6})?$/

        if (
          !amountFormat.test(
            amount,
          )
        ) {
          errors.push(
            `Row ${rowNumber}: invalid amount. Use up to 6 decimal places.`,
          )

          continue
        }

        const numericAmount =
          Number(amount)

        if (
          !Number.isFinite(
            numericAmount,
          ) ||
          numericAmount <= 0
        ) {
          errors.push(
            `Row ${rowNumber}: amount must be greater than 0.`,
          )

          continue
        }

        /*
         * Address is valid and
         * amount is valid.
         */
        seenAddresses.add(
          normalizedAddress,
        )

        importedRecipients.push({
          id:
            Date.now() +
            index,

          address,

          amount,
        })
      }

      /*
       * No valid recipients.
       */
      if (
        importedRecipients.length ===
        0
      ) {
        alert(
          errors.length > 0
            ? `No valid recipients found.\n\n${errors.join(
              '\n',
            )}`
            : 'No valid recipients found.',
        )

        event.target.value = ''
        return
      }

      /*
       * Smart contract maximum.
       */
      if (
        importedRecipients.length >
        100
      ) {
        alert(
          'A batch can contain a maximum of 100 recipients.',
        )

        event.target.value = ''
        return
      }

      /*
       * Put imported recipients
       * into the payment table.
       */
      setRecipients(
        importedRecipients,
      )

      /*
       * Some valid rows +
       * some invalid rows.
       */
      if (
        errors.length > 0
      ) {
        alert(
          `${importedRecipients.length} recipient(s) imported successfully.\n\nSome rows were skipped:\n${errors.join(
            '\n',
          )}`,
        )
      }

      /*
       * Clear input so the same
       * CSV can be selected again.
       */
      event.target.value = ''
    }

    reader.onerror = () => {
      alert(
        'Unable to read the CSV file.',
      )

      event.target.value = ''
    }

    reader.readAsText(file)
  }

  const hasErrors =
    recipients.some(
      (recipient) => {
        const amount =
          Number(
            recipient.amount,
          )

        return (
          !isAddress(
            recipient.address,
          ) ||
          !Number.isFinite(
            amount,
          ) ||
          amount <= 0
        )
      },
    )

  const totalAmount =
    useMemo(() => {
      return recipients.reduce(
        (
          total,
          recipient,
        ) => {
          const amount =
            Number(
              recipient.amount,
            )

          if (
            !Number.isFinite(
              amount,
            )
          ) {
            return total
          }

          return (
            total +
            amount
          )
        },
        0,
      )
    }, [recipients])

  const requiredAmount =
    useMemo(() => {
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

    isPending:
    isBatchPending,

    isConfirming:
    isBatchConfirming,

    isConfirmed:
    isBatchConfirmed,

    reset:
    resetBatchTransaction,
  } = useBatchPayment()

  /*
   * Refresh USDC allowance
   * after approval confirms.
   */
  useEffect(() => {
    if (
      !isApprovalConfirmed
    ) {
      return
    }

    refetchAllowance()
  }, [
    isApprovalConfirmed,
    refetchAllowance,
  ])

  /*
   * Successful batch transaction.
   *
   * Refresh blockchain data,
   * tell RecentBatches to reload,
   * then reset the form.
   */
  useEffect(() => {
    if (
      !isBatchConfirmed ||
      !transactionHash
    ) {
      return
    }

    queryClient
      .invalidateQueries()

    refetchAllowance()

    /*
     * Tell useRecentBatches()
     * that a new batch was confirmed.
     */
    window.dispatchEvent(
      new CustomEvent(
        'arcbatch-batch-created',
        {
          detail: {
            transactionHash,
          },
        },
      ),
    )

    setRecipients([
      {
        id: Date.now(),
        address: '',
        amount: '',
      },
    ])

    resetBatchTransaction()
  }, [
    isBatchConfirmed,
    transactionHash,
    queryClient,
    refetchAllowance,
    resetBatchTransaction,
  ])

  const handleBatchPayment =
    () => {
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
          <span>
            #
          </span>

          <span>
            Recipient address
          </span>

          <span>
            Amount (USDC)
          </span>

          <span />
        </div>

        {recipients.map(
          (
            recipient,
            index,
          ) => {
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
                key={
                  recipient.id
                }
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
                  disabled={
                    isBusy
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
                    disabled={
                      isBusy
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
                    recipients.length ===
                    1 ||
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
            disabled={
              isBusy
            }
            onClick={
              addRecipient
            }
          >
            + Add recipient
          </button>

          <button
            type="button"
            className="outline-button"
            disabled={
              isBusy
            }
            onClick={
              handleCsvClick
            }
          >
            Import CSV
          </button>
          <input
            id="csv-file-input"
            type="file"
            accept=".csv,text/csv"
            hidden
            onChange={
              handleCsvFile
            }
          />
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
            Transaction
            submitted:{' '}

            {
              transactionHash.slice(
                0,
                10,
              )
            }
            ...
          </p>
        )}
    </section>
  )
}