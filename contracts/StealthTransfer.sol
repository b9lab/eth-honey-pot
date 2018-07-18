pragma solidity 0.4.24;

contract StealthTransfer {
    function kill(address beneficiary) payable public {
        selfdestruct(beneficiary);
    }
}