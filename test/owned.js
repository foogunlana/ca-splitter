var Owned = artifacts.require('./Owned.sol');

contract('Owned', accounts => {
  var owner = accounts[0];
  var contract;

  beforeEach(() => {
    return Owned.new({from: owner})
    .then(instance => {
      contract = instance;
    });
  });

  it('should set the owner to the contract creator', () => {
    return contract.owner()
    .then(_owner => {
      assert.equal(_owner, owner, 'The contract owner was not set to the initial creator');
    });
  });

  // check that anyone else is not the owner
});
