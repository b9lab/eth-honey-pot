const Promise = require("bluebird");
const HoneyPot = artifacts.require("./HoneyPot.sol");
const Attacker = artifacts.require("./AttackerQuad.sol");
const sequentialPromise = require("./sequentialPromise.js");

/**
 * We use the real contract deployed, not the Solidity code that we happen to compile on our local machine.
 * Copied from the deployment tx https://ropsten.etherscan.io/tx/0x97f7326d48309feb63baff0cab24b8617e27ce6e7052bab7c6017858d97720c6
 */
HoneyPot.unlinked_binary = "0x60606040525b61001a6401000000006100a361002082021704565b5b61003e565b600160a060020a03331660009081526020819052604090203490555b565b6101418061004d6000396000f3006060604052361561003b5763ffffffff60e060020a60003504166327e235e3811461004d578063549262ba146100785780636d4ce63c14610082575b346100005761004b5b610000565b565b005b3461000057610066600160a060020a0360043516610091565b60408051918252519081900360200190f35b61004b6100a3565b005b346100005761004b6100c1565b005b60006020819052908152604090205481565b600160a060020a03331660009081526020819052604090203490555b565b600160a060020a033316600081815260208190526040808220549051909181818185876185025a03f19250505015156100f957610000565b600160a060020a0333166000908152602081905260408120555b5600a165627a7a72305820665d016d72e75a92f145e862552b74a9314c543468c32fb14c12f7d59fb614290029";

contract("AttackerQuad", function(accounts) {
    const loot = 15000;
    let owner, thief, honeyPot, attacker;

    before("should prepare accounts", function() {
        owner = accounts[0];
        thief = accounts[1];
        Promise.promisifyAll(web3.eth, { suffix: "Promise" });
    });

    beforeEach("should deploy a new HoneyPot with value", function() {
        return HoneyPot.new({ from: owner, value: loot })
            .then(created => honeyPot = created);
    });

    beforeEach("should deploy a new Attacker", function() {
        return Attacker.new({ from: thief })
            .then(created => attacker = created);
    });

    [
        { bait: 15000, floorGas:  89600, ceilGas:  89750, hooks:  2 },
        { bait:  1500, floorGas: 261200, ceilGas: 261300, hooks:  8 },
        { bait:   500, floorGas: 318350, ceilGas: 318500, hooks: 10 },
        { bait:   100, floorGas: 489950, ceilGas: 490050, hooks: 16 },
        { bait:     5, floorGas: 718700, ceilGas: 718800, hooks: 24 },
        { bait:     1, floorGas: 833050, ceilGas: 833150, hooks: 28 }
    ].forEach(situation => {
        
        it("should be possible to steal 15k with " + situation.bait, function() {
            this.slow(2500);
            let balanceThiefBefore;
            return web3.eth.getBalancePromise(thief)
                .then(balance => {
                    balanceThiefBefore = balance;
                    return web3.eth.getBalancePromise(honeyPot.address);
                })
                .then(balance => attacker.attack(
                    honeyPot.address,
                    // To steal the whole balance in 2 swipes, we need to put in
                    // half of the same amount first.
                    { from: thief, value: situation.bait, gas: 4000000 }))
                .then(txObject => sequentialPromise([
                    () => web3.eth.getBalancePromise(honeyPot.address),
                    () => web3.eth.getBalancePromise(attacker.address),
                    () => web3.eth.getBalancePromise(thief),
                    () => web3.eth.getTransactionPromise(txObject.tx),
                    () => txObject.receipt
                ]))
                .then(results => {
                    assert.strictEqual(results[0].toString(10), "0");
                    assert.strictEqual(results[1].toString(10), "0");
                    const balanceThiefAfter = balanceThiefBefore
                        // The gas cost
                        .minus(results[4].gasUsed * results[3].gasPrice)
                        // The honey pot's balance
                        .plus(loot);
                    assert.strictEqual(results[2].toString(10), balanceThiefAfter.toString(10));
                    assert.isAtLeast(results[4].gasUsed, situation.floorGas);
                    assert.isAtMost(results[4].gasUsed, situation.ceilGas);
                    assert.strictEqual(results[4].logs.length, situation.hooks);
                });
        });

    });

});



