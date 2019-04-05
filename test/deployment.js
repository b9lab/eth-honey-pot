const HoneyPot = artifacts.require("./HoneyPot.sol");
const StealthTransfer = artifacts.require("./StealthTransfer.sol");

contract("Deployment", function(accounts) {

    it("should have deployed a HoneyPot with 5 Ethers plus 2 of stealth", function() {
        return HoneyPot.deployed()
            .then(honeyPot => web3.eth.getBalance(honeyPot.address))
            .then(balance => assert.strictEqual(balance, web3.utils.toWei("7")));
    });

    it("should have deployed and killed a StealthTransfer", function() {
        return StealthTransfer.deployed()
            .then(stealth => web3.eth.getCode(stealth.address))
            .then(code => assert.strictEqual(code, "0x"));
    });

});
