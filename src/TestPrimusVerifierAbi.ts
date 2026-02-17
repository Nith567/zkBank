export const TestPrimusVerifierAbi = [
  "function testBasic() external returns (bool)",
  "function testAttestation(tuple(address recipient, string data, string extendedData, uint256 timestamp, bytes[] signatures, tuple(address attestorAddr, string url)[] attestors) attestation) external returns (bool)",
  "function lastVerificationResult() external view returns (bool)",
  "function verificationCount() external view returns (uint256)"
];
