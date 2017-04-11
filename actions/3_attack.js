// Call with $ truffle exec actions/deploy_honeyPot.js

const HoneyPot = artifacts.require("./HoneyPot.sol");
const Attacker = artifacts.require("./Attacker.sol");
const Promise = require('bluebird');
Promise.promisifyAll(web3.eth, { suffix: "Promise" });
Promise.promisifyAll(web3.version, { suffix: "Promise" });

const primingAmount = web3.toWei(0.2);

module.exports = function() {
    return Promise.all([
            web3.eth.getAccountsPromise(),
            HoneyPot.deployed(),
            Attacker.deployed()
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
        .then(honeyPot => web3.eth.getBalancePromise(honeyPot.address))
        .then(balance => console.log("HoneyPot has balance of " + web3.fromWei(balance)));
};
