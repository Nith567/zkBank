# zkBank - Project Overview

## Problem Statement

Web3 onboarding is fundamentally broken:

1. **Seed Phrases Are Terrifying** — Users must secure 24 random words or lose everything forever. No recovery, no second chances.

2. **Wallet Addresses Are Confusing** — 42-character hexadecimal strings are error-prone. One wrong character = funds lost forever.

3. **Idle Crypto Earns Nothing** — Billions of USDC sit in wallets earning 0% while DeFi yields exist but are too complex.

4. **Can't Pay Non-Crypto Friends** — Must convince recipients to create a wallet first, killing viral adoption.

---

## Solution

**zkBank makes your email your wallet.**

Using zkTLS (zero-knowledge TLS proofs), we cryptographically verify Gmail ownership without exposing credentials. Your Google login becomes your wallet key — no seed phrases, no private keys to manage.

### How It Works:
1. User logs into Google (normal OAuth flow)
2. zkTLS creates a zero-knowledge proof of the session
3. Proof is verified on-chain via Primus verifier contract
4. Email hash is linked to a smart contract wallet on BSC
5. User can now deposit, withdraw, send, and earn yield

---

## Impact

| Metric | Impact |
|--------|--------|
| **Target Users** | 1.8B+ Gmail users worldwide |
| **Barrier Removed** | Seed phrase complexity |
| **DeFi Access** | Auto-yield via Aave V3 |
| **P2P Payments** | Send to any email address |

### Who Benefits:
- **Crypto Newcomers** — No wallet setup, just Gmail login
- **Existing Users** — Easier way to onboard friends/family
- **DeFi Users** — Automatic yield without manual deposits
- **Businesses** — Pay employees/contractors via email

---

## Limitations & Honest Assessment

1. **Google Dependency** — Users must trust Google for authentication (but not for custody)
2. **Extension Required** — Primus browser extension needed for zkTLS proofs
3. **Email Recovery Risk** — If user loses Google account access, they lose wallet access
4. **Gas Costs** — Users still need BNB for transaction fees

---

## Roadmap

### Phase 1 (Current) ✅
- [x] zkTLS email verification
- [x] Smart contract wallet factory
- [x] Aave V3 auto-yield integration
- [x] BSC Mainnet deployment

### Phase 2 (Next)
- [ ] Email-to-email transfers (send to any Gmail)
- [ ] Email notifications for incoming funds
- [ ] Multi-token support (beyond USDC)

### Phase 3 (Future)
- [ ] Recurring payments / subscriptions
- [ ] Social recovery using trusted emails
- [ ] Mobile app with embedded zkTLS
- [ ] Multi-chain expansion (Ethereum, Polygon)

---

## Business Model (Future)

- **Freemium** — Basic features free, premium features paid
- **Yield Sharing** — Small % of Aave yields
- **B2B** — White-label solution for enterprises
