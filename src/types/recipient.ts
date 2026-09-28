export type SavedRecipient = {
    id: number
    name: string
    address: string
}

export const RECIPIENTS_STORAGE_KEY =
    'arcbatch-saved-recipients'