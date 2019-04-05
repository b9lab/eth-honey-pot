// Call with $ truffle exec actions/2_deploy_attacker.js

const Attacker = artifacts.require("./Attacker.sol");
const truffleArtifactor = require("truffle-artifactor");
const artifactor = new truffleArtifactor(__dirname + "/../build/contracts");

const attackerJson = Attacker.toJSON();

module.exports = function() {
    return web3.eth.getAccounts()
        .then(accounts => Attacker.new({
            from: accounts[0],
            gas: 2000000 }))
        .then(created => {
            console.log("Created Attacker at ", created.address);
            attackerJson.address = created.address;
            return web3.eth.net.getId();
        })
        .then(networkId => {
            attackerJson.network_id = networkId;
            return artifactor.save(attackerJson);
        });
};
