const HoneyPot = artifacts.require("./HoneyPot.sol");
const StealthTransfer = artifacts.require("./StealthTransfer.sol");

contract("Deployment", function(accounts) {

    it("should have deployed a HoneyPot with 5 Ethers plus 2 of stealth", async function() {
        const honeyPot = await HoneyPot.deployed();
        const balance = await web3.eth.getBalance(honeyPot.address);
        assert.strictEqual(balance, web3.utils.toWei("7"));
    });

    it("should have deployed and killed a StealthTransfer", async function() {
        const stealth = await StealthTransfer.deployed();
        const code = await web3.eth.getCode(stealth.address);
        assert.strictEqual(code, "0x");
    });

});
