const StealthTransfer = artifacts.require("./StealthTransfer.sol");
const HoneyPot = artifacts.require("./HoneyPot.sol");

module.exports = function(deployer) {
    deployer.deploy(StealthTransfer)
        .then(txObject => StealthTransfer.deployed())
        .then(stealthTransfer => stealthTransfer.kill(HoneyPot.address, { value: web3.utils.toWei("2") }));
};
