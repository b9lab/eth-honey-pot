const StealthTransfer = artifacts.require("./StealthTransfer.sol");
const HoneyPot = artifacts.require("./HoneyPot.sol");
const sequentialPromise = require("./sequentialPromise.js");
const expectSolidityException = require("./expectSolidityException.js")(web3);

const { toBN } = web3.utils;

contract("StealthTransfer", function(accounts) {
    const [ owner, beneficiary ] = accounts;

    describe("deploy", function() {

        it("should be possible to deploy without payment", async function() {
            this.slow(100);
            const stealth = await StealthTransfer.new({ from: owner });
            const code = await web3.eth.getCode(stealth.address);
            assert.isAtLeast(code.length, 50);
        });

        it("should not be possible to deploy with payment", function() {
            this.slow(100);
            return expectSolidityException(
                () => StealthTransfer.new({ from: owner, value: 200, gas: 3000000 }),
                3000000);
        });

    });

    describe("kill", function() {

        let stealth, beneficiaryBalanceBefore;

        beforeEach("should deploy and pick the beneficiary balance", async function() {
            stealth = await StealthTransfer.new({ from: owner });
            beneficiaryBalanceBefore = toBN(await web3.eth.getBalance(beneficiary));
        });

        it("should be possible to kill without payment", async function() {
            this.slow(100);
            const txObject = await stealth.kill(beneficiary, { from: owner, gas: 3000000 });
            const stealthBalance = await web3.eth.getBalance(stealth.address);
            const beneficiaryBalance = await web3.eth.getBalance(beneficiary);
            assert.strictEqual(stealthBalance.toString(10), "0");
            assert.strictEqual(beneficiaryBalance.toString(10), beneficiaryBalanceBefore.toString(10));
        });

        it("should be possible to kill with payment", async function() {
            this.slow(100);
            await stealth.kill(beneficiary, { from: owner, value: 200 });
            const stealthBalance = await web3.eth.getBalance(stealth.address);
            const beneficiaryBalance = await web3.eth.getBalance(beneficiary);
            assert.strictEqual(stealthBalance.toString(10), "0");
            assert.strictEqual(
                beneficiaryBalance.toString(10),
                beneficiaryBalanceBefore.add(toBN("200")).toString(10));
        });

        it("should be destructed after kill", async function() {
            await stealth.kill(beneficiary, { from: owner, value: 200 });
            const code = await web3.eth.getCode(stealth.address);
            assert.strictEqual(code, "0x");
        });

    });

});