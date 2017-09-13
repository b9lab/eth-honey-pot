pragma solidity 0.4.13;

contract StealthTransfer {
    function kill(address beneficiary) payable {
        selfdestruct(beneficiary);
    }
}