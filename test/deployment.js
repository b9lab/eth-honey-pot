const Promise = require("bluebird");
const HoneyPot = artifacts.require("./HoneyPot.sol");
const StealthTransfer = artifacts.require("./StealthTransfer.sol");

contract("Deployment", function(accounts) {
    before("should promisify web3", function() {
        if (typeof web3.eth.getAccountsPromise !== "function") {
            Promise.promisifyAll(web3.eth, { suffix: "Promise" });
        }
    });

    it("should have deployed a HoneyPot with 5 Ethers", function() {
        return HoneyPot.deployed()
            .then(honeyPot => web3.eth.getBalancePromise(honeyPot.address))
            .then(balance => assert.strictEqual(balance.toString(10), web3.toWei("5")));
    });

    it("should have deployed and killed a StealthTransfer", function() {
        return StealthTransfer.deployed()
            .then(stealth => web3.eth.getCodePromise(stealth.address))
            .then(code => assert.strictEqual(code, "0x0"));
    });

});
