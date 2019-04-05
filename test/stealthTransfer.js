const StealthTransfer = artifacts.require("./StealthTransfer.sol");
const HoneyPot = artifacts.require("./HoneyPot.sol");
const sequentialPromise = require("./sequentialPromise.js");
const expectSolidityException = require("./expectSolidityException.js")(web3);

contract("StealthTransfer", function(accounts) {
    let owner, beneficiary;

    before("should prepare accounts", function() {
        [ owner, beneficiary ] = accounts;
    });

    describe("deploy", function() {

        it("should be possible to deploy without payment", function() {
            this.slow(100);
            return StealthTransfer.new({ from: owner })
                .then(stealth => web3.eth.getCode(stealth.address))
                .then(code => assert.isAtLeast(code.length, 50));
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

        beforeEach("should deploy and pick the beneficiary balance", function() {
            return StealthTransfer.new({ from: owner })
                .then(instance => stealth = instance)
                .then(() => web3.eth.getBalance(beneficiary))
                .then(balance => beneficiaryBalanceBefore = web3.utils.toBN(balance));
        });

        it("should be possible to kill without payment", function() {
            this.slow(100);
            return stealth.kill(beneficiary, { from: owner, gas: 3000000 })
                .then(txObject => sequentialPromise([
                    () => web3.eth.getBalance(stealth.address),
                    () => web3.eth.getBalance(beneficiary)
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
                    () => web3.eth.getBalance(stealth.address),
                    () => web3.eth.getBalance(beneficiary)
                ]))
                .then(results => {
                    assert.strictEqual(results[0].toString(10), "0");
                    assert.strictEqual(
                        results[1].toString(10),
                        beneficiaryBalanceBefore.add(web3.utils.toBN("200")).toString(10));
                });
        });

        it("should be destructed after kill", function() {
            return stealth.kill(beneficiary, { from: owner, value: 200 })
                .then(txObject => web3.eth.getCode(stealth.address))
                .then(code => assert.strictEqual(code, "0x"));
        });

    });

});