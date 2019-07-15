const HoneyPot = artifacts.require("./HoneyPot.sol");
const Attacker = artifacts.require("./AttackerQuad.sol");
const sequentialPromise = require("./sequentialPromise.js");

const { toBN } = web3.utils;
/**
 * We use the real contract deployed, not the Solidity code that we happen to compile on our local machine.
 * Copied from the deployment tx https://ropsten.etherscan.io/tx/0x97f7326d48309feb63baff0cab24b8617e27ce6e7052bab7c6017858d97720c6
 */
HoneyPot.unlinked_binary = "0x60606040525b61001a6401000000006100a361002082021704565b5b61003e565b600160a060020a03331660009081526020819052604090203490555b565b6101418061004d6000396000f3006060604052361561003b5763ffffffff60e060020a60003504166327e235e3811461004d578063549262ba146100785780636d4ce63c14610082575b346100005761004b5b610000565b565b005b3461000057610066600160a060020a0360043516610091565b60408051918252519081900360200190f35b61004b6100a3565b005b346100005761004b6100c1565b005b60006020819052908152604090205481565b600160a060020a03331660009081526020819052604090203490555b565b600160a060020a033316600081815260208190526040808220549051909181818185876185025a03f19250505015156100f957610000565b600160a060020a0333166000908152602081905260408120555b5600a165627a7a72305820665d016d72e75a92f145e862552b74a9314c543468c32fb14c12f7d59fb614290029";

contract("AttackerQuad", function(accounts) {
    const loot = "15000";
    const [ owner, thief ] = accounts;
    let honeyPot, attacker;

    beforeEach("should deploy a new HoneyPot with value", async function() {
        honeyPot = await HoneyPot.new({ from: owner, value: loot });
    });

    beforeEach("should deploy a new Attacker", async function() {
        attacker = await Attacker.new({ from: thief });
    });

    [
        { bait: 15000, floorGas:  88600, ceilGas:  89750, hooks:  2 },
        { bait:  1500, floorGas: 258500, ceilGas: 261300, hooks:  8 },
        { bait:   500, floorGas: 315100, ceilGas: 318500, hooks: 10 },
        { bait:   100, floorGas: 485000, ceilGas: 490050, hooks: 16 },
        { bait:     5, floorGas: 711500, ceilGas: 718800, hooks: 24 },
        { bait:     1, floorGas: 824800, ceilGas: 833150, hooks: 28 }
    ].forEach(situation => {
        
        it("should be possible to steal 15k with " + situation.bait, async function() {
            this.slow(2500);
            const balanceThiefBefore = toBN(await web3.eth.getBalance(thief));
            const txObject = await attacker.attack(
                honeyPot.address,
                // To steal the whole balance in 2 swipes, we need to put in
                // half of the same amount first.
                { from: thief, value: situation.bait, gas: 4000000 });
            const honeyPotBalance = await web3.eth.getBalance(honeyPot.address);
            const attackerBalance = await web3.eth.getBalance(attacker.address);
            const thiefBalance = await web3.eth.getBalance(thief);
            const tx = await web3.eth.getTransaction(txObject.tx);
            assert.strictEqual(honeyPotBalance.toString(10), "0");
            assert.strictEqual(attackerBalance.toString(10), "0");
            const balanceThiefAfter = balanceThiefBefore
                // The gas cost
                .sub(toBN(txObject.receipt.gasUsed * tx.gasPrice))
                // The honey pot's balance
                .add(toBN(loot));
            assert.strictEqual(thiefBalance.toString(10), balanceThiefAfter.toString(10));
            assert.isAtLeast(txObject.receipt.gasUsed, situation.floorGas);
            assert.isAtMost(txObject.receipt.gasUsed, situation.ceilGas);
            assert.strictEqual(txObject.receipt.rawLogs.length, situation.hooks);
        });

    });

});




