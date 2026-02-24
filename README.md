# 🏦 zkBank

> **Your Email is Your Wallet** — Pay anyone's email. Auto-earn Aave yields. No seed phrases. No Web3 friction.

![Base](https://img.shields.io/badge/Built%20on-Base-0052FF)
![Aave](https://img.shields.io/badge/Yield-Aave%20V3-B6509E)
![Solidity](https://img.shields.io/badge/Solidity-0.8.x-purple)
![React](https://img.shields.io/badge/React-18-61dafb)

zkBank is a self-custodial smart wallet deployed on **Base** that lets you control crypto using just your Gmail. Send USDC to any email, earn yield on Aave, and never worry about seed phrases again.

---

## 🎯 Problem Statement

Web3 onboarding is broken:
- 😰 Seed phrases are scary and easy to lose
- 🤯 Wallet addresses are confusing and error-prone  
- 📉 Idle USDC earns nothing while sitting in wallets
- 🚫 Can't send crypto to friends without their wallet address

**What if your email WAS your wallet?**

---

## 💡 Solution: Built on Base

zkBank leverages **Base (Base)** for fast, low-cost DeFi transactions:

### 🔐 Zero-Knowledge Email Verification
Using zkTLS, we cryptographically prove you own your email **without exposing any private data**. Your Gmail becomes your wallet key — no seed phrases, no private keys to manage.

### How It Works:
1. **TLS Session Proof** — zkTLS creates a zero-knowledge proof of your Google login
2. **On-Chain Attestation** — The proof is verified and recorded on Base
3. **Wallet Binding** — Your email hash is permanently linked to your smart wallet
4. **Privacy Preserved** — Your actual email is never stored on-chain

This means:
- ✅ **Self-custodial** — Only YOU can access your wallet
- ✅ **No seed phrases** — Your Google account IS your key
- ✅ **Privacy-first** — Email verified via ZK proofs, never exposed

---

## ✨ Features

### ⛓️ Base Native
- **Low gas fees** — Transactions cost fractions of a cent
- **Fast finality** — Near-instant transaction confirmations
- **Aave V3 integration** — Battle-tested DeFi on Base
- **Production ready** — Deployed on Base Mainnet

### 🔐 zkTLS Authentication
- **Zero-knowledge proof** of Gmail ownership
- No seed phrases — your email IS your wallet
- Privacy-preserving on-chain attestations
- Fully self-custodial smart contract wallet

### 💰 Auto-Yield with Aave
- Deposit USDC and **automatically earn yield**
- Powered by Aave V3 lending protocol
- Withdraw anytime with earned interest
- Your idle crypto works for you 24/7

### 📧 Pay Anyone's Email
- Send USDC to any Gmail address
- Recipient doesn't need a wallet
- They claim by simply logging in with Google
- Email notifications for incoming transfers

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        zkBank                                │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React + Vite)                                     │
│  - Google Login via zkTLS                                   │
│  - Wallet Dashboard                                          │
│  - Send/Receive USDC                                         │
├─────────────────────────────────────────────────────────────┤
│  Smart Contracts (Base Mainnet)                               │
│  - ZKTLSWalletFactory: Creates wallets for emails           │
│  - ZKTLSWallet: Individual email wallets                    │
│  - Aave Integration: Deposit/Withdraw yield                 │
├─────────────────────────────────────────────────────────────┤
│  zkTLS                                                       │
│  - Zero-knowledge email verification                        │
│  - Privacy-preserving attestations                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Blockchain** | **Base** — Fast, low-cost transactions |
| **DeFi** | **Aave V3** — Auto-yield on deposits |
| **Identity** | zkTLS — Zero-knowledge email verification |
| **Frontend** | React 18, TypeScript, Vite |
| **Smart Contracts** | Solidity, Foundry |

---

## 📜 Smart Contracts

### Deployed on Base Mainnet

| Contract | Address |
|----------|---------|
| **ZKTLSWalletFactory** | [`0x0fb35B2102821ebC9dD5eb898b634080D01a905A`](https://basescan.org/address/0x0fb35B2102821ebC9dD5eb898b634080D01a905A) |

| Contract | Description |
|----------|-------------|
| **ZKTLSWalletFactory** | Creates wallets & handles send-to-email |
| **ZKTLSWallet** | Individual smart wallet per email |
| **Aave Integration** | Deposit/withdraw with yield |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- ETH for gas fees (Base Mainnet)
- USDC on Base
- [**Primus Extension**](https://chromewebstore.google.com/detail/primus/oeiomhmbaapihbilkfkhmlajkeegnjhe) — Required for zkTLS authentication

### Installation

```bash
# Clone the repository
git clone https://github.com/Nith567/zkBank
cd zkBank

# Install dependencies
npm install

# Start the frontend
npm run dev
```

---

## 📱 How It Works

> ⚠️ **Required:** Install the [Primus Extension](https://chromewebstore.google.com/detail/primus/oeiomhmbaapihbilkfkhmlajkeegnjhe) for zkTLS authentication

### For Senders:
1. **Connect MetaMask** to Base Mainnet
2. **Login with Google** via zkTLS
3. **Deposit USDC** to your zkBank wallet
4. **Enter recipient's email** and amount
5. **Send!** — Recipient gets notified via email

### For Recipients:
1. **Receive email** saying "You got USDC!"
2. **Visit zkBank** and login with Google
3. **Click "Claim"** — funds are now in your wallet
4. **Withdraw to MetaMask** or keep earning yield on Aave

---

## 🔒 Security

- **zkTLS**: Email ownership verified with zero-knowledge proofs
- **Self-Custodial**: You control your own smart contract wallet
- **No Seed Phrases**: Your Google account is your key
- **On-Chain Attestations**: All verifications recorded on Base

---

## 🎥 Demo Flow

1. Alice wants to send $10 USDC to Bob (bob@gmail.com)
2. Alice logs into zkBank with her Google account
3. Alice enters bob@gmail.com and 10 USDC
4. Smart contract creates a pending transfer for bob@gmail.com
5. Bob receives an email: "You received 10 USDC!"
6. Bob visits zkBank and logs in with Google
7. zkTLS verifies Bob owns bob@gmail.com
8. Bob claims the 10 USDC to his newly created wallet
9. Bob can now withdraw, send to others, or earn yield on Aave!

---

## 🏆 Hackathon Track: DeFi

### 💰 Why DeFi Track?

zkBank is a **practical DeFi tool built on Base** that solves real problems:

| Criteria | How zkBank Delivers |
|----------|---------------------|
| **Yield Dashboard** | Auto-deposit to Aave V3 on Base, track earnings in real-time |
| **Usable** | Login with Gmail — no seed phrases, no complex setup |
| **Reproducible** | Open-source smart contracts, deployed on Base Mainnet |
| **No Token Required** | Uses existing USDC, no new token needed |

### Why Base?
- ⚡ **Fast & Cheap** — Sub-second blocks, minimal gas fees
- 🏦 **DeFi Ecosystem** — Aave V3, Venus, PancakeSwap integration ready
- 🌍 **Mass Adoption** — One of the most used chains globally
- 🔒 **Battle-tested** — Secure, reliable infrastructure

### Key DeFi Features:
- 📈 **Auto-Yield Generation** — All deposits automatically earn Aave V3 interest
- 💸 **Email-Based Payments** — Send USDC to any email address
- 🔐 **Self-Custodial Wallets** — Users control their own smart contract wallet
- 🔗 **Aave V3 Integration** — Battle-tested DeFi protocol for yield
- ⛓️ **Base Native** — Low fees, fast transactions

---

## 🔮 Future Roadmap

- [ ] Recurring payments / subscriptions
- [ ] Social recovery using trusted emails

---

## 📄 License

MIT License
