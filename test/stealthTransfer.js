const Promise = require("bluebird");
const StealthTransfer = artifacts.require("./StealthTransfer.sol");
const HoneyPot = artifacts.require("./HoneyPot.sol");
const sequentialPromise = require("./sequentialPromise.js");
const expectSolidityException = require("./expectSolidityException.js")(web3);

contract("StealthTransfer", function(accounts) {
    let owner, beneficiary;

    before("should prepare accounts", function() {
        owner = accounts[0];
        beneficiary = accounts[1];
        if (typeof web3.eth.getAccountsPromise !== "function") {
           Promise.promisifyAll(web3.eth, { suffix: "Promise" });
        }
    });

    describe("deploy", function() {

        it("should be possible to deploy without payment", function() {
            this.slow(100);
            return StealthTransfer.new({ from: owner })
                .then(stealth => web3.eth.getCodePromise(stealth.address))
                .then(code => assert.isAtLeast(code.length, 50));
        });

        it("should not be possible to deploy with payment", function() {
            this.slow(100);
            return StealthTransfer.new({ from: owner, value: 200 })
                .then(
                    () => { throw new Error("should not accept to deploy with Ether"); },
                    e => assert.strictEqual(e.message.search("Cannot send value to non-payable constructor"), 0));
        });

    });

    describe("kill", function() {

        let stealth, beneficiaryBalanceBefore;

        beforeEach("should deploy and pick the beneficiary balance", function() {
            return StealthTransfer.new({ from: owner })
                .then(instance => stealth = instance)
                .then(() => web3.eth.getBalancePromise(beneficiary))
                .then(balance => beneficiaryBalanceBefore = balance);
        });

        it("should be possible to kill without payment", function() {
            this.slow(100);
            return stealth.kill(beneficiary, { from: owner, gas: 3000000 })
                .then(txObject => sequentialPromise([
                    () => web3.eth.getBalancePromise(stealth.address),
                    () => web3.eth.getBalancePromise(beneficiary)
                ]))
                .then(results => {
                        assert.strictEqual(results[0].toString(10), "0");
                        assert.strictEqual(results[1].toString(10), beneficiaryBalanceBefore.toString(10));
                });
        });

        it("should be possible to kill with payment", function() {
            this.slow(100);
            return stealth.kill(beneficiary, { from: owner, value: 200 })
                .then(txObject => sequentialPromise([
                    () => web3.eth.getBalancePromise(stealth.address),
                    () => web3.eth.getBalancePromise(beneficiary)
                ]))
                .then(results => {
                        assert.strictEqual(results[0].toString(10), "0");
                        assert.strictEqual(
                            results[1].toString(10),
                            beneficiaryBalanceBefore.plus(200).toString(10));
                });
        });

        it("should be destructed after kill", function() {
            return stealth.kill(beneficiary, { from: owner, value: 200 })
                .then(txObject => web3.eth.getCodePromise(stealth.address))
                .then(code => assert.strictEqual(code, "0x0"));
        });

    });

});