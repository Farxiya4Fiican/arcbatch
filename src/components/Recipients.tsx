import {
    useEffect,
    useState,
} from 'react'

import {
    isAddress,
} from 'viem'

type SavedRecipient = {
    id: number
    name: string
    address: string
}

const STORAGE_KEY =
    'arcbatch-saved-recipients'

export default function Recipients() {
    const [
        recipients,
        setRecipients,
    ] = useState<SavedRecipient[]>([])

    const [
        name,
        setName,
    ] = useState('')

    const [
        address,
        setAddress,
    ] = useState('')

    const [
        error,
        setError,
    ] = useState('')

    const [
        editingId,
        setEditingId,
    ] = useState<number | null>(
        null,
    )

    useEffect(() => {
        const saved =
            localStorage.getItem(
                STORAGE_KEY,
            )

        if (!saved) {
            return
        }

        try {
            const parsed =
                JSON.parse(
                    saved,
                ) as SavedRecipient[]

            setRecipients(
                parsed,
            )
        } catch {
            localStorage.removeItem(
                STORAGE_KEY,
            )
        }
    }, [])

    const saveRecipients = (
        nextRecipients:
            SavedRecipient[],
    ) => {
        setRecipients(
            nextRecipients,
        )

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(
                nextRecipients,
            ),
        )
    }

    const resetForm = () => {
        setName('')
        setAddress('')
        setError('')
        setEditingId(
            null,
        )
    }

    const handleSaveRecipient =
        () => {
            setError('')

            if (!name.trim()) {
                setError(
                    'Recipient name is required.',
                )

                return
            }

            if (
                !isAddress(
                    address,
                )
            ) {
                setError(
                    'Enter a valid wallet address.',
                )

                return
            }

            const duplicate =
                recipients.some(
                    (
                        recipient,
                    ) =>
                        recipient.id !==
                        editingId &&
                        recipient.address
                            .toLowerCase() ===
                        address
                            .toLowerCase(),
                )

            if (duplicate) {
                setError(
                    'This wallet address is already saved.',
                )

                return
            }

            /*
             * Edit existing recipient.
             */
            if (
                editingId !== null
            ) {
                const updatedRecipients =
                    recipients.map(
                        (
                            recipient,
                        ) =>
                            recipient.id ===
                                editingId
                                ? {
                                    ...recipient,
                                    name:
                                        name.trim(),
                                    address,
                                }
                                : recipient,
                    )

                saveRecipients(
                    updatedRecipients,
                )

                resetForm()

                return
            }

            /*
             * Add new recipient.
             */
            const nextRecipient:
                SavedRecipient = {
                id: Date.now(),
                name:
                    name.trim(),
                address,
            }

            saveRecipients([
                ...recipients,
                nextRecipient,
            ])

            resetForm()
        }

    const editRecipient = (
        recipient:
            SavedRecipient,
    ) => {
        setEditingId(
            recipient.id,
        )

        setName(
            recipient.name,
        )

        setAddress(
            recipient.address,
        )

        setError('')

        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        })
    }

    const deleteRecipient = (
        recipient:
            SavedRecipient,
    ) => {
        const confirmed =
            window.confirm(
                `Delete ${recipient.name}?`,
            )

        if (!confirmed) {
            return
        }

        const nextRecipients =
            recipients.filter(
                (
                    item,
                ) =>
                    item.id !==
                    recipient.id,
            )

        saveRecipients(
            nextRecipients,
        )

        if (
            editingId ===
            recipient.id
        ) {
            resetForm()
        }
    }

    const shortenAddress = (
        value: string,
    ) => {
        return `${value.slice(
            0,
            8,
        )}...${value.slice(-6)}`
    }

    return (
        <section className="recipients-card">
            <div className="recipients-header">
                <div>
                    <div className="recipients-title-row">
                        <span className="recipients-icon">
                            ◉
                        </span>

                        <h2>
                            Recipients
                        </h2>
                    </div>

                    <p>
                        Save wallet addresses
                        for faster future batch
                        payments.
                    </p>
                </div>

                <div className="recipient-count">
                    {
                        recipients.length
                    }{' '}
                    saved
                </div>
            </div>

            <div className="recipient-form-card">
                <div className="recipient-field">
                    <label>
                        Recipient name
                    </label>

                    <input
                        type="text"
                        placeholder="e.g. Alice"
                        value={
                            name
                        }
                        onChange={(
                            event,
                        ) =>
                            setName(
                                event.target.value,
                            )
                        }
                    />
                </div>

                <div className="recipient-field">
                    <label>
                        Wallet address
                    </label>

                    <input
                        type="text"
                        placeholder="0x..."
                        value={
                            address
                        }
                        onChange={(
                            event,
                        ) =>
                            setAddress(
                                event.target.value,
                            )
                        }
                    />
                </div>

                <div className="recipient-form-actions">
                    <button
                        type="button"
                        className="recipient-add-button"
                        onClick={
                            handleSaveRecipient
                        }
                    >
                        {editingId !==
                            null
                            ? 'Save changes'
                            : '+ Add recipient'}
                    </button>

                    {editingId !==
                        null && (
                            <button
                                type="button"
                                className="recipient-cancel-button"
                                onClick={
                                    resetForm
                                }
                            >
                                Cancel
                            </button>
                        )}
                </div>
            </div>

            {error && (
                <div className="recipient-error">
                    {error}
                </div>
            )}

            {recipients.length ===
                0 ? (
                <div className="recipients-empty-state">
                    <div className="empty-recipient-icon">
                        ◎
                    </div>

                    <h3>
                        No saved recipients
                    </h3>

                    <p>
                        Add your first
                        recipient above.
                        Saved recipients
                        will appear here.
                    </p>
                </div>
            ) : (
                <div className="recipients-table">
                    <div className="recipients-table-head">
                        <span>
                            Recipient
                        </span>

                        <span>
                            Wallet address
                        </span>

                        <span>
                            Actions
                        </span>
                    </div>

                    {recipients.map(
                        (
                            recipient,
                        ) => (
                            <div
                                className="recipients-table-row"
                                key={
                                    recipient.id
                                }
                            >
                                <div className="recipient-name-cell">
                                    <div className="recipient-avatar">
                                        {
                                            recipient.name
                                                .charAt(
                                                    0,
                                                )
                                                .toUpperCase()
                                        }
                                    </div>

                                    <strong>
                                        {
                                            recipient.name
                                        }
                                    </strong>
                                </div>

                                <span className="recipient-wallet">
                                    {shortenAddress(
                                        recipient.address,
                                    )}
                                </span>

                                <div className="recipient-actions">
                                    <button
                                        type="button"
                                        className="recipient-action-button"
                                        onClick={() =>
                                            editRecipient(
                                                recipient,
                                            )
                                        }
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        className="recipient-action-button danger"
                                        onClick={() =>
                                            deleteRecipient(
                                                recipient,
                                            )
                                        }
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ),
                    )}
                </div>
            )}
        </section>
    )
}