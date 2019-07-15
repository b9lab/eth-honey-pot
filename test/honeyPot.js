const HoneyPot = artifacts.require("./HoneyPot.sol");
const sequentialPromise = require("./sequentialPromise.js");

const { toBN } = web3.utils;

contract("HoneyPot", function(accounts) {
    const owner = accounts[0];

    describe("deploy", function() {

        it("should be possible to deploy without balance", async function() {
            this.slow(100);
            const honeyPot = await HoneyPot.new({ from: owner });
            const honeyPotBalance = await web3.eth.getBalance(honeyPot.address);
            const ownerOwed = await honeyPot.balances(owner);
            assert.strictEqual(honeyPotBalance.toString(10), "0");
            assert.strictEqual(ownerOwed.toString(10), "0");
        });

        it("should record the deployers balance", async function() {
            this.slow(100);
            const honeyPot = await HoneyPot.new({ from: owner, value: 1000 });
            const honeyPotBalance = await web3.eth.getBalance(honeyPot.address);
            const ownerOwed = await honeyPot.balances(owner);
            assert.strictEqual(honeyPotBalance.toString(10), "1000");
            assert.strictEqual(ownerOwed.toString(10), "1000");
        });

    });

    describe("put from 0", function() {
        let honeyPot;

        beforeEach("should deploy a new HoneyPot", async function() {
            honeyPot = await HoneyPot.new({ from: owner });
        });

        it("should be possible to put", async function() {
            this.slow(100);
            await honeyPot.put({ from: owner, value: 1000 });
            const honeyPotBalance = await web3.eth.getBalance(honeyPot.address);
            const ownerOwed = await honeyPot.balances(owner);
            assert.strictEqual(honeyPotBalance.toString(10), "1000");
            assert.strictEqual(ownerOwed.toString(10), "1000");
        });

        it("should keep only last deposit information", async function() {
            this.slow(200);
            await honeyPot.put({ from: owner, value: 1000 });
            await honeyPot.put({ from: owner, value: 500 });
            const honeyPotBalance = await web3.eth.getBalance(honeyPot.address);
            const ownerOwed = await honeyPot.balances(owner);
            assert.strictEqual(honeyPotBalance.toString(10), "1500");
            assert.strictEqual(ownerOwed.toString(10), "500");
        });

    });

    describe("put from 1000", function() {
        let honeyPot;

        beforeEach("should deploy a new HoneyPot with 1000", async function() {
            honeyPot = await HoneyPot.new({ from: owner, value: 1000 });
        });

        it("should overwrite the deployers balance after a put", async function() {
            this.slow(100);
            await honeyPot.put({ from: owner, value: 500 });
            const honeyPotBalance = await web3.eth.getBalance(honeyPot.address);
            const ownerOwed = await honeyPot.balances(owner);
            assert.strictEqual(honeyPotBalance.toString(10), "1500");
            assert.strictEqual(ownerOwed.toString(10), "500");
        });

    });

    describe("get", function() {
        let honeyPot;

        beforeEach("should deploy a new HoneyPot and put", async function() {
            honeyPot = await HoneyPot.new({ from: owner });
            await honeyPot.put({ from: owner, value: 1000 });
        });

        it("should be possible to get what was put", async function() {
            this.slow(300);
            const balanceBefore = toBN(await web3.eth.getBalance(owner));
            const txObject = await honeyPot.get({ from: owner });
            const honeyPotBalance = await web3.eth.getBalance(honeyPot.address);
            const ownerOwed = await honeyPot.balances(owner);
            const ownerBalance = await web3.eth.getBalance(owner);
            const tx = await web3.eth.getTransaction(txObject.tx);
            assert.strictEqual(honeyPotBalance.toString(10), "0");
            assert.strictEqual(ownerOwed.toString(10), "0");
            const balanceAfter = balanceBefore
                .sub(toBN(txObject.receipt.gasUsed * tx.gasPrice))
                .add(toBN("1000"));
            assert.strictEqual(ownerBalance.toString(10), balanceAfter.toString(10));
        });

        it("should be possible to get only what was put last", async function() {
            this.slow(300);
            await honeyPot.put({ from: owner, value: 500 });
            const balanceBefore = toBN(await web3.eth.getBalance(owner));
            const txObject = await honeyPot.get({ from: owner });
            const honeyPotBalance = await web3.eth.getBalance(honeyPot.address);
            const ownerOwed = await honeyPot.balances(owner);
            const ownerBalance = await web3.eth.getBalance(owner);
            const tx = await web3.eth.getTransaction(txObject.tx);
            assert.strictEqual(honeyPotBalance.toString(10), "1000");
            assert.strictEqual(ownerOwed.toString(10), "0");
            const balanceAfter = balanceBefore
                .sub(toBN(txObject.receipt.gasUsed * tx.gasPrice))
                .add(toBN("500"));
            assert.strictEqual(ownerBalance.toString(10), balanceAfter.toString(10));
        });

    });

});