pragma solidity 0.4.21;

contract StealthTransfer {
    function kill(address beneficiary) payable public {
        selfdestruct(beneficiary);
    }
}