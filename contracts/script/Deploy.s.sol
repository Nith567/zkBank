// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/AttestorTest.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // BASE Chain MAINNET addresses
        address primusVerifier = 0xCE7cefB3B5A7eB44B59F60327A53c9Ce53B0afdE;
        // Aave V3 Pool on BASE Chain MAINNET
        address aavePool = 0xA238Dd80C259a72e81d7e4664a9801593F98d1c5;
        
        vm.startBroadcast(deployerPrivateKey);
        
        ZkTLSWalletFactory factory = new ZkTLSWalletFactory(primusVerifier, aavePool);
        
        console.log("ZkTLSWalletFactory deployed at:", address(factory));
        
        vm.stopBroadcast();
    }
}
