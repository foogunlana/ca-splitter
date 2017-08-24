var Splitter = artifacts.require("./Splitter.sol");
var Owned = artifacts.require("./Owned.sol");
var maxRecipients = 2;

module.exports = function(deployer) {
  deployer.deploy(Owned);
  deployer.link(Owned, Splitter);
  deployer.deploy(Splitter, maxRecipients);
};
