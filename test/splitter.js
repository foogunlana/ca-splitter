var Splitter = artifacts.require('./Splitter.sol');

contract('Splitter', accounts => {
  var owner = accounts[0];
  var recipients = accounts.slice(2, 4);
  var sender = accounts[1];
  var contractInstance;
  var amountSent = parseInt(web3.toWei(1, 'ether'));
  var txobj;

  beforeEach(() => {
    return Splitter.new(sender, {from: owner})
    .then(instance => {
      contractInstance = instance;
    });
  });

  it('should set the owner to the contract creator', () => {
    return contractInstance.owner()
    .then(_owner => {
      assert.equal(_owner, owner, 'The contract owner was not set to the initial creator');
    });
  });

  it('should have no owner after being destroyed', () => {
    return contractInstance.destroy()
    .then(txObj => {
      return contractInstance.owner();
    })
    .then(_owner => {
      assert.equal(_owner, '0x', 'The owner is not equal to 0 (empty address)');
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
  it('should allow only owner set sender', () => {
    return contractInstance.setSender(sender, {from: owner})
    .then(txObj => {
      return;
    });
  });

  it('should keep the balance sent to it by the sender', () => {
    return contractInstance.sendSplit(
      recipients,
      {from: sender, value: amountSent})
    .then(txObj => {
      var balance = web3.eth.getBalance(contractInstance.address);
      assert.equal(
        balance.toNumber(), amountSent, "The amount sent was not stored by the contract");
    })
  });

  it('should split sent amount in 2 and keep the change', () => {
    return contractInstance.sendSplit(
      recipients,
      {from: sender, value: amountSent + 1})
    .then(txObj => {
      Promise.all(recipients.map(address => contractInstance.balances(address)))
      .then(balances => {
        assert.equal(balances[0], amountSent / 2, "Half the amount sent was not stored for first recipient");
        assert.equal(balances[1], amountSent / 2, "Half the amount sent was not stored for second recipient");
      })
    })
  });
});
