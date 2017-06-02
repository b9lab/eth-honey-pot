const HoneyPot = artifacts.require("./HoneyPot.sol");

module.exports = function(deployer) {
    deployer.deploy(HoneyPot, { value: web3.toWei(5) });
};
