pragma solidity 0.4.8;

contract StealthTransfer {
    function kill(address beneficiary) payable {
        selfdestruct(beneficiary);
    }
}