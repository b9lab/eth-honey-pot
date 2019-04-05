// Call with $ truffle exec actions/1_deploy_honeyPot.js

const HoneyPot = artifacts.require("./HoneyPot.sol");
const truffleArtifactor = require("truffle-artifactor");
const artifactor = new truffleArtifactor(__dirname + "/../build/contracts");

const honeyPotJson = HoneyPot.toJSON();

module.exports = function() {
    return web3.eth.getAccounts()
        .then(accounts => HoneyPot.new({
            from: accounts[0],
            value: web3.utils.toWei("5"),
            gas: 2000000 }))
        .then(created => {
            console.log("Created HoneyPot at ", created.address);
            honeyPotJson.address = created.address;
            return web3.eth.net.getId();
        })
        .then(networkId => {
            console.log(networkId);
            honeyPotJson.network_id = networkId;
            return artifactor.save(honeyPotJson);
        });
};
