# zkBank - Technical Documentation

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interface                          │
│                   (React + Vite + Ant Design)                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐    ┌─────────────────────────────────┐ │
│  │  Primus zkTLS   │    │      MetaMask / Web3 Wallet     │ │
│  │   Extension     │    │                                 │ │
│  └────────┬────────┘    └────────────────┬────────────────┘ │
│           │                              │                   │
│           ▼                              ▼                   │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    Base Mainnet                         ││
│  │  ┌──────────────────┐  ┌──────────────────────────────┐ ││
│  │  │ ZKTLSWalletFactory│  │      Primus Verifier         │ ││
│  │  │  0x0fb35B2102...  │  │   0xCE7cefB3B5A7eB44...      │ ││
│  │  └────────┬─────────┘  └──────────────────────────────┘ ││
│  │           │                                              ││
│  │           ▼                                              ││
│  │  ┌──────────────────┐  ┌──────────────────────────────┐ ││
│  │  │   ZKTLSWallet    │  │         Aave V3 Pool         │ ││
│  │  │  (per user)      │──│    0xA238Dd80C259a72e...     │ ││
│  │  └──────────────────┘  └──────────────────────────────┘ ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Smart Contract Architecture

### ZKTLSWalletFactory
- **Purpose**: Creates individual wallets for each email hash
- **Key Functions**:
  - `createWallet(proof)` - Creates a new wallet after zkTLS verification
  - `sendToEmail(emailHash, token, amount, note)` - Send tokens to any email
  - `claimTransfers(proof, token)` - Claim pending transfers with zkTLS proof
  - `getWallet(emailHash)` - Get wallet address for an email

### ZKTLSWallet
- **Purpose**: Individual smart contract wallet per user
- **Key Functions**:
  - `deposit(proof, token, amount)` - Deposit to Aave after zkTLS verification
  - `withdraw(proof, token, amount, to)` - Withdraw from Aave after verification
  - `getAaveBalance()` - Get current Aave position value

### Security Model
1. **Authentication**: zkTLS proof required for all sensitive operations
2. **Authorization**: Email hash binding ensures only verified owner can act
3. **Custody**: Funds held in user's own smart contract wallet (self-custodial)
4. **Verification**: Primus verifier contract validates all zkTLS proofs on-chain

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- MetaMask with ETH for gas
- [Primus Extension](https://chromewebstore.google.com/detail/primus/oeiomhmbaapihbilkfkhmlajkeegnjhe)

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/Nith567/zkBank
cd zkBank

# 2. Install dependencies
npm install

# 3. Start the frontend
npm run dev

# 4. Open http://localhost:5173
```

### Environment Variables (Optional)
```env
# For email notifications (optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
```

---

## Demo Guide

### Step 1: Setup
1. Install [Primus Extension](https://chromewebstore.google.com/detail/primus/oeiomhmbaapihbilkfkhmlajkeegnjhe)
2. Have MetaMask connected to Base Mainnet
3. Have some ETH for gas and USDC for testing

### Step 2: Create Wallet
1. Click "Start with Gmail"
2. Primus extension opens Google login
3. Complete OAuth flow
4. zkTLS proof is generated and verified
5. Your wallet is created on Base!

### Step 3: Deposit
1. Click "Deposit"
2. Enter USDC amount
3. Approve USDC spending (first time only)
4. Verify email again (fresh zkTLS proof)
5. Funds deposited to Aave, earning yield!

### Step 4: Send to Email
1. Click "Send to Email"
2. Enter recipient's email
3. Enter USDC amount
4. Approve and send
5. Recipient can claim by logging in!

### Step 5: Withdraw
1. Click "Withdraw"
2. Enter amount and destination address
3. Verify email (zkTLS proof)
4. Funds sent to your address!

---

## API Endpoints

### Email Notification Server (Optional)
```
POST /api/send-email
{
  "recipientEmail": "bob@gmail.com",
  "amount": 10,
  "note": "Happy birthday!"
}
```

---

## Testing

### Manual Testing Checklist
- [ ] Wallet creation with Gmail
- [ ] Deposit USDC to Aave
- [ ] Check Aave balance updates
- [ ] Withdraw USDC from Aave
- [ ] Send USDC to email
- [ ] Claim pending transfers

### Contract Testing
```bash
cd contracts
forge test
```

---

## Deployment

### Frontend (Vercel)
```bash
npm run build
vercel deploy
```

### Contracts (Foundry)
```bash
cd contracts
~/.foundry/bin/forge script script/Deploy.s.sol:DeployScript \
  --rpc-url base_mainnet \
  --broadcast \
  --verify
```

---

## Troubleshooting

### Common Issues

1. **"Primus extension not found"**
   - Install from: https://chromewebstore.google.com/detail/primus/oeiomhmbaapihbilkfkhmlajkeegnjhe

2. **"Email verification failed"**
   - Make sure you're logged into the correct Google account
   - Try clearing Primus extension cache

3. **"Transaction failed"**
   - Check you have enough ETH for gas
   - Check USDC approval was successful

4. **"Wrong network"**
   - Switch MetaMask to Base Mainnet (Chain ID: 8453)
