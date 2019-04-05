const HoneyPot = artifacts.require("./HoneyPot.sol");
const sequentialPromise = require("./sequentialPromise.js");

contract("HoneyPot", function(accounts) {
    let owner;

    before("should prepare accounts", function() {
        owner = accounts[0];
    });

    describe("deploy", function() {

        it("should be possible to deploy without balance", function() {
            this.slow(100);
            return HoneyPot.new({ from: owner })
                .then(honeyPot => sequentialPromise([
                    () => web3.eth.getBalance(honeyPot.address),
                    () => honeyPot.balances(owner)
                ]))
                .then(results => {
                    assert.strictEqual(results[0].toString(10), "0");
                    assert.strictEqual(results[1].toString(10), "0");                
                });
        });

        it("should record the deployers balance", function() {
            this.slow(100);
            return HoneyPot.new({ from: owner, value: 1000 })
                .then(honeyPot => sequentialPromise([
                    () => web3.eth.getBalance(honeyPot.address),
                    () => honeyPot.balances(owner)
                ]))
                .then(results => {
                    assert.strictEqual(results[0].toString(10), "1000");
                    assert.strictEqual(results[1].toString(10), "1000");                
                });
        });

    });

    describe("put from 0", function() {
        let honeyPot;

        beforeEach("should deploy a new HoneyPot", function() {
            return HoneyPot.new({ from: owner })
                .then(created => honeyPot = created);
        });

        it("should be possible to put", function() {
            this.slow(100);
            return honeyPot.put({ from: owner, value: 1000 })
                .then(txObject => sequentialPromise([
                    () => web3.eth.getBalance(honeyPot.address),
                    () => honeyPot.balances(owner)
                ]))
                .then(results => {
                    assert.strictEqual(results[0].toString(10), "1000");
                    assert.strictEqual(results[1].toString(10), "1000");
                });  
        });

        it("should keep only last deposit information", function() {
            this.slow(200);
            return honeyPot.put({ from: owner, value: 1000 })
                .then(txObject => honeyPot.put({ from: owner, value: 500 }))
                .then(txObject => sequentialPromise([
                    () => web3.eth.getBalance(honeyPot.address),
                    () => honeyPot.balances(owner)
                ]))
                .then(results => {
                    assert.strictEqual(results[0].toString(10), "1500");
                    assert.strictEqual(results[1].toString(10), "500");
                });  
        });

    });

    describe("put from 1000", function() {
        let honeyPot;

        beforeEach("should deploy a new HoneyPot with 1000", function() {
            return HoneyPot.new({ from: owner, value: 1000 })
                .then(created => honeyPot = created);
        });

        it("should overwrite the deployers balance after a put", function() {
            this.slow(100);
            return honeyPot.put({ from: owner, value: 500 })
                .then(txObject => sequentialPromise([
                    () => web3.eth.getBalance(honeyPot.address),
                    () => honeyPot.balances(owner)
                ]))
                .then(results => {
                    assert.strictEqual(results[0].toString(10), "1500");
                    assert.strictEqual(results[1].toString(10), "500");                
                });
        });

    });

    describe("get", function() {
        let honeyPot;

        beforeEach("should deploy a new HoneyPot and put", function() {
            return HoneyPot.new({ from: owner })
                .then(created => {
                    honeyPot = created;
                    return honeyPot.put({ from: owner, value: 1000 });
                });
        });

        it("should be possible to get what was put", function() {
            this.slow(300);
            let balanceBefore;
            return web3.eth.getBalance(owner)
                .then(balance => {
                    balanceBefore = web3.utils.toBN(balance);
                    return honeyPot.get({ from: owner });
                })
                .then(txObject => sequentialPromise([
                    () => web3.eth.getBalance(honeyPot.address),
                    () => honeyPot.balances(owner),
                    () => web3.eth.getBalance(owner),
                    () => web3.eth.getTransaction(txObject.tx),
                    () => txObject.receipt
                ]))
                .then(results => {
                    assert.strictEqual(results[0].toString(10), "0");
                    assert.strictEqual(results[1].toString(10), "0");
                    var balanceAfter = balanceBefore
                        .sub(web3.utils.toBN(results[4].gasUsed * results[3].gasPrice))
                        .add(web3.utils.toBN("1000"));
                    assert.strictEqual(results[2].toString(10), balanceAfter.toString(10));
                });  
        });

        it("should be possible to get only what was put last", function() {
            this.slow(300);
            let balanceBefore;
            return honeyPot.put({ from: owner, value: 500 })
                .then(txObject => web3.eth.getBalance(owner))
                .then(balance => {
                    balanceBefore = web3.utils.toBN(balance);
                    return honeyPot.get({ from: owner });
                })
                .then(txObject => sequentialPromise([
                    () => web3.eth.getBalance(honeyPot.address),
                    () => honeyPot.balances(owner),
                    () => web3.eth.getBalance(owner),
                    () => web3.eth.getTransaction(txObject.tx),
                    () => txObject.receipt
                ]))
                .then(results => {
                    assert.strictEqual(results[0].toString(10), "1000");
                    assert.strictEqual(results[1].toString(10), "0");
                    var balanceAfter = balanceBefore
                        .sub(web3.utils.toBN(results[4].gasUsed * results[3].gasPrice))
                        .add(web3.utils.toBN("500"));
                    assert.strictEqual(results[2].toString(10), balanceAfter.toString(10));
                });  
        });

    });

});