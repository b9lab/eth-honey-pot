// Call with $ truffle exec actions/deploy_honeyPot.js

const HoneyPot = artifacts.require("./HoneyPot.sol");
const Promise = require('bluebird');
Promise.promisifyAll(web3.eth, { suffix: "Promise" });
Promise.promisifyAll(web3.version, { suffix: "Promise" });
const truffleArtifactor = require("truffle-artifactor");
const artifactor = new truffleArtifactor(__dirname + "/../build/contracts");

const honeyPotJson = HoneyPot.toJSON();

module.exports = function() {
    return web3.eth.getAccountsPromise()
        .then(accounts => HoneyPot.new({
            from: accounts[0],
            value: web3.toWei(5),
            gas: 2000000 }))
        .then(created => {
            console.log("Created HoneyPot at ", created.address);
            honeyPotJson.address = created.address;
            return web3.version.getNetworkPromise();
        })
        .then(networkId => {
            honeyPotJson.network_id = networkId;
            return artifactor.save(honeyPotJson);
        });
};
