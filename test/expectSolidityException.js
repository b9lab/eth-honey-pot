module.exports = function(web3Promisified) {
    return function (promise, gasToUse) {
        return promise()
            .then(function (txn) {
                if (typeof txn === "object") {
                    // We have a txObject
                    txn = txn.tx;
                }
                return web3Promisified.eth.getTransactionReceiptMined(txn);
            })
            .then(function (receipt) {
                // We are in Geth
                assert.equal(receipt.gasUsed, gasToUse, "should have used all the gas");
            })
            .catch(function (e) {
                if ((e.message).search("invalid JUMP") > -1||
                    (e.message).search("out of gas") > -1 ||
                    (e.message).search("invalid opcode") > -1 ||
                    (e.message).search("revert") > -1) {
                    // We are in TestRPC
                } else if ((e.message).search("please check your gas amount") > -1) {
                    // We are in Geth for a deployment
                } else {
                    throw e;
                }
            });
    };
};