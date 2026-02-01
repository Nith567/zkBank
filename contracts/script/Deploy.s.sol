// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/AttestorTest.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Base Sepolia addresses
        address primusVerifier = 0xCE7cefB3B5A7eB44B59F60327A53c9Ce53B0afdE;
        // Aave V3 Pool on Base Sepolia
        address aavePool = 0x07eA79F68B2B3df564D0A34F8e19D9B1e339814b;
        
        vm.startBroadcast(deployerPrivateKey);
        
        ZkTLSWalletFactory factory = new ZkTLSWalletFactory(primusVerifier, aavePool);
        
        console.log("ZkTLSWalletFactory deployed at:", address(factory));
        
        vm.stopBroadcast();
    }
}
