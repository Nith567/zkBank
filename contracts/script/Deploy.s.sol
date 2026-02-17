// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/AttestorTest.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // BNB Chain MAINNET addresses
        address primusVerifier = 0xBc074EbE6D39A97Fb35726832300a950e2D94324;
        // Aave V3 Pool on BNB Chain MAINNET
        address aavePool = 0x6807dc923806fE8Fd134338EABCA509979a7e0cB;
        
        vm.startBroadcast(deployerPrivateKey);
        
        ZkTLSWalletFactory factory = new ZkTLSWalletFactory(primusVerifier, aavePool);
        
        console.log("ZkTLSWalletFactory deployed at:", address(factory));
        
        vm.stopBroadcast();
    }
}
