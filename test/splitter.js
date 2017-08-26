var Splitter = artifacts.require('./Splitter.sol');

contract('Splitter', accounts => {
  var owner = accounts[0];
  var recipients = accounts.slice(2, 4);
  var sender = accounts[1];
  var contractInstance;
  var txobj;

  beforeEach(() => {
    return Splitter.new(sender, {from: owner})
    .then(instance => {
      contractInstance = instance;
    });
  });

  it('should initialize splitter with sender address', () => {
    return contractInstance.sender()
    .then(_sender => {
      assert.equal(_sender, sender, "Sender was not set!");
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

});
