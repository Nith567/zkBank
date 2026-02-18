import { PrimusZKTLS } from "@primuslabs/zktls-js-sdk";
import { ethers } from "ethers";

// Initialize Primus SDK
const primusZKTLS = new PrimusZKTLS();

const appId = "0xdfaf27ee5a7a1a032b2e9342d680797d634f5f7a";
const appSecret = "0x66288d12f9a3acf860a451b02efd20ec447ddde487f872adb81ecb5d13947391";

if (!appId || !appSecret) {
  throw new Error("appId or appSecret is not set.");
}

await primusZKTLS.init(appId, appSecret);
console.log("✅ Primus SDK initialized");

// Format attestation for smart contract
export function formatAttestationForContract(attestation: any) {
  return {
    recipient: attestation.recipient,
    request: {
      url: attestation.request?.url || "",
      header: attestation.request?.header || "",
      method: attestation.request?.method || "",
      body: attestation.request?.body || ""
    },
    reponseResolve: (attestation.reponseResolve || attestation.responseResolve || []).map((r: any) => ({
      keyName: r.keyName || "",
      parseType: r.parseType || "",
      parsePath: r.parsePath || ""
    })),
    data: attestation.data || "",
    attConditions: attestation.attConditions || "",
    timestamp: attestation.timestamp,
    additionParams: attestation.additionParams || "",
    attestors: attestation.attestors.map((a: any) => ({
      attestorAddr: typeof a === 'string' ? a : (a.attestorAddr || a),
      url: typeof a === 'string' ? "" : (a.url || "")
    })),
    signatures: attestation.signatures.map((sig: string) => 
      sig.startsWith('0x') ? sig : '0x' + sig
    )
  };
}

// Get fresh attestation for deposit/withdraw operations
export async function getFreshAttestation(): Promise<{ attestation: any; formattedAttestation: any; email: string }> {
  const TEMPLATE_ID = "3bad8a55-4415-4bec-9b47-a4c7bbe93518";
  const BSC_MAINNET_CHAIN_ID = "0x38"; // Chain ID 56 in hex

  if (!window.ethereum) {
    throw new Error("MetaMask not installed");
  }

  let provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);

  // Switch to BSC Mainnet if needed
  const network = await provider.getNetwork();
  if (network.chainId !== 56) {
    console.log("📡 Switching to BSC Mainnet...");
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: BSC_MAINNET_CHAIN_ID }],
      });
      await new Promise(resolve => setTimeout(resolve, 500));
      provider = new ethers.providers.Web3Provider(window.ethereum);
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: BSC_MAINNET_CHAIN_ID,
            chainName: "BNB Smart Chain",
            nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
            rpcUrls: ["https://bsc-dataseed.binance.org/"],
            blockExplorerUrls: ["https://bscscan.com"],
          }],
        });
        await new Promise(resolve => setTimeout(resolve, 500));
        provider = new ethers.providers.Web3Provider(window.ethereum);
      } else {
        throw switchError;
      }
    }
  }

  const signer = provider.getSigner();
  const userAddress = await signer.getAddress();
  console.log("✅ Connected:", userAddress);

  // Generate attestation request
  const request = primusZKTLS.generateRequestParams(TEMPLATE_ID, userAddress);
  
  request.setAttConditions([
    [{ op: "REVEAL_STRING", field: "$[2]" }]
  ]);

  request.setAttMode({ algorithmType: "proxytls" });

  const requestStr = request.toJsonString();
  const signedRequestStr = await primusZKTLS.sign(requestStr);

  // Get attestation from Primus
  console.log("🔐 Requesting fresh attestation for deposit/withdraw...");
  const attestation = await primusZKTLS.startAttestation(signedRequestStr);
  console.log("✅ Fresh attestation received");

  // Verify locally
  const verifyResult = await primusZKTLS.verifyAttestation(attestation);
  if (!verifyResult) {
    throw new Error("Local attestation verification failed");
  }
  console.log("✅ Local verification passed");

  // Extract email
  const email = extractEmailUsername(attestation);
  if (!email) {
    throw new Error("Failed to extract email from attestation");
  }
  console.log("✅ Email verified:", email);

  const formattedAttestation = formatAttestationForContract(attestation);

  return { attestation, formattedAttestation, email };
}

// Helper: Extract email from attestation
export function extractEmailUsername(attestation: any): string | null {
  try {
    const attestationObj = typeof attestation === 'string' ? JSON.parse(attestation) : attestation;
    let dataStr = attestationObj.extendedData || attestationObj.data;
    
    if (dataStr) {
      const dataObj = typeof dataStr === 'string' ? JSON.parse(dataStr) : dataStr;
      const email = dataObj["2"];
      
      if (email && typeof email === 'string') {
        return email;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error extracting email:", error);
    return null;
  }
}

// AttestorTest ABI - YOUR deployed contract
const AttestorTestAbi = [
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
        "name": "attestation",
        "type": "tuple"
      }
    ],
    "name": "verifyAttestation",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
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
      { "internalType": "bytes32", "name": "emailHash", "type": "bytes32" }
    ],
    "name": "createWallet",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "emailHash", "type": "bytes32" }],
    "name": "getWallet",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "recipient", "type": "address" },
      { "indexed": true, "internalType": "bytes32", "name": "emailHash", "type": "bytes32" }
    ],
    "name": "AttestationVerified",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "emailHash", "type": "bytes32" },
      { "indexed": true, "internalType": "address", "name": "wallet", "type": "address" }
    ],
    "name": "WalletCreated",
    "type": "event"
  }
];

// Your deployed ZkTLSWalletFactory contract address
const FACTORY_ADDRESS = "0xB471fb197A092Fd8B580862775ff49f063d02F7e";

