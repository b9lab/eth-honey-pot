const HoneyPot = artifacts.require("./HoneyPot.sol");
const Attacker = artifacts.require("./Attacker.sol");

module.exports = function(deployer) {
    deployer.deploy(Attacker)
    	.then(txObj => Attacker.deployed())
		.then(attacker => attacker.attack(HoneyPot.address, { value: web3.utils.toWei("1") }));
};
