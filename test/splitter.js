var Splitter = artifacts.require('./Splitter.sol');

contract('Splitter', accounts => {
  var owner = accounts[0];
  var maxRecipients = 2;
  var recipients = accounts.slice(2, 4);
  var sender = accounts[1];
  var contractInstance;
  var txobj;

  beforeEach(() => {
    return Splitter.new(maxRecipients, {from: owner})
    .then(instance => {
      contractInstance = instance;
    });
  });

  it('should initialize splitter with maxRecipients', () => {
    return contractInstance.maxRecipients()
    .then(maxRecipients => {
      assert.equal(
        maxRecipients.toNumber(), maxRecipients, "Max recipients was not set!");
    });
  });

// Add tests to check that error is thrown if more recipients are added
  it('should receive a list of recipient no more than maxRecipients', () => {
    return contractInstance.setRecipients(recipients, {from: owner})
    .then(txObj => {
      for(let i in Array.from(Array(maxRecipients).keys())) {
        contractInstance.recipients(i)
        .then(recipient => {
          assert.equal(recipient, recipients[i], "Recipient address is not correct");
        });
      }
    });
  });

  it('should set the sender to an address', () => {
    return contractInstance.setSender(sender, {from: owner})
    .then(txObj => {
      return contractInstance.sender();
    })
    .then(_sender => {
      assert.equal(_sender, sender, "Sender was not set correctly");
    });
  });

// Add tests to check that error is thrown if not owner
  it('should allow only owner set sender and recipients', () => {
    return contractInstance.setRecipients(recipients, {from: owner})
    .then(txObj => {
      return contractInstance.setSender(sender, {from: owner})
    })
    .then(txObj => {
      return;
    });
  });

  it('should send money from sender to all recipients in equal amounts', () => {
    var originalBalance = web3.eth.getBalance(sender).toNumber();
    var amount = web3.toWei(1, 'ether');
    var expectedFinalBalance = originalBalance - amount;
    var expectedBalances = recipients.map(
      addr => amount/2 + web3.eth.getBalance(addr).toNumber());

    return Promise.all([
      contractInstance.setRecipients(recipients, {from: owner}),
      contractInstance.setSender(sender, {from: owner})
    ])
    .then(() => {
      return contractInstance.sendSplit({from: sender, value: amount});
    })
    .then(txObj => {
      var finalBalance = web3.eth.getBalance(sender).toNumber();
      assert(
        finalBalance < expectedFinalBalance, "Amount sent was not deducted from sender");
      for(let i in recipients) {
        let balance = web3.eth.getBalance(recipients[i]).toNumber();
        assert.equal(balance, expectedBalances[i], "Recipients were not all credited with correct amount");
      }
    })
  });
});
