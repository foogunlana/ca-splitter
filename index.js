var App = ((web3, address, abi) => {

  var Splitter = web3.eth.contract(abi);
  var splitter = Splitter.at(address);

  resetWatches(splitter);
  window.onload = function() {
    refreshContractInfo();
  }
  window.document.onload = window.onload;

  function resetWatches(contract) {
    splitter.LogSplitSent().watch((err, result) => {
      if(!err) {
        refreshContractInfo();
        console.log("refreshed contract info");
      }
    });
    splitter.LogSetSender().watch((err, result) => {
      if(!err) {
        refreshSender();
        console.log("refeshed sender");
      }
    });
    splitter.LogSetRecipients().watch((err, result) => {
      if(!err) {
        refreshRecipients();
        console.log("refeshed recipients");
      }
    });
    splitter.LogSplitSent().watch((err, result) => {
      if(!err) {
        refreshContractInfo();
        console.log("refreshed contract info");
      }
    });
  }

  function refreshContractInfo() {
    refreshSender();
    refreshRecipients();
    if(splitter.owner() == '0x') {
      document.getElementById('destroy').style.display = 'none';
      document.getElementById('create').style.display = 'block';
    } else {
      document.getElementById('destroy').style.display = 'block';
      document.getElementById('create').style.display = 'none';
    }
  }

  function refreshSender() {
    var sender = splitter.sender();
    if(sender != '0x') {
      let balance = web3.fromWei(
        web3.eth.getBalance(sender).toNumber(), 'ether');
        document.getElementById('sender-address').innerHTML = sender + ": " + balance + " ETH";
    }
  }

  function refreshRecipients() {
    if(splitter.hasRecipients()) {
      var recipientText = ""
      var max = splitter.maxRecipients().toNumber();
      for(let i in Array.from(Array(max).keys())) {
        try{
          let recipient = splitter.recipients(i);
          let balance = web3.fromWei(
            web3.eth.getBalance(recipient).toNumber(), 'ether');
            recipientText += '<p>' + recipient + ": " + balance + ' ETH</p>';
        } catch (e) {
          break;
        }
      }
      document.getElementById('recipients').innerHTML = recipientText;
    }
  }

  function replaceSender() {
    var sender = document.getElementById('sender-address-input').value;
    try {
      splitter.setSender(sender, {
        from: splitter.owner()
      }, (success => {
        if(success) {
          console.log('Set sender to: ' + sender);
        }
      }));
    } catch(e) {
      alert(e);
    }
  }

  function replaceRecipients() {
    var recipientsText = document.getElementById('recipient-address-input').value;
    var recipients = recipientsText.split(',').map(
      Function.prototype.call, String.prototype.trim);
    try {
      splitter.setRecipients(recipients, {
        from: splitter.owner()
      }, (success => {
        if(success) {
          console.log('Set recipients to: ' + recipients.join(','));
        }
      }));
    } catch(e) {
      alert(e);
    }
  }

  function destroy() {
    splitter.destroy({from: splitter.owner()}, (tx) => {
      console.log(tx);
      alert("Destroyed this instance. Please re-create");
      window.location.href = window.location.href;
    });
  }

  function send() {
    var amount = parseInt(document.getElementById('send').value);
    var denominator = document.getElementById('denominator').value.trim();
    try{
      splitter.sendSplit({
        from: splitter.sender(),
        value: web3.toWei(amount, denominator)
      }, (err, tx) => {
        if(!err) {
          alert("Your transaction: " + tx);
        } else {
          alert(err);
        }
      });
    } catch(e) {
      alert(e);
    }
  }

  return {
    replaceSender: replaceSender,
    replaceRecipients: replaceRecipients,
    destroy: destroy,
    send: send
  }
})(
  new Web3(new Web3.providers.HttpProvider("http://localhost:8545")),
  '0xd2b40eeb7baba3bbc08fa57b3d6d3e3dfaa014a2',
  [{"constant":false,"inputs":[{"name":"_newRecipients","type":"address[]"}],"name":"setRecipients","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"sender","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"destroy","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"maxRecipients","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"sendSplit","outputs":[{"name":"","type":"bool"}],"payable":true,"type":"function"},{"constant":true,"inputs":[],"name":"hasRecipients","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_sender","type":"address"}],"name":"setSender","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"recipients","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"inputs":[{"name":"_maxRecipients","type":"uint256"}],"payable":false,"type":"constructor"},{"payable":true,"type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_sender","type":"address"}],"name":"LogSetSender","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_recipients","type":"address[]"}],"name":"LogSetRecipients","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_sender","type":"address"},{"indexed":false,"name":"_recipients","type":"address[]"},{"indexed":false,"name":"_amount","type":"uint256"}],"name":"LogSplitSent","type":"event"}],
);
