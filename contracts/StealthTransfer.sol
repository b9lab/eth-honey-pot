pragma solidity 0.5.0;

contract StealthTransfer {
    function kill(address payable beneficiary) payable public {
        selfdestruct(beneficiary);
    }
}