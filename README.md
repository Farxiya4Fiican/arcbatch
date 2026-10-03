# ArcBatch

ArcBatch is a non-custodial batch USDC payment application built on Arc Mainnet.

It allows users to send USDC to multiple recipients in a single blockchain transaction.

Built for hackathon submission.

---

## Live Demo

https://arcbatch.vercel.app

---

## Author

**Name:** Farhia Adam

---

## Overview

Sending payments to many people one by one is slow, repetitive, and inconvenient.

ArcBatch simplifies this process by allowing users to:

- Connect a crypto wallet
- Add multiple recipients
- Enter USDC amounts
- Approve USDC
- Send all payments in one transaction
- View recent batch payment history
- Save frequently used recipients
- Import recipients from CSV

ArcBatch can be useful for:

- Teams
- Communities
- Grant programs
- Creators
- Freelancers
- Organizations
- Payroll-style distributions

---

## Problem

Organizations and individuals sometimes need to send USDC to many recipients.

Normally, this requires creating separate blockchain transactions for every recipient.

For example:

```text
Recipient 1 → Transaction 1
Recipient 2 → Transaction 2
Recipient 3 → Transaction 3
Recipient 4 → Transaction 4
```

This creates:

- More manual work
- More wallet confirmations
- More transaction overhead
- More time spent processing payments

ArcBatch combines multiple payments into one batch transaction.

```text
One transaction
      ↓
Recipient 1
Recipient 2
Recipient 3
Recipient 4
```

---

## Solution

ArcBatch uses a smart contract to process multiple USDC transfers atomically.

The user provides:

```text
Recipient address
Amount
```

for each recipient.

The frontend then calls:

```solidity
batchPay(address[] recipients, uint256[] amounts)
```

The smart contract transfers USDC directly from the sender to each recipient.

ArcBatch does not custody user funds.

---

## Main Features

### Batch USDC Payments

Send USDC to multiple recipients in one transaction.

### Dynamic Recipient Rows

Users can dynamically add and remove payment recipients.

### Saved Recipients

Users can save frequently used wallet addresses.

Saved recipients are currently stored in browser `localStorage`.

### CSV Import

Users can upload a CSV file containing recipient addresses and amounts.

Example:

```csv
address,amount
0x123...,5
0x456...,10
0x789...,2.5
```

ArcBatch validates:

- Wallet addresses
- Amounts
- Duplicate recipients
- Maximum recipient count
- USDC decimal precision
- Invalid CSV structure

### USDC Approval

ArcBatch checks the user's current USDC allowance before sending a batch.

If additional allowance is required, the user can approve the BatchPayment contract.

### Recent Batch History

ArcBatch displays recent batch payments including:

- Date
- Number of recipients
- Total USDC
- Transaction status
- Contract address
- Transaction hash

### Resilient History Loading

ArcBatch uses blockchain history services with an Alchemy RPC fallback to keep transaction history available if the primary history service is unavailable.

### Wallet Information

The application displays:

- Connected wallet
- Arc Mainnet USDC balance
- Network status
- Explorer links

### Recipient Management

Users can:

- Add saved recipients
- Edit saved recipients
- Delete saved recipients
- Select saved recipients while creating a batch

### Settings

The Settings page displays:

- Network
- Chain ID
- USDC contract
- BatchPayment contract
- Deployment block
- Connected wallet

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Wagmi
- Viem
- TanStack React Query
- CSS

### Smart Contract

- Solidity
- OpenZeppelin
- Foundry

### Blockchain

- Arc Mainnet

### Token

- USDC

### RPC

- Alchemy Arc Mainnet RPC

---

## Arc Mainnet

### Chain ID

```text
5042
```

### Network

```text
Arc Mainnet
```

### USDC Contract

```text
0x3600000000000000000000000000000000000000
```

### ERC-20 USDC Decimals

```text
6
```

### Explorer

https://explorer.arc.io

---

## Deployed BatchPayment Contract

### Contract Address

```text
0x22c989f9c4bBeABD9f6E3f50BeF1f380bfD029C4
```

### Deployment Block

```text
24013983
```

### Deployment Transaction

```text
0x8f0c959d22cb642eaf1eeb3a96651222eb6418833e8e057ffda1538a864ba84c
```

### Explorer

https://explorer.arc.io/address/0x22c989f9c4bBeABD9f6E3f50BeF1f380bfD029C4

---

## Smart Contract

The main smart contract is:

```text
contracts/src/BatchPayment.sol
```

The main function is:

```solidity
function batchPay(
    address[] calldata recipients,
    uint256[] calldata amounts
) external
```

The contract:

- Validates recipient arrays
- Rejects invalid recipient addresses
- Rejects invalid payment amounts
- Limits the maximum batch size
- Transfers USDC directly from the sender
- Uses OpenZeppelin `SafeERC20`
- Uses `ReentrancyGuard`
- Processes the batch atomically
- Emits a `BatchPaymentExecuted` event

---

## Maximum Recipients

The current smart contract supports up to:

```text
100 recipients
```

per batch transaction.

---

## Non-Custodial Design

ArcBatch is non-custodial.

The application never holds user funds.

The payment flow is:

```text
User wallet
    ↓
USDC allowance
    ↓
BatchPayment contract
    ↓
Recipients
```

Funds are transferred directly from the sender to recipients during the transaction.

---

## Project Structure

```text
arcbatch/
│
├── src/
│   ├── components/
│   ├── config/
│   ├── contracts/
│   ├── hooks/
│   ├── services/
│   ├── types/
│   ├── App.tsx
│   └── App.css
│
├── contracts/
│   ├── src/
│   │   └── BatchPayment.sol
│   ├── test/
│   └── foundry.toml
│
├── public/
├── screenshots/
├── package.json
└── README.md
```

---

## Local Development

### Requirements

Install:

- Node.js
- npm or pnpm
- MetaMask
- Foundry for smart contract development

---

## Install Dependencies

Clone the repository:

```bash
git clone https://github.com/Farxiya4Fiican/arcbatch
```

Open the project:

```bash
cd arcbatch
```

Install dependencies:

```bash
npm install
```

or:

```bash
pnpm install
```

---

## Environment Variables

Create:

```text
.env.local
```

Add:

```env
VITE_ALCHEMY_API_KEY=YOUR_ALCHEMY_API_KEY
```

Do not commit your real `.env.local` file.

---

## Run the Frontend

```bash
npm run dev
```

or:

```bash
pnpm dev
```

Then open:

```text
http://localhost:5173
```

---

## Build

```bash
npm run build
```

or:

```bash
pnpm build
```

---

## Smart Contract Development

Go to the contract directory:

```bash
cd contracts
```

Build the contracts:

```bash
forge build
```

Run the tests:

```bash
forge test
```

The BatchPayment contract includes tests for:

- Successful batch payments
- Invalid recipients
- Invalid amounts
- Empty batches
- Array length mismatch
- Insufficient allowance
- Maximum recipients
- Atomic transaction behavior

---

## How to Use ArcBatch

### 1. Connect Wallet

Connect MetaMask to Arc Mainnet.

### 2. Fund Your Wallet

Make sure the connected wallet has USDC on Arc Mainnet.

USDC is also used for transaction fees on Arc.

### 3. Add Recipients

Enter recipient wallet addresses and USDC amounts.

You can also:

- Select saved recipients
- Import recipients from CSV

### 4. Approve USDC

If required, approve the BatchPayment contract to spend the required amount of USDC.

### 5. Send Batch

Click:

```text
Send batch
```

Review and confirm the transaction in your wallet.

### 6. View History

After confirmation, the transaction appears in Recent Batches.

---

## CSV Format

Example:

```csv
address,amount
0x1111111111111111111111111111111111111111,5
0x2222222222222222222222222222222222222222,10
```

Required columns:

```text
address
amount
```

---

## Validation

ArcBatch validates:

- Ethereum-compatible addresses
- Positive amounts
- Duplicate recipients
- USDC decimal precision
- Recipient limit
- Empty rows
- Invalid CSV structure

---

## Batch History Architecture

ArcBatch uses a resilient history-loading strategy.

```text
Primary history source
        ↓
Available?
   ↓           ↓
 Yes          No
   ↓           ↓
Load       Alchemy RPC
history      fallback
                ↓
         Load transactions
                ↓
          Decode batchPay()
                ↓
          Display history
```

This improves reliability if one external history service becomes unavailable.

---

## Security

ArcBatch follows several security practices.

### Non-Custodial

The application never stores user funds.

### SafeERC20

OpenZeppelin `SafeERC20` is used for token transfers.

### ReentrancyGuard

The batch payment function is protected against reentrancy.

### Atomic Batch

If one payment in the batch fails, the entire transaction reverts.

### Maximum Batch Size

The contract limits each batch to 100 recipients.

### No Private Keys

ArcBatch never requests or stores wallet private keys.

Wallet signing is handled by the connected wallet.

---

## Current MVP Storage

Saved recipients are stored using:

```text
localStorage
```

This keeps the hackathon MVP simple and does not require a backend database.

A future version could synchronize recipient data using a cloud database.

---

## Screenshots

### Home

![ArcBatch Home](./screenshots/Home.PNG)

### Recent Batches

![Recent Batches](./screenshots/batches.PNG)

### Recipients

![Recipients](./screenshots/recipients.PNG)

### Settings

![Settings](./screenshots/settings.PNG)

---

## Future Improvements

Possible future improvements include:

- Cloud recipient synchronization
- Multiple token support
- Multiple Arc networks
- Batch templates
- Scheduled payments
- Team accounts
- Role-based access
- Payment labels
- Export transaction history
- Advanced analytics
- Recipient groups
- Gas estimation
- Batch duplication

---

## Hackathon MVP Status

Implemented:

- Wallet connection
- Arc Mainnet integration
- USDC balance
- Dynamic recipients
- Saved recipients
- CSV import
- USDC approval
- Batch payments
- Smart contract deployment
- Smart contract tests
- Recent transaction history
- Alchemy RPC integration
- Recipient management
- Settings page
- Responsive layout
- End-to-end testing

---

## Contract Address

```text
0x22c989f9c4bBeABD9f6E3f50BeF1f380bfD029C4
```

---

## Author

**Farhia Adam**

newfarxiya@gmail.com

Software Developer

---

## License

MIT