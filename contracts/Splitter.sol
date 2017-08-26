pragma solidity ^0.4.11;

import { OwnedDestroyable } from './OwnedDestroyable.sol';

/*
  Splitter contract receives ETH from Alice, and sends
  equal amounts to Bob and Carol
*/
contract Splitter is OwnedDestroyable{
    address public sender;
    address[2] public recipients;
    mapping (address => uint) public balances;

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
    function sendSplit(address[2] _recipients)
        public
        payable
        onlySender
        returns(bool) {

        require(msg.value > 0);
        uint amountPerRecipient = msg.value / 2;
        // figure straight up indexes are better than for loops for a small fixed length array
        balances[_recipients[0]] = amountPerRecipient;
        balances[_recipients[1]] = amountPerRecipient;
        LogSplitSent(msg.sender, _recipients, amountPerRecipient);
        return true;
    }
}
