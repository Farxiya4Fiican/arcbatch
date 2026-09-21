import { useMemo, useState } from 'react'
import { isAddress } from 'viem'

type Recipient = {
  id: number
  address: string
  amount: string
}

export default function BatchPaymentForm() {
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

  const hasErrors = recipients.some((recipient) => {
    const amount = Number(recipient.amount)

    return (
      !isAddress(recipient.address) ||
      !Number.isFinite(amount) ||
      amount <= 0
    )
  })

  const totalAmount = useMemo(() => {
    return recipients.reduce((total, recipient) => {
      const amount = Number(recipient.amount)

      if (!Number.isFinite(amount)) {
        return total
      }

      return total + amount
    }, 0)
  }, [recipients])

  return (
    <section className="card payment-card">
      <div className="card-header">
        <div>
          <span className="section-icon">▣</span>
          <h2>New batch payment</h2>
        </div>
      </div>

      <div className="payment-table">
        <div className="payment-head">
          <span>#</span>
          <span>Recipient address</span>
          <span>Amount (USDC)</span>
          <span />
        </div>

        {recipients.map((recipient, index) => (
          <div
            className="payment-row"
            key={recipient.id}
          >
            <span>{index + 1}</span>

            <input
              type="text"
              placeholder="0x..."
              value={recipient.address}
              className={
                recipient.address &&
                !isAddress(recipient.address)
                  ? 'input-error'
                  : ''
              }
              onChange={(event) =>
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
                value={recipient.amount}
                className={
                  recipient.amount &&
                  Number(recipient.amount) <= 0
                    ? 'input-error'
                    : ''
                }
                onChange={(event) =>
                  updateRecipient(
                    recipient.id,
                    'amount',
                    event.target.value,
                  )
                }
              />

              <span>USDC</span>
            </div>

            <button
              type="button"
              className="icon-button"
              onClick={() =>
                removeRecipient(recipient.id)
              }
              disabled={recipients.length === 1}
              aria-label={`Remove recipient ${index + 1}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="payment-actions">
        <div className="secondary-actions">
          <button
            type="button"
            className="outline-button"
            onClick={addRecipient}
          >
            + Add recipient
          </button>

          <button
            type="button"
            className="outline-button"
          >
            Import CSV
          </button>
        </div>

        <div className="totals">
          <span>
            Recipients:{' '}
            <strong>{recipients.length}</strong>
          </span>

          <span className="divider" />

          <span>
            Total:{' '}
            <strong>
              {totalAmount.toFixed(2)} USDC
            </strong>
          </span>
        </div>
      </div>

      <button
        type="button"
        className="primary-action"
        disabled={hasErrors}
      >
        Review batch
        <span>→</span>
      </button>
    </section>
  )
}