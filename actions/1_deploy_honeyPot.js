const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const Promise = require('bluebird');
Promise.promisifyAll(web3.eth, { suffix: "Promise" });
Promise.promisifyAll(web3.version, { suffix: "Promise" });
const truffleContract = require("truffle-contract");

const HoneyPot = truffleContract(require(__dirname + "/../build/contracts/HoneyPot.json"));
HoneyPot.setProvider(web3.currentProvider);

return web3.eth.getAccountsPromise()
    .then(accounts => HoneyPot.new({
        from: accounts[0],
        value: web3.toWei(5),
        gas: 2000000 }))
    .then(created => console.log("Created HoneyPot at ", created.address));
