import { useState, useEffect } from "react";
import "./App.css";
import { primusProofTest, getFreshAttestation } from "./primus";
import { Button, Typography, Alert, Card, Space, Divider, Tag, message, Input, InputNumber, Modal, List, Spin, Tooltip } from "antd";
import { JsonView } from "react-json-view-lite";
import { CopyOutlined, WalletOutlined, CheckCircleOutlined, LogoutOutlined, DollarOutlined, BankOutlined, HistoryOutlined, ReloadOutlined, ArrowUpOutlined, ArrowDownOutlined, SendOutlined, GiftOutlined } from "@ant-design/icons";
import { ethers } from "ethers";

const { Title, Text, Paragraph } = Typography;

// Storage key for persisting wallet data
const STORAGE_KEY = "zktls_wallet_data";

// ZkTLSWallet ABI for deposit/withdraw
const ZkTLSWalletAbi = [
  {
    "inputs": [],
    "name": "getAaveBalance",
    "outputs": [{ "internalType": "uint256", "name": "totalCollateral", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          { "internalType": "address", "name": "recipient", "type": "address" },
          {
            "components": [
              { "internalType": "string", "name": "url", "type": "string" },
              { "internalType": "string", "name": "header", "type": "string" },
              { "internalType": "string", "name": "method", "type": "string" },
              { "internalType": "string", "name": "body", "type": "string" }
            ],
            "internalType": "struct AttNetworkRequest",
            "name": "request",
            "type": "tuple"
          },
          {
            "components": [
              { "internalType": "string", "name": "keyName", "type": "string" },
              { "internalType": "string", "name": "parseType", "type": "string" },
              { "internalType": "string", "name": "parsePath", "type": "string" }
            ],
            "internalType": "struct AttNetworkResponseResolve[]",
            "name": "reponseResolve",
            "type": "tuple[]"
          },
          { "internalType": "string", "name": "data", "type": "string" },
          { "internalType": "string", "name": "attConditions", "type": "string" },
          { "internalType": "uint64", "name": "timestamp", "type": "uint64" },
          { "internalType": "string", "name": "additionParams", "type": "string" },
          {
            "components": [
              { "internalType": "address", "name": "attestorAddr", "type": "address" },
              { "internalType": "string", "name": "url", "type": "string" }
            ],
            "internalType": "struct Attestor[]",
            "name": "attestors",
            "type": "tuple[]"
          },
          { "internalType": "bytes[]", "name": "signatures", "type": "bytes[]" }
        ],
        "internalType": "struct Attestation",
        "name": "proof",
        "type": "tuple"
      },
      { "internalType": "address", "name": "token", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          { "internalType": "address", "name": "recipient", "type": "address" },
          {
            "components": [
              { "internalType": "string", "name": "url", "type": "string" },
              { "internalType": "string", "name": "header", "type": "string" },
              { "internalType": "string", "name": "method", "type": "string" },
              { "internalType": "string", "name": "body", "type": "string" }
            ],
            "internalType": "struct AttNetworkRequest",
            "name": "request",
            "type": "tuple"
          },
          {
            "components": [
              { "internalType": "string", "name": "keyName", "type": "string" },
              { "internalType": "string", "name": "parseType", "type": "string" },
              { "internalType": "string", "name": "parsePath", "type": "string" }
            ],
            "internalType": "struct AttNetworkResponseResolve[]",
            "name": "reponseResolve",
            "type": "tuple[]"
          },
          { "internalType": "string", "name": "data", "type": "string" },
          { "internalType": "string", "name": "attConditions", "type": "string" },
          { "internalType": "uint64", "name": "timestamp", "type": "uint64" },
          { "internalType": "string", "name": "additionParams", "type": "string" },
          {
            "components": [
              { "internalType": "address", "name": "attestorAddr", "type": "address" },
              { "internalType": "string", "name": "url", "type": "string" }
            ],
            "internalType": "struct Attestor[]",
            "name": "attestors",
            "type": "tuple[]"
          },
          { "internalType": "bytes[]", "name": "signatures", "type": "bytes[]" }
        ],
        "internalType": "struct Attestation",
        "name": "proof",
        "type": "tuple"
      },
      { "internalType": "address", "name": "token", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "address", "name": "to", "type": "address" }
    ],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// USDC Token ABI (for approve)
const ERC20Abi = [
  {
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "account", "type": "address" }
    ],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "address", "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

// Base Sepolia USDC address
const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

// Factory contract address (for send to email)
const FACTORY_ADDRESS = "0xa6B7C569cDD6Cb50F37A14dec05FE4d2858C7699";

// Factory ABI for send-to-email feature
const FactoryAbi = [
  {
    "inputs": [
      { "internalType": "bytes32", "name": "recipientEmailHash", "type": "bytes32" },
      { "internalType": "address", "name": "token", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "string", "name": "note", "type": "string" }
    ],
    "name": "sendToEmail",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "emailHash", "type": "bytes32" },
      { "internalType": "address", "name": "token", "type": "address" }
    ],
    "name": "getPendingAmount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "emailHash", "type": "bytes32" }],
    "name": "getPendingTransferCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

function App() {
  const [doingAttestation, setIsDoingAttestation] = useState(false);
  const [attestation, setAttestation] = useState({});
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState({});
  const [showRawData, setShowRawData] = useState(false);
  const [aaveBalance, setAaveBalance] = useState<string>("0");
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [withdrawAddress, setWithdrawAddress] = useState<string>("");
  const [isApproving, setIsApproving] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [allowance, setAllowance] = useState<string>("0");
  const [usdcBalance, setUsdcBalance] = useState<string>("0");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoadingTxHistory, setIsLoadingTxHistory] = useState(false);
  const [walletEthBalance, setWalletEthBalance] = useState<string>("0.000");
  const [walletUsdcBalance, setWalletUsdcBalance] = useState<string>("0.000");

  // Send to Email states
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState<string>("");
  const [sendAmount, setSendAmount] = useState<number>(0);
  const [sendNote, setSendNote] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [isApprovingForSend, setIsApprovingForSend] = useState(false);
  const [sendAllowance, setSendAllowance] = useState<string>("0");
  
  // Claim pending transfers states
  const [pendingAmount, setPendingAmount] = useState<string>("0");
  const [isClaiming, setIsClaiming] = useState(false);

  // Alchemy API for transaction history
  const ALCHEMY_URL = "https://base-sepolia.g.alchemy.com/v2/POcytJtZjkzStgaMseE9BxpHexaC4Tfj0";

  // Load saved wallet data on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const { walletAddress: savedWallet, email: savedEmail, attestation: savedAttestation } = JSON.parse(savedData);
        if (savedWallet && savedEmail) {
          setWalletAddress(savedWallet);
          setEmail(savedEmail);
          if (savedAttestation) setAttestation(savedAttestation);
          console.log("✅ Loaded saved wallet:", savedWallet);
        }
      } catch (e) {
        console.error("Failed to load saved wallet data:", e);
      }
    }
  }, []);

  // Fetch balances and transactions when wallet is set
  useEffect(() => {
    if (walletAddress) {
      fetchAaveBalance();
      fetchWalletBalances();
      fetchTransactionHistory();
    }
  }, [walletAddress]);

  // Check for pending transfers when email is set
  useEffect(() => {
    if (email) {
      checkPendingTransfers();
    }
  }, [email]);

  // Check if there are pending transfers for this email
  const checkPendingTransfers = async () => {
    if (!email) return;
    
    try {
      const provider = new ethers.providers.JsonRpcProvider(ALCHEMY_URL);
      const factoryContract = new ethers.Contract(FACTORY_ADDRESS, FactoryAbi, provider);
      
      const emailHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(email));
      const pending = await factoryContract.getPendingAmount(emailHash, USDC_ADDRESS);
      
      const formattedAmount = ethers.utils.formatUnits(pending, 6);
      setPendingAmount(formattedAmount);
      
      if (parseFloat(formattedAmount) > 0) {
        message.info(`🎁 You have ${parseFloat(formattedAmount).toFixed(2)} USDC waiting to be claimed!`);
      }
    } catch (e) {
      console.error("Failed to check pending transfers:", e);
    }
  };

  const fetchAaveBalance = async () => {
    if (!walletAddress) return;
    
    setIsLoadingBalance(true);
    try {
      const provider = new ethers.providers.JsonRpcProvider("https://sepolia.base.org");
      const walletContract = new ethers.Contract(walletAddress, ZkTLSWalletAbi, provider);
      const balance = await walletContract.getAaveBalance();
      // Aave returns USD value with 8 decimals, format and keep 3 decimal places
      const formatted = ethers.utils.formatUnits(balance, 8);
      setAaveBalance(parseFloat(formatted).toFixed(3));
    } catch (e) {
      console.error("Failed to fetch Aave balance:", e);
      setAaveBalance("0.000");
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Fetch wallet's ETH and USDC balances
  const fetchWalletBalances = async () => {
    if (!walletAddress) return;
    
    try {
      const provider = new ethers.providers.JsonRpcProvider(ALCHEMY_URL);
      
      // ETH balance
      const ethBal = await provider.getBalance(walletAddress);
      setWalletEthBalance(parseFloat(ethers.utils.formatEther(ethBal)).toFixed(4));
      
      // USDC balance  
      const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20Abi, provider);
      const usdcBal = await usdcContract.balanceOf(walletAddress);
      setWalletUsdcBalance(parseFloat(ethers.utils.formatUnits(usdcBal, 6)).toFixed(3));
    } catch (e) {
      console.error("Failed to fetch wallet balances:", e);
    }
  };

  // Fetch transaction history from Alchemy
  const fetchTransactionHistory = async () => {
    if (!walletAddress) return;
    
    setIsLoadingTxHistory(true);
    try {
      console.log("📜 Fetching transactions for:", walletAddress);
      
      // Get outgoing transfers
      const outgoingResponse = await fetch(ALCHEMY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'alchemy_getAssetTransfers',
          params: [{
            fromBlock: '0x0',
            toBlock: 'latest',
            fromAddress: walletAddress,
            category: ['external', 'internal', 'erc20'],
            maxCount: '0x14',
            order: 'desc',
            withMetadata: true
          }]
        })
      });
      
      // Get incoming transfers
      const incomingResponse = await fetch(ALCHEMY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'alchemy_getAssetTransfers',
          params: [{
            fromBlock: '0x0',
            toBlock: 'latest',
            toAddress: walletAddress,
            category: ['external', 'internal', 'erc20'],
            maxCount: '0x14',
            order: 'desc',
            withMetadata: true
          }]
        })
      });
      
      const outgoing = await outgoingResponse.json();
      const incoming = await incomingResponse.json();
      
      console.log("📤 Outgoing txs:", outgoing.result?.transfers?.length || 0);
      console.log("📥 Incoming txs:", incoming.result?.transfers?.length || 0);
      
      // Combine and sort by block number
      let allTxs = [
        ...(outgoing.result?.transfers || []).map((tx: any) => ({ ...tx, direction: 'out' })),
        ...(incoming.result?.transfers || []).map((tx: any) => ({ ...tx, direction: 'in' }))
      ].sort((a, b) => parseInt(b.blockNum, 16) - parseInt(a.blockNum, 16)).slice(0, 20);
      
      // If no Alchemy results, try BaseScan API as fallback
      if (allTxs.length === 0) {
        console.log("📜 Trying BaseScan API fallback...");
        const basescanResponse = await fetch(
          `https://api-sepolia.basescan.org/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&sort=desc`
        );
        const basescanData = await basescanResponse.json();
        
        if (basescanData.result && Array.isArray(basescanData.result)) {
          allTxs = basescanData.result.slice(0, 10).map((tx: any) => ({
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: ethers.utils.formatEther(tx.value || '0'),
            asset: 'ETH',
            direction: tx.from.toLowerCase() === walletAddress.toLowerCase() ? 'out' : 'in',
            blockNum: tx.blockNumber
          }));
          console.log("📜 BaseScan found:", allTxs.length, "transactions");
        }
      }
      
      console.log("📜 Total transactions:", allTxs.length, allTxs);
      setTransactions(allTxs);
    } catch (e) {
      console.error("Failed to fetch transaction history:", e);
    } finally {
      setIsLoadingTxHistory(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    message.success(`${label} copied to clipboard!`);
  };

  const saveWalletData = (wallet: string, userEmail: string, attestationData: any) => {
    const data = {
      walletAddress: wallet,
      email: userEmail,
      attestation: attestationData,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log("✅ Wallet data saved to localStorage");
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setWalletAddress("");
    setEmail("");
    setAttestation({});
    setAaveBalance("0");
    message.success("Logged out successfully!");
  };

  const startAttestation = async () => {
    if (doingAttestation) {
      return;
    }
    setAttestation({});
    setError({});
    console.log("start attestation!");

    setIsDoingAttestation(true);
    try {
      await primusProofTest((attestationData, wallet, userEmail) => {
        const parsedAttestation = JSON.parse(attestationData);
        setAttestation(parsedAttestation);
        if (wallet) setWalletAddress(wallet);
        if (userEmail) setEmail(userEmail);
        
        // Save to localStorage
        if (wallet && userEmail) {
          saveWalletData(wallet, userEmail, parsedAttestation);
        }
      });
    } catch (e: any) {
      setError(e);
    } finally {
      setIsDoingAttestation(false);
    }
  };

  // Check USDC allowance and balance when deposit modal opens
  const openDepositModal = async () => {
    setDepositModalOpen(true);
    setDepositAmount(0);
    
    if (!window.ethereum) return;
    
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();
      
      const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20Abi, provider);
      
      // Get user's USDC balance
      const balance = await usdcContract.balanceOf(userAddress);
      setUsdcBalance(ethers.utils.formatUnits(balance, 6)); // USDC has 6 decimals
      
      // Get current allowance
      const currentAllowance = await usdcContract.allowance(userAddress, walletAddress);
      setAllowance(ethers.utils.formatUnits(currentAllowance, 6));
      
    } catch (e) {
      console.error("Failed to fetch USDC info:", e);
    }
  };

  // Approve USDC spending
  const handleApprove = async () => {
    if (!window.ethereum || depositAmount <= 0) return;
    
    setIsApproving(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20Abi, signer);
      
      // Approve the zkTLS wallet to spend USDC
      const amountInWei = ethers.utils.parseUnits(depositAmount.toString(), 6);
      const tx = await usdcContract.approve(walletAddress, amountInWei);
      
      message.loading("Approving USDC...", 0);
      await tx.wait();
      message.destroy();
      message.success("USDC approved! Now you can deposit.");
      
      // Update allowance
      setAllowance(depositAmount.toString());
      
    } catch (e: any) {
      console.error("Approve failed:", e);
      message.error("Failed to approve USDC: " + (e.reason || e.message));
    } finally {
      setIsApproving(false);
    }
  };

  // Execute deposit (requires fresh zkTLS proof)
  const executeDeposit = async () => {
    if (depositAmount <= 0) {
      message.error("Please enter an amount to deposit");
      return;
    }
    
    setIsDepositing(true);
    try {
      message.loading("Step 1/2: Verifying your email with zkTLS...", 0);
      
      // Get fresh attestation
      const { formattedAttestation, email: verifiedEmail } = await getFreshAttestation();
      
      // Check email matches
      if (verifiedEmail !== email) {
        throw new Error(`Email mismatch! Expected ${email} but got ${verifiedEmail}`);
      }
      
      message.destroy();
      message.loading("Step 2/2: Depositing to Aave...", 0);
      
      // Connect to wallet contract
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const walletContract = new ethers.Contract(walletAddress, ZkTLSWalletAbi, signer);
      
      // Convert amount to USDC decimals (6)
      const amountInWei = ethers.utils.parseUnits(depositAmount.toString(), 6);
      
      // Call deposit function
      console.log("📤 Calling deposit on wallet contract...");
      console.log("  - Wallet:", walletAddress);
      console.log("  - Token (USDC):", USDC_ADDRESS);
      console.log("  - Amount:", depositAmount);
      
      const tx = await walletContract.deposit(formattedAttestation, USDC_ADDRESS, amountInWei);
      console.log("📤 Deposit tx sent:", tx.hash);
      
      await tx.wait();
      
      message.destroy();
      message.success(`🎉 Successfully deposited ${depositAmount} USDC!`);
      
      // Close modal and refresh balance
      setDepositModalOpen(false);
      setDepositAmount(0);
      fetchAaveBalance();
      
    } catch (e: any) {
      message.destroy();
      console.error("Deposit failed:", e);
      message.error("Deposit failed: " + (e.reason || e.message || "Unknown error"));
    } finally {
      setIsDepositing(false);
    }
  };

  // Execute withdraw (requires fresh zkTLS proof)
  const executeWithdraw = async () => {
    if (withdrawAmount <= 0) {
      message.error("Please enter an amount to withdraw");
      return;
    }
    if (!withdrawAddress || !ethers.utils.isAddress(withdrawAddress)) {
      message.error("Please enter a valid recipient address");
      return;
    }
    
    setIsWithdrawing(true);
    try {
      message.loading("Step 1/2: Verifying your email with zkTLS...", 0);
      
      // Get fresh attestation
      const { formattedAttestation, email: verifiedEmail } = await getFreshAttestation();
      
      // Check email matches
      if (verifiedEmail !== email) {
        throw new Error(`Email mismatch! Expected ${email} but got ${verifiedEmail}`);
      }
      
      message.destroy();
      message.loading("Step 2/2: Withdrawing from Aave...", 0);
      
      // Connect to wallet contract
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const walletContract = new ethers.Contract(walletAddress, ZkTLSWalletAbi, signer);
      
      // Convert amount to USDC decimals (6)
      const amountInWei = ethers.utils.parseUnits(withdrawAmount.toString(), 6);
      
      // Call withdraw function
      console.log("📤 Calling withdraw on wallet contract...");
      console.log("  - Wallet:", walletAddress);
      console.log("  - Token (USDC):", USDC_ADDRESS);
      console.log("  - Amount:", withdrawAmount);
      console.log("  - To:", withdrawAddress);
      
      const tx = await walletContract.withdraw(formattedAttestation, USDC_ADDRESS, amountInWei, withdrawAddress);
      console.log("📤 Withdraw tx sent:", tx.hash);
      
      await tx.wait();
      
      message.destroy();
      message.success(`🎉 Successfully withdrew ${withdrawAmount} USDC to ${withdrawAddress.slice(0, 6)}...${withdrawAddress.slice(-4)}!`);
      
      // Close modal and refresh balance
      setWithdrawModalOpen(false);
      setWithdrawAmount(0);
      setWithdrawAddress("");
      fetchAaveBalance();
      
    } catch (e: any) {
      message.destroy();
      console.error("Withdraw failed:", e);
      message.error("Withdraw failed: " + (e.reason || e.message || "Unknown error"));
    } finally {
      setIsWithdrawing(false);
    }
  };

  // ============================================
  // SEND TO EMAIL FUNCTIONS
  // ============================================
  
  // Open send modal and check allowance for factory
  const openSendModal = async () => {
    setSendModalOpen(true);
    setRecipientEmail("");
    setSendAmount(0);
    setSendNote("");
    
    if (!window.ethereum) return;
    
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();
      
      const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20Abi, provider);
      
      // Get user's USDC balance
      const balance = await usdcContract.balanceOf(userAddress);
      setUsdcBalance(ethers.utils.formatUnits(balance, 6));
      
      // Get allowance for factory contract
      const currentAllowance = await usdcContract.allowance(userAddress, FACTORY_ADDRESS);
      setSendAllowance(ethers.utils.formatUnits(currentAllowance, 6));
      
    } catch (e) {
      console.error("Failed to fetch USDC info for send:", e);
    }
  };

  // Approve USDC for factory contract (for send to email)
  const handleApproveForSend = async () => {
    if (!window.ethereum || sendAmount <= 0) return;
    
    setIsApprovingForSend(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20Abi, signer);
      
      const amountInWei = ethers.utils.parseUnits(sendAmount.toString(), 6);
      const tx = await usdcContract.approve(FACTORY_ADDRESS, amountInWei);
      
      message.loading("Approving USDC...", 0);
      await tx.wait();
      message.destroy();
      message.success("USDC approved! Now you can send.");
      
      setSendAllowance(sendAmount.toString());
      
    } catch (e: any) {
      console.error("Approve failed:", e);
      message.error("Failed to approve: " + (e.reason || e.message));
    } finally {
      setIsApprovingForSend(false);
    }
  };

  // Send USDC to an email address
  const executeSendToEmail = async () => {
    if (!recipientEmail || !recipientEmail.includes("@")) {
      message.error("Please enter a valid email address");
      return;
    }
    if (sendAmount <= 0) {
      message.error("Please enter an amount to send");
      return;
    }
    
    setIsSending(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      const factoryContract = new ethers.Contract(FACTORY_ADDRESS, FactoryAbi, signer);
      
      // Hash the recipient email
      const recipientEmailHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(recipientEmail));
      const amountInWei = ethers.utils.parseUnits(sendAmount.toString(), 6);
      
      message.loading(`Sending ${sendAmount} USDC to ${recipientEmail}...`, 0);
      
      const tx = await factoryContract.sendToEmail(
        recipientEmailHash,
        USDC_ADDRESS,
        amountInWei,
        sendNote || ""
      );
      
      console.log("📤 Send tx:", tx.hash);
      await tx.wait();
      
      message.destroy();
      message.success(`🎉 Sent ${sendAmount} USDC to ${recipientEmail}! They can claim it by logging in.`);
      
      setSendModalOpen(false);
      setRecipientEmail("");
      setSendAmount(0);
      setSendNote("");
      
      // Refresh balances
      fetchWalletBalances();
      
    } catch (e: any) {
      message.destroy();
      console.error("Send failed:", e);
      message.error("Send failed: " + (e.reason || e.message || "Unknown error"));
    } finally {
      setIsSending(false);
    }
  };

  // Claim pending transfers
  const claimPendingTransfers = async () => {
    if (parseFloat(pendingAmount) <= 0) {
      message.error("No pending transfers to claim");
      return;
    }
    
    setIsClaiming(true);
    try {
      message.loading("Step 1/2: Verifying your email with zkTLS...", 0);
      
      // Get fresh attestation
      const { formattedAttestation, email: verifiedEmail } = await getFreshAttestation();
      
      if (verifiedEmail !== email) {
        throw new Error(`Email mismatch! Expected ${email} but got ${verifiedEmail}`);
      }
      
      message.destroy();
      message.loading("Step 2/2: Claiming your USDC...", 0);
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // We need the claimTransfers ABI
      const claimAbi = [{
        "inputs": [
          {
            "components": [
              { "internalType": "address", "name": "recipient", "type": "address" },
              { "components": [
                { "internalType": "string", "name": "url", "type": "string" },
                { "internalType": "string", "name": "header", "type": "string" },
                { "internalType": "string", "name": "method", "type": "string" },
                { "internalType": "string", "name": "body", "type": "string" }
              ], "internalType": "struct AttNetworkRequest", "name": "request", "type": "tuple" },
              { "components": [
                { "internalType": "string", "name": "keyName", "type": "string" },
                { "internalType": "string", "name": "parseType", "type": "string" },
                { "internalType": "string", "name": "parsePath", "type": "string" }
              ], "internalType": "struct AttNetworkResponseResolve[]", "name": "reponseResolve", "type": "tuple[]" },
              { "internalType": "string", "name": "data", "type": "string" },
              { "internalType": "string", "name": "attConditions", "type": "string" },
              { "internalType": "uint64", "name": "timestamp", "type": "uint64" },
              { "internalType": "string", "name": "additionParams", "type": "string" },
              { "components": [
                { "internalType": "address", "name": "attestorAddr", "type": "address" },
                { "internalType": "string", "name": "url", "type": "string" }
              ], "internalType": "struct Attestor[]", "name": "attestors", "type": "tuple[]" },
              { "internalType": "bytes[]", "name": "signatures", "type": "bytes[]" }
            ],
            "internalType": "struct Attestation",
            "name": "proof",
            "type": "tuple"
          },
          { "internalType": "address", "name": "token", "type": "address" }
        ],
        "name": "claimTransfers",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }];
      
      const factoryContract = new ethers.Contract(FACTORY_ADDRESS, claimAbi, signer);
      
      const tx = await factoryContract.claimTransfers(formattedAttestation, USDC_ADDRESS);
      console.log("📤 Claim tx:", tx.hash);
      
      await tx.wait();
      
      message.destroy();
      message.success(`🎉 Successfully claimed ${pendingAmount} USDC!`);
      
      setPendingAmount("0");
      fetchWalletBalances();
      
    } catch (e: any) {
      message.destroy();
      console.error("Claim failed:", e);
      message.error("Claim failed: " + (e.reason || e.message || "Unknown error"));
    } finally {
      setIsClaiming(false);
    }
  };

  const needsApproval = parseFloat(allowance) < depositAmount;
  const needsApprovalForSend = parseFloat(sendAllowance) < sendAmount;

  // If wallet is already saved, show the dashboard
  const isLoggedIn = walletAddress && email;

  return (
    <div>
      <div className="container">
        {/* Header */}

        {/* Not logged in - Show verify button */}
        {!isLoggedIn && (
          <div style={{ marginTop: "30px", width: "100%" }}>
            {/* Main CTA Card */}
            <div className="card">
              <img src="./zkbankimg.png" alt="zkBank" style={{ width: "120px", height: "120px", marginBottom: "1rem", borderRadius: "12px" }} />
              <Text strong style={{ fontSize: "1.2rem", color: "#1a1a1a", marginBottom: "0.5rem" }}>
                A Wallet Even Your Grandma Can Use
              </Text>
              <Text type="secondary" style={{ marginBottom: "1.5rem", fontSize: "0.95rem", lineHeight: "1.5" }}>
                No seed phrases to memorize. No private keys to lose. The future of Web3 UX is accessible to billions of Gmail users.
              </Text>
              
              <Button
                type="primary"
                size="large"
                onClick={startAttestation}
                className="start-button"
                loading={doingAttestation}
                icon={<WalletOutlined />}
                style={{
                  background: "linear-gradient(135deg, #1a472a 0%, #2d6a4f 50%, #40916c 100%)",
                  borderColor: "transparent",
                  height: "50px",
                  fontSize: "16px",
                  paddingLeft: "30px",
                  paddingRight: "30px",
                  boxShadow: "0 10px 30px rgba(26, 71, 42, 0.3)",
                  borderRadius: "10px",
                  width: "100%",
                  marginBottom: "0.5rem"
                }}
              >
                {doingAttestation 
                  ? "Verifying..." 
                  : "🚀 Start with Gmail"}
              </Button>
              <Text type="secondary" style={{ marginTop: "10px", fontSize: "12px" }}>
                ✅ Seedless. ✅ Security by Google. ✅ ZKTLS
              </Text>

              {/* Trust Indicators */}
              <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid #f0f0f0", width: "100%" }}>
                <Text type="secondary" style={{ fontSize: "11px", display: "block", marginBottom: "0.8rem" }}>
                  🔒 Powered by
                </Text>
                <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", gap: "1rem" }}>
                  <Text type="secondary" style={{ fontSize: "0.85rem" }}>Primus zkTLS</Text>
                  <Text type="secondary" style={{ fontSize: "0.85rem" }}>Google Account</Text>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Logged in - Show Dashboard */}
        {isLoggedIn && (
          <Card 
            style={{ 
              marginTop: "30px", 
              backgroundColor: "#fafafa", 
              borderColor: "#d9d9d9",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "600px",
            }}
          >
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {/* User Info Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Space>
                  <Tag color="green" icon={<CheckCircleOutlined />}>Verified</Tag>
                  <Text strong>{email}</Text>
                </Space>
                <Button 
                  type="text" 
                  danger 
                  icon={<LogoutOutlined />}
                  onClick={logout}
                >
                  Logout
                </Button>
              </div>
              
              <Divider style={{ margin: "10px 0" }} />

              {/* Wallet Address */}
              <div>
                <Text type="secondary"><WalletOutlined /> Your zkTLS Wallet</Text>
                <div style={{ display: "flex", alignItems: "center", marginTop: "5px", gap: "10px" }}>
                  <Paragraph 
                    code 
                    copyable={{ 
                      text: walletAddress,
                      onCopy: () => message.success("Wallet address copied!"),
                    }}
                    style={{ margin: 0, fontSize: "12px" }}
                  >
                    {walletAddress}
                  </Paragraph>
                </div>
              </div>

              {/* Balance Card */}
              <Card 
                style={{ 
                  background: "linear-gradient(135deg, #1a472a 0%, #2d6a4f 50%, #40916c 100%)",
                  borderColor: "transparent",
                  textAlign: "center",
                  boxShadow: "0 10px 40px rgba(26, 71, 42, 0.2)",
                  color: "white"
                }}
              >
                <Text type="secondary" style={{ color: "rgba(255, 255, 255, 0.8)" }}>Aave Earnings Balance</Text>
                <Title level={2} style={{ margin: "10px 0", color: "#ffffff" }}>
                  {isLoadingBalance ? "Loading..." : `$${aaveBalance}`}
                </Title>
                <Text type="secondary" style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.7)" }}>
                  Earning yield on Aave V3
                </Text>
                <Button type="link" size="small" onClick={() => { fetchAaveBalance(); fetchWalletBalances(); }} loading={isLoadingBalance} style={{ color: "#ffffff", marginTop: "8px" }}>
                  <ReloadOutlined /> Refresh
                </Button>
              </Card>

              {/* Wallet Balances */}
              <Card size="small" style={{ backgroundColor: "#fafafa" }}>
                <Space style={{ width: "100%", justifyContent: "space-around" }}>
                  <div style={{ textAlign: "center" }}>
                    <Text type="secondary" style={{ fontSize: "12px" }}>Wallet ETH</Text>
                    <div><Text strong>{walletEthBalance} ETH</Text></div>
                  </div>
                  <Divider type="vertical" style={{ height: "40px" }} />
                  <div style={{ textAlign: "center" }}>
                    <Text type="secondary" style={{ fontSize: "12px" }}>Wallet USDC</Text>
                    <div><Text strong>{walletUsdcBalance} USDC</Text></div>
                  </div>
                </Space>
              </Card>

              {/* Action Buttons */}
              <Space style={{ width: "100%", justifyContent: "center" }} size="middle">
                <Button 
                  type="primary"
                  size="large"
                  icon={<BankOutlined />}
                  onClick={openDepositModal}
                  style={{ 
                    background: "linear-gradient(135deg, #1a472a 0%, #2d6a4f 50%, #40916c 100%)",
                    borderColor: "transparent",
                    boxShadow: "0 8px 24px rgba(26, 71, 42, 0.25)",
                    minWidth: "140px",
                    borderRadius: "8px"
                  }}
                >
                  Deposit
                </Button>
                <Button 
                  type="primary"
                  size="large"
                  icon={<DollarOutlined />}
                  onClick={() => {
                    setWithdrawModalOpen(true);
                    setWithdrawAmount(0);
                    setWithdrawAddress("");
                  }}
                  style={{ 
                    background: "linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #3a5568 100%)",
                    borderColor: "transparent",
                    boxShadow: "0 8px 24px rgba(52, 73, 94, 0.25)",
                    minWidth: "140px",
                    borderRadius: "8px"
                  }}
                >
                  Withdraw
                </Button>
                <Button 
                  type="primary"
                  size="large"
                  icon={<SendOutlined />}
                  onClick={openSendModal}
                  style={{ 
                    background: "linear-gradient(135deg, #1e3a5f 0%, #2c5aa0 50%, #3d5cc9 100%)",
                    borderColor: "transparent",
                    boxShadow: "0 8px 24px rgba(30, 58, 95, 0.25)",
                    minWidth: "140px",
                    borderRadius: "8px"
                  }}
                >
                  Send to Email
                </Button>
              </Space>

              {/* Pending Transfers Alert */}
              {parseFloat(pendingAmount) > 0 && (
                <Alert
                  message={`🎁 You have ${parseFloat(pendingAmount).toFixed(2)} USDC waiting!`}
                  description="Someone sent you USDC. Click below to claim it to your wallet."
                  type="warning"
                  showIcon
                  icon={<GiftOutlined />}
                  action={
                    <Button 
                      type="primary"
                      onClick={claimPendingTransfers}
                      loading={isClaiming}
                      style={{ 
                        background: "linear-gradient(135deg, #1a472a 0%, #2d6a4f 50%, #40916c 100%)",
                        borderColor: "transparent"
                      }}
                    >
                      {isClaiming ? "Claiming..." : "Claim USDC"}
                    </Button>
                  }
                />
              )}

              <Alert
                message="💡 Earn APR on your deposits!"
                description="Deposit USDC to earn yield through Aave V3. Only you can withdraw using your verified email."
                type="success"
                showIcon={false}
                style={{ textAlign: "center" }}
              />

              <Divider style={{ margin: "10px 0" }} />
              
              {/* Quick Actions */}
              <Space wrap style={{ justifyContent: "center" }}>
                <Button 
                  type="default"
                  icon={<CopyOutlined />}
                  onClick={() => copyToClipboard(walletAddress, "Wallet address")}
                >
                  Copy Address
                </Button>
                <Button 
                  type="link"
                  onClick={() => window.open(`https://sepolia.basescan.org/address/${walletAddress}`, "_blank")}
                >
                  View on BaseScan ↗
                </Button>
                <Button 
                  type="dashed"
                  onClick={() => setShowRawData(!showRawData)}
                >
                  {showRawData ? "Hide" : "Show"} Details
                </Button>
                <Button 
                  type="default"
                  onClick={startAttestation}
                  loading={doingAttestation}
                >
                  Re-verify Email
                </Button>
              </Space>

              {/* Transaction History */}
              <Divider style={{ margin: "15px 0 10px 0" }}>
                <Space>
                  <HistoryOutlined />
                  <Text type="secondary">Recent Transactions</Text>
                  <Button 
                    type="link" 
                    size="small" 
                    onClick={fetchTransactionHistory}
                    loading={isLoadingTxHistory}
                    style={{ padding: 0 }}
                  >
                    <ReloadOutlined />
                  </Button>
                </Space>
              </Divider>

              {isLoadingTxHistory ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <Spin size="small" />
                  <Text type="secondary" style={{ marginLeft: "10px" }}>Loading transactions...</Text>
                </div>
              ) : transactions.length > 0 ? (
                <List
                  size="small"
                  dataSource={transactions.slice(0, 5)}
                  renderItem={(tx: any) => (
                    <List.Item style={{ padding: "8px 0" }}>
                      <Space style={{ width: "100%", justifyContent: "space-between" }}>
                        <Space>
                          {tx.direction === 'in' ? (
                            <Tag color="green"><ArrowDownOutlined /> IN</Tag>
                          ) : (
                            <Tag color="red"><ArrowUpOutlined /> OUT</Tag>
                          )}
                          <Text style={{ fontSize: "12px" }}>
                            {tx.value ? parseFloat(tx.value).toFixed(4) : '0'} {tx.asset || 'ETH'}
                          </Text>
                        </Space>
                        <Tooltip title={tx.hash}>
                          <Button 
                            type="link" 
                            size="small"
                            onClick={() => window.open(`https://sepolia.basescan.org/tx/${tx.hash}`, "_blank")}
                          >
                            {tx.hash?.slice(0, 8)}... ↗
                          </Button>
                        </Tooltip>
                      </Space>
                    </List.Item>
                  )}
                />
              ) : (
                <div style={{ textAlign: "center", padding: "15px" }}>
                  <Text type="secondary">No transactions yet</Text>
                </div>
              )}
            </Space>
          </Card>
        )}

        {/* Error Display */}
        {Object.keys(error).length > 0 && (
          <Card style={{ marginTop: "20px", borderColor: "#ff4d4f", maxWidth: "600px" }}>
            <Alert
              message="❌ Verification Failed"
              description="Something went wrong during verification. Please try again."
              type="error"
              showIcon
            />
          </Card>
        )}
      </div>

      {/* Deposit Modal */}
      <Modal
        title="💰 Deposit to Earn APR"
        open={depositModalOpen}
        onCancel={() => setDepositModalOpen(false)}
        footer={null}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <Alert
            message="Earn yield on your deposits!"
            description="Your USDC will be deposited into Aave V3 to earn interest. You can withdraw anytime by verifying your email."
            type="info"
            showIcon
          />
          
          {/* USDC Balance */}
          <Card size="small" style={{ backgroundColor: "#f5f5f5" }}>
            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              <Text type="secondary">Your USDC Balance:</Text>
              <Text strong>{parseFloat(usdcBalance).toFixed(2)} USDC</Text>
            </Space>
          </Card>

          <div>
            <Text>Amount (USDC)</Text>
            <InputNumber 
              style={{ width: "100%", marginTop: "5px" }} 
              placeholder="Enter amount to deposit"
              min={0}
              max={parseFloat(usdcBalance)}
              precision={2}
              value={depositAmount}
              onChange={(val) => setDepositAmount(val || 0)}
            />
          </div>

          {/* Allowance Info */}
          {depositAmount > 0 && (
            <Card size="small" style={{ backgroundColor: needsApproval ? "#fff7e6" : "#f6ffed" }}>
              <Space style={{ width: "100%", justifyContent: "space-between" }}>
                <Text type="secondary">Current Allowance:</Text>
                <Text style={{ color: needsApproval ? "#fa8c16" : "#52c41a" }}>
                  {parseFloat(allowance).toFixed(2)} USDC
                </Text>
              </Space>
              {needsApproval && (
                <Text type="secondary" style={{ fontSize: "12px", display: "block", marginTop: "5px" }}>
                  ⚠️ You need to approve USDC first
                </Text>
              )}
            </Card>
          )}

          {/* Action Buttons */}
          <Space style={{ width: "100%", justifyContent: "flex-end", marginTop: "10px" }}>
            <Button onClick={() => setDepositModalOpen(false)}>
              Cancel
            </Button>
            
            {needsApproval ? (
              <Button 
                type="primary"
                onClick={handleApprove}
                loading={isApproving}
                disabled={depositAmount <= 0}
                style={{ 
                  background: "linear-gradient(135deg, #b8860b 0%, #daa520 100%)",
                  borderColor: "transparent"
                }}
              >
                {isApproving ? "Approving..." : "1. Approve USDC"}
              </Button>
            ) : (
              <Button 
                type="primary"
                onClick={executeDeposit}
                loading={isDepositing}
                disabled={depositAmount <= 0}
                style={{ 
                  background: "linear-gradient(135deg, #1a472a 0%, #2d6a4f 50%, #40916c 100%)",
                  borderColor: "transparent"
                }}
              >
                {isDepositing ? "Depositing..." : "2. Deposit & Verify Email"}
              </Button>
            )}
          </Space>

          <Text type="secondary" style={{ fontSize: "12px" }}>
            Note: You'll need to verify your email with a fresh zkTLS proof to authorize the deposit.
          </Text>
        </Space>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        title="💸 Withdraw Funds"
        open={withdrawModalOpen}
        onCancel={() => setWithdrawModalOpen(false)}
        footer={null}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <Alert
            message="Verify your identity to withdraw"
            description="You'll need to verify your email with a fresh zkTLS proof to authorize the withdrawal."
            type="info"
            showIcon
          />

          {/* Current Aave Balance */}
          <Card size="small" style={{ backgroundColor: "#f5f5f5" }}>
            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              <Text type="secondary">Available in Aave:</Text>
              <Text strong>${aaveBalance}</Text>
            </Space>
          </Card>

          <div>
            <Text>Amount (USDC)</Text>
            <InputNumber 
              style={{ width: "100%", marginTop: "5px" }} 
              placeholder="Enter amount to withdraw"
              min={0}
              max={parseFloat(aaveBalance)}
              precision={2}
              value={withdrawAmount}
              onChange={(val) => setWithdrawAmount(val || 0)}
            />
          </div>
          
          <div>
            <Text>Destination Address</Text>
            <Input 
              style={{ width: "100%", marginTop: "5px" }} 
              placeholder="0x..."
              value={withdrawAddress}
              onChange={(e) => setWithdrawAddress(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <Space style={{ width: "100%", justifyContent: "flex-end", marginTop: "10px" }}>
            <Button onClick={() => setWithdrawModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="primary"
              onClick={executeWithdraw}
              loading={isWithdrawing}
              disabled={withdrawAmount <= 0 || !withdrawAddress.startsWith("0x")}
              style={{ 
                background: "linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #3a5568 100%)",
                borderColor: "transparent"
              }}
            >
              {isWithdrawing ? "Verifying & Withdrawing..." : "Withdraw & Verify Email"}
            </Button>
          </Space>

          <Text type="secondary" style={{ fontSize: "12px" }}>
            Note: Funds will be sent to the destination address after email verification.
          </Text>
        </Space>
      </Modal>

      {/* Send to Email Modal */}
      <Modal
        title="📧 Send USDC to Email"
        open={sendModalOpen}
        onCancel={() => setSendModalOpen(false)}
        footer={null}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <Alert
            message="Send crypto to any email!"
            description="Recipient doesn't need a wallet yet. They can claim by verifying with Google Account."
            type="info"
            showIcon
          />
          
          {/* Your USDC Balance */}
          <Card size="small" style={{ backgroundColor: "#f5f5f5" }}>
            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              <Text type="secondary">Your USDC Balance:</Text>
              <Text strong>{parseFloat(usdcBalance).toFixed(2)} USDC</Text>
            </Space>
          </Card>

          <div>
            <Text>Recipient Email</Text>
            <Input 
              style={{ width: "100%", marginTop: "5px" }} 
              placeholder="friend@gmail.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
            />
          </div>

          <div>
            <Text>Amount (USDC)</Text>
            <InputNumber 
              style={{ width: "100%", marginTop: "5px" }} 
              placeholder="Enter amount"
              min={0}
              max={parseFloat(usdcBalance)}
              precision={2}
              value={sendAmount}
              onChange={(val) => setSendAmount(val || 0)}
            />
          </div>

          <div>
            <Text>Note (optional)</Text>
            <Input 
              style={{ width: "100%", marginTop: "5px" }} 
              placeholder="Happy birthday! 🎉"
              value={sendNote}
              onChange={(e) => setSendNote(e.target.value)}
            />
          </div>

          {/* Allowance Info */}
          {sendAmount > 0 && (
            <Card size="small" style={{ backgroundColor: needsApprovalForSend ? "#fff7e6" : "#f6ffed" }}>
              <Space style={{ width: "100%", justifyContent: "space-between" }}>
                <Text type="secondary">Factory Allowance:</Text>
                <Text style={{ color: needsApprovalForSend ? "#fa8c16" : "#52c41a" }}>
                  {parseFloat(sendAllowance).toFixed(2)} USDC
                </Text>
              </Space>
              {needsApprovalForSend && (
                <Text type="secondary" style={{ fontSize: "12px", display: "block", marginTop: "5px" }}>
                  ⚠️ You need to approve USDC first
                </Text>
              )}
            </Card>
          )}

          {/* Action Buttons */}
          <Space style={{ width: "100%", justifyContent: "flex-end", marginTop: "10px" }}>
            <Button onClick={() => setSendModalOpen(false)}>
              Cancel
            </Button>
            
            {needsApprovalForSend ? (
              <Button 
                type="primary"
                onClick={handleApproveForSend}
                loading={isApprovingForSend}
                disabled={sendAmount <= 0}
                style={{ 
                  background: "linear-gradient(135deg, #b8860b 0%, #daa520 100%)",
                  borderColor: "transparent"
                }}
              >
                {isApprovingForSend ? "Approving..." : "1. Approve USDC"}
              </Button>
            ) : (
              <Button 
                type="primary"
                onClick={executeSendToEmail}
                loading={isSending}
                disabled={sendAmount <= 0 || !recipientEmail.includes("@")}
                style={{ 
                  background: "linear-gradient(135deg, #1e3a5f 0%, #2c5aa0 50%, #3d5cc9 100%)",
                  borderColor: "transparent"
                }}
              >
                {isSending ? "Sending..." : "2. Send to Email"}
              </Button>
            )}
          </Space>

          <Text type="secondary" style={{ fontSize: "12px" }}>
            💡 Recipient will see "{(sendAmount || 0).toFixed(2)} USDC to claim" when they log in.
          </Text>
        </Space>
      </Modal>

      {/* Raw Attestation Data */}
      {showRawData && Object.keys(attestation).length > 0 && (
        <div style={{ marginTop: "20px", maxWidth: "800px", margin: "20px auto" }}>
          <Title level={5}>Raw Attestation Data</Title>
          <JsonView
            data={attestation}
            style={{
              container: "my-json-container",
            }}
          />
        </div>
      )}

      {/* Error Details */}
      {Object.keys(error).length > 0 && (
        <div style={{ marginTop: "20px", maxWidth: "800px", margin: "20px auto" }}>
          <Title level={5}>Error Details</Title>
          <JsonView
            data={error}
            style={{
              container: "my-json-container",
            }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
