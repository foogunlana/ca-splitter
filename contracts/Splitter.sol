pragma solidity ^0.4.11;

import { OwnedDestroyable } from './OwnedDestroyable.sol';

/*
  Splitter contract receives ETH from Alice, and sends
  equal amounts to Bob and Carol
*/
contract Splitter is OwnedDestroyable{
    address public sender;
    address[2] public recipients;

    event LogSetSender(address indexed _sender);
    event LogSetRecipients(address[2] _recipients);
    event LogSplitSent(address indexed _sender, address[2] _recipients, uint _amount);

    modifier onlySender {
      require(msg.sender == sender);
      _;
    }

    function () payable {}

    function Splitter(address _sender) {
        sender = _sender;
    }

    function hasRecipients()
      public
      constant
      returns(bool) {
      return recipients.length > 0;
    }

    function setSender(address _sender)
        public
        onlyOwner
        returns(bool) {

        sender = _sender;
        LogSetSender(_sender);
        return true;
    }

    function setRecipients(address[2] _newRecipients)
        public
        onlyOwner
        returns(bool) {

        recipients = _newRecipients;
        LogSetRecipients(_newRecipients);
        return true;
    }

    /*
      Should receive an ETH value and split it equally amongst all
      recipients
    */
    function sendSplit()
        public
        payable
        onlySender
        returns(bool) {

        require(msg.value > 0);
        assert(recipients.length > 0);
        uint amountPerRecipient = msg.value / recipients.length;
        for(uint i = 0; i < recipients.length; i++) {
            recipients[i].transfer(amountPerRecipient);
        }
        LogSplitSent(sender, recipients, amountPerRecipient);
        return true;
    }
}