export async function primusProofTest(
  callback: (attestation: string, walletAddress: string, email: string) => void
) {
  const TEMPLATE_ID = "3bad8a55-4415-4bec-9b47-a4c7bbe93518";
  const BSC_MAINNET_CHAIN_ID = "0x38"; // Chain ID 56 in hex

  // Connect MetaMask
  if (!window.ethereum) {
    throw new Error("MetaMask not installed");
  }

  let provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);

  // Switch to BSC Mainnet if needed
  const network = await provider.getNetwork();
  if (network.chainId !== 56) {
    console.log("📡 Switching to BSC Mainnet...");
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: BSC_MAINNET_CHAIN_ID }],
      });
      await new Promise(resolve => setTimeout(resolve, 500));
      provider = new ethers.providers.Web3Provider(window.ethereum);
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: BSC_MAINNET_CHAIN_ID,
            chainName: "BNB Smart Chain",
            nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
            rpcUrls: ["https://bsc-dataseed.binance.org/"],
            blockExplorerUrls: ["https://bscscan.com"],
          }],
        });
        await new Promise(resolve => setTimeout(resolve, 500));
        provider = new ethers.providers.Web3Provider(window.ethereum);
      } else {
        throw switchError;
      }
    }
  }

  const signer = provider.getSigner();
  const userAddress = await signer.getAddress();
  console.log("✅ Connected:", userAddress);

  // Generate attestation request
  const request = primusZKTLS.generateRequestParams(TEMPLATE_ID, userAddress);
  
  request.setAttConditions([
    [
      {
        op: "REVEAL_STRING",
        field: "$[2]",
      },
    ]
  ]);

  request.setAttMode({
    algorithmType: "proxytls",
  });

  const requestStr = request.toJsonString();
  const signedRequestStr = await primusZKTLS.sign(requestStr);

  // Get attestation from Primus
  console.log("🔐 Requesting attestation...");
  const attestation = await primusZKTLS.startAttestation(signedRequestStr);
  console.log("✅ Attestation received");
  console.log("📋 Raw attestation:", JSON.stringify(attestation, null, 2));

  // Verify locally
  const verifyResult = await primusZKTLS.verifyAttestation(attestation);
  if (!verifyResult) {
    throw new Error("Local attestation verification failed");
  }
  console.log("✅ Local verification passed");

  // Extract email
  const email = extractEmailUsername(attestation);
  console.log("✅ Email:", email);
  
  if (!email) {
    throw new Error("Failed to extract email");
  }

  // Calculate email hash (same as contract does)
  const emailHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(email));
  console.log("📧 Email hash:", emailHash);

  // Format attestation for smart contract (using shared function)
  const formattedAttestation = formatAttestationForContract(attestation);

  console.log("📋 Formatted attestation:");
  console.log("  - Recipient:", formattedAttestation.recipient);
  console.log("  - Data:", formattedAttestation.data);
  console.log("  - Timestamp:", formattedAttestation.timestamp);
  console.log("  - Attestors:", formattedAttestation.attestors);

  // ✅ Connect to ZkTLSWalletFactory contract
  const factoryContract = new ethers.Contract(
    FACTORY_ADDRESS,
    AttestorTestAbi,
    signer
  );

  try {
    console.log("🧪 Step 1: Verifying attestation on-chain...");
    console.log("📍 Contract address:", FACTORY_ADDRESS);
    
    // Step 1: Verify attestation (costs gas, records on-chain)
    const verifyTx = await factoryContract.verifyAttestation(formattedAttestation);
    console.log("📤 Verify transaction sent:", verifyTx.hash);
    
    const verifyReceipt = await verifyTx.wait();
    console.log("✅ Verification confirmed in block:", verifyReceipt.blockNumber);
    
    // Check for AttestationVerified event
    const verifyEvent = verifyReceipt.events?.find((e: any) => e.event === 'AttestationVerified');
    if (verifyEvent) {
      console.log("🎉 AttestationVerified event emitted!");
      console.log("  - Recipient:", verifyEvent.args?.recipient);
      console.log("  - Email Hash:", verifyEvent.args?.emailHash);
    }

    // Step 2: Check if wallet already exists
    console.log("🔍 Step 2: Checking if wallet exists for email...");
    const existingWallet = await factoryContract.getWallet(emailHash);
    
    if (existingWallet !== ethers.constants.AddressZero) {
      console.log("✅ Wallet already exists:", existingWallet);
      console.log("🎉 SUCCESS! Email verified and wallet found!");
      callback(JSON.stringify({
        ...attestation,
        walletAddress: existingWallet,
        emailHash: emailHash
      }), existingWallet, email);
      return;
    }

    // Step 3: Create new wallet
    console.log("🏗️ Step 3: Creating new wallet for email...");
    const createTx = await factoryContract.createWallet(formattedAttestation, emailHash);
    console.log("📤 Create wallet transaction sent:", createTx.hash);
    
    const createReceipt = await createTx.wait();
    console.log("✅ Wallet created in block:", createReceipt.blockNumber);
    
    // Get wallet address from event
    const createEvent = createReceipt.events?.find((e: any) => e.event === 'WalletCreated');
    let walletAddress = ethers.constants.AddressZero;
    
    if (createEvent) {
      walletAddress = createEvent.args?.wallet;
      console.log("🎉 WalletCreated event emitted!");
      console.log("  - Email Hash:", createEvent.args?.emailHash);
      console.log("  - Wallet Address:", walletAddress);
    } else {
      // Fallback: get wallet from contract
      walletAddress = await factoryContract.getWallet(emailHash);
    }
    
    console.log("✅ On-chain verification passed!");
    console.log("🎉 SUCCESS! Primus attestation verified and wallet created!");
    console.log("📧 Email:", email);
    console.log("🔐 Email Hash:", emailHash);
    console.log("💼 Wallet Address:", walletAddress);
    
    callback(JSON.stringify({
      ...attestation,
      walletAddress: walletAddress,
      emailHash: emailHash
    }), walletAddress, email);
    
  } catch (error: any) {
    console.error("❌ On-chain operation failed:", error);
    
    if (error.data) {
      console.error("Error data:", error.data);
    }
    if (error.reason) {
      console.error("Reason:", error.reason);
    }
    if (error.message) {
      console.error("Message:", error.message);
    }
    
    throw error;
  }
}