// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Import from Primus zkTLS package
import { IPrimusZKTLS, Attestation } from "@primuslabs/zktls-contracts/src/IPrimusZKTLS.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IPool {
    function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
    function withdraw(address asset, uint256 amount, address to) external returns (uint256);
    function getUserAccountData(address user) external view returns (
        uint256 totalCollateralBase,
        uint256 totalDebtBase,
        uint256 availableBorrowsBase,
        uint256 currentLiquidationThreshold,
        uint256 ltv,
        uint256 healthFactor
    );
}

// ============================================
// Individual wallet for each user (identified by email hash)
// ============================================
contract ZkTLSWallet {
    using SafeERC20 for IERC20;
    
    bytes32 public immutable emailHash;
    address public immutable primusVerifier;
    IPool public immutable aavePool;
    
    event Deposited(address indexed token, uint256 amount);
    event Withdrawn(address indexed token, uint256 amount, address indexed to);
    
    constructor(
        bytes32 _emailHash,
        address _primusVerifier,
        address _aavePool
    ) {
        emailHash = _emailHash;
        primusVerifier = _primusVerifier;
        aavePool = IPool(_aavePool);
    }
    
    modifier onlyOwner(Attestation calldata proof) {
        // Verify the zkTLS proof on-chain using Primus
        IPrimusZKTLS(primusVerifier).verifyAttestation(proof);
        
        // Extract email hash from proof and verify ownership
        bytes32 proofEmailHash = extractEmailHash(proof);
        require(proofEmailHash == emailHash, "Unauthorized: wrong email");
        _;
    }
    
    function deposit(
        Attestation calldata proof,
        address token,
        uint256 amount
    ) external onlyOwner(proof) {
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        IERC20(token).forceApprove(address(aavePool), amount);
        aavePool.supply(token, amount, address(this), 0);
        emit Deposited(token, amount);
    }
    
    function withdraw(
        Attestation calldata proof,
        address token,
        uint256 amount,
        address to
    ) external onlyOwner(proof) {
        uint256 withdrawn = aavePool.withdraw(token, amount, to);
        emit Withdrawn(token, withdrawn, to);
    }
    
    function getAaveBalance() external view returns (uint256 totalCollateral) {
        (totalCollateral,,,,,) = aavePool.getUserAccountData(address(this));
    }
    
    /**
     * @dev Extracts email hash from proof by parsing JSON data
     * Data format: {"2":"email","2.count":"1"}
     */
    function extractEmailHash(Attestation calldata proof) internal pure returns (bytes32) {
        bytes memory data = bytes(proof.data);
        bytes memory pattern = bytes('"2":"');
        
        uint256 startPos = 0;
        bool found = false;
        
        for (uint256 i = 0; i < data.length - pattern.length; i++) {
            bool matches = true;
            for (uint256 j = 0; j < pattern.length; j++) {
                if (data[i + j] != pattern[j]) {
                    matches = false;
                    break;
                }
            }
            if (matches) {
                startPos = i + pattern.length;
                found = true;
                break;
            }
        }
        
        require(found, "Email not found in proof");
        
        uint256 endPos = startPos;
        for (uint256 i = startPos; i < data.length; i++) {
            if (data[i] == '"') {
                endPos = i;
                break;
            }
        }
        
        require(endPos > startPos, "Invalid email format");
        
        bytes memory emailBytes = new bytes(endPos - startPos);
        for (uint256 i = 0; i < endPos - startPos; i++) {
            emailBytes[i] = data[startPos + i];
        }
        
        return keccak256(emailBytes);
    }
}

// ============================================
// Factory contract - creates wallets and verifies attestations
// ============================================
contract ZkTLSWalletFactory {
    using SafeERC20 for IERC20;
    
    address public immutable primusVerifier;
    IPool public immutable aavePool;
    
    mapping(bytes32 => address) public emailToWallet;
    
    // ============================================
    // SEND TO EMAIL FEATURE
    // ============================================
    // Pending transfers: recipientEmailHash => token => total amount
    mapping(bytes32 => mapping(address => uint256)) public pendingTransfers;
    
    // Transfer details for UI
    struct PendingTransfer {
        address sender;
        address token;
        uint256 amount;
        uint256 timestamp;
        string note;
    }
    mapping(bytes32 => PendingTransfer[]) internal _pendingList;
    
    event WalletCreated(bytes32 indexed emailHash, address indexed wallet);
    event AttestationVerified(address indexed recipient, bytes32 indexed emailHash);
    event TransferSent(address indexed sender, bytes32 indexed recipientEmailHash, address token, uint256 amount, string note);
    event TransferClaimed(bytes32 indexed emailHash, address indexed claimer, address token, uint256 amount);
    
    constructor(address _primusVerifier, address _aavePool) {
        primusVerifier = _primusVerifier;
        aavePool = IPool(_aavePool);
    }
    
    /**
     * @dev Verify attestation - this triggers a transaction and emits event
     */
    function verifyAttestation(Attestation calldata attestation) external returns (bool) {
        // Call Primus verifier (will revert if invalid)
        IPrimusZKTLS(primusVerifier).verifyAttestation(attestation);
        
        // Extract email hash for logging
        bytes32 emailHash = extractEmailHash(attestation);
        
        emit AttestationVerified(attestation.recipient, emailHash);
        return true;
    }
    
    /**
     * @dev Create a new wallet for the email in the attestation
     */
    function createWallet(
        Attestation calldata proof,
        bytes32 emailHash
    ) external returns (address) {
        // Verify zkTLS proof (reverts if invalid)
        IPrimusZKTLS(primusVerifier).verifyAttestation(proof);
        
        // Verify email hash matches the proof
        bytes32 proofEmailHash = extractEmailHash(proof);
        require(proofEmailHash == emailHash, "Email hash mismatch");
        
        // Check wallet doesn't exist
        require(emailToWallet[emailHash] == address(0), "Wallet already exists");
        
        // Deploy wallet
        ZkTLSWallet wallet = new ZkTLSWallet(
            emailHash,
            primusVerifier,
            address(aavePool)
        );
        
        emailToWallet[emailHash] = address(wallet);
        
        emit WalletCreated(emailHash, address(wallet));
        return address(wallet);
    }
    
    function getWallet(bytes32 emailHash) external view returns (address) {
        return emailToWallet[emailHash];
    }
    
    // ============================================
    // SEND TO EMAIL FUNCTIONS
    // ============================================
    
    /**
     * @dev Send tokens to an email address (anyone can call, no zkTLS needed)
     * Tokens held in factory until recipient claims with zkTLS proof
     */
    function sendToEmail(
        bytes32 recipientEmailHash,
        address token,
        uint256 amount,
        string calldata note
    ) external {
        require(amount > 0, "Amount must be > 0");
        
        // Transfer tokens from sender to this contract
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        
        // Add to pending
        pendingTransfers[recipientEmailHash][token] += amount;
        
        // Store details for UI
        _pendingList[recipientEmailHash].push(PendingTransfer({
            sender: msg.sender,
            token: token,
            amount: amount,
            timestamp: block.timestamp,
            note: note
        }));
        
        emit TransferSent(msg.sender, recipientEmailHash, token, amount, note);
    }
    
    /**
     * @dev Claim pending transfers (requires zkTLS proof of email ownership)
     */
    function claimTransfers(
        Attestation calldata proof,
        address token
    ) external {
        // Verify zkTLS proof
        IPrimusZKTLS(primusVerifier).verifyAttestation(proof);
        
        // Extract email hash from proof
        bytes32 emailHash = extractEmailHash(proof);
        
        // Get pending amount
        uint256 amount = pendingTransfers[emailHash][token];
        require(amount > 0, "No pending transfers");
        
        // Clear pending
        pendingTransfers[emailHash][token] = 0;
        delete _pendingList[emailHash];
        
        // Transfer to claimer
        IERC20(token).safeTransfer(msg.sender, amount);
        
        emit TransferClaimed(emailHash, msg.sender, token, amount);
    }
    
    /**
     * @dev View pending amount for an email hash
     */
    function getPendingAmount(bytes32 emailHash, address token) external view returns (uint256) {
        return pendingTransfers[emailHash][token];
    }
    
    /**
     * @dev View pending transfer count
     */
    function getPendingTransferCount(bytes32 emailHash) external view returns (uint256) {
        return _pendingList[emailHash].length;
    }
    
    /**
     * @dev Get pending transfer at index
     */
    function getPendingTransferAt(bytes32 emailHash, uint256 index) external view returns (
        address sender,
        address token,
        uint256 amount,
        uint256 timestamp,
        string memory note
    ) {
        require(index < _pendingList[emailHash].length, "Index out of bounds");
        PendingTransfer storage t = _pendingList[emailHash][index];
        return (t.sender, t.token, t.amount, t.timestamp, t.note);
    }
    
    /**
     * @dev Extract email hash from attestation data
     */
    function extractEmailHash(Attestation calldata proof) public pure returns (bytes32) {
        bytes memory data = bytes(proof.data);
        bytes memory pattern = bytes('"2":"');
        
        uint256 startPos = 0;
        bool found = false;
        
        for (uint256 i = 0; i < data.length - pattern.length; i++) {
            bool matches = true;
            for (uint256 j = 0; j < pattern.length; j++) {
                if (data[i + j] != pattern[j]) {
                    matches = false;
                    break;
                }
            }
            if (matches) {
                startPos = i + pattern.length;
                found = true;
                break;
            }
        }
        
        require(found, "Email not found in proof");
        
        uint256 endPos = startPos;
        for (uint256 i = startPos; i < data.length; i++) {
            if (data[i] == '"') {
                endPos = i;
                break;
            }
        }
        
        require(endPos > startPos, "Invalid email format");
        
        bytes memory emailBytes = new bytes(endPos - startPos);
        for (uint256 i = 0; i < endPos - startPos; i++) {
            emailBytes[i] = data[startPos + i];
        }
        
        return keccak256(emailBytes);
    }
}