var OwnedDestroyable = artifacts.require('./OwnedDestroyable.sol');

contract('OwnedDestroyable', accounts => {
  var owner = accounts[0];
  var contract;

  beforeEach(() => {
    return OwnedDestroyable.new({from: owner})
    .then(instance => {
      contract = instance;
    });
  });

  it('should have no owner after being destroyed', () => {
    return contract.destroy()
    .then(txObj => {
      return contract.owner();
    })
    .then(_owner => {
      assert.equal(_owner, '0x', 'The owner is not equal to 0 (empty address)');
    });
  });
});
