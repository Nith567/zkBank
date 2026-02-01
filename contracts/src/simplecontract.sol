/* // SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IPrimusZKTLS, Attestation } from "@primuslabs/zktls-contracts/src/IPrimusZKTLS.sol";

contract TestPrimusVerifier {
    IPrimusZKTLS public immutable primusVerifier;

    bool public lastVerificationResult;
    uint256 public verificationCount;

    event VerificationTested(bool result, uint256 count);
    event AttestationDetails(
        address recipient,
        uint256 timestamp,
        uint256 signaturesCount,
        uint256 attestorsCount
    );

    constructor(address _primusVerifier) {
        primusVerifier = IPrimusZKTLS(_primusVerifier);
    }

    // Simple test function
    function testAttestation(
        Attestation calldata proof
    ) external returns (bool) {
        // Emit attestation details for debugging
        emit AttestationDetails(
            proof.recipient,
            proof.timestamp,
            proof.signatures.length,
            proof.attestors.length
        );
        
        // Try verification
        try primusVerifier.verifyAttestation(proof) returns (bool result) {
            lastVerificationResult = result;
            verificationCount++;
            emit VerificationTested(result, verificationCount);
            return result;
        } catch Error(string memory reason) {
            emit VerificationTested(false, verificationCount);
            revert(string(abi.encodePacked("Verification failed: ", reason)));
        } catch (bytes memory lowLevelData) {
            emit VerificationTested(false, verificationCount);
            revert("Verification failed: low-level error");
        }
    }
    
    // Just set boolean without calling verifier (to test if contract works at all)
    function testBasic() external returns (bool) {
        lastVerificationResult = true;
        verificationCount++;
        emit VerificationTested(true, verificationCount);
        return true;
    }
} */