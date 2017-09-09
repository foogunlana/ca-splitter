var Splitter = artifacts.require('./Splitter.sol');

function getTransactionReceiptMined(txHash, interval) {
    const transactionReceiptAsync = function(resolve, reject) {
        web3.eth.getTransactionReceipt(txHash, (error, receipt) => {
            if (error) {
                reject(error);
            } else if (receipt == null) {
                setTimeout(
                    () => transactionReceiptAsync(resolve, reject),
                    interval ? interval : 500);
            } else {
                resolve(receipt);
            }
        });
    };

    if (Array.isArray(txHash)) {
        return Promise.all(txHash.map(
            oneTxHash => web3.eth.getTransactionReceiptMined(oneTxHash, interval)));
    } else if (typeof txHash === "string") {
        return new Promise(transactionReceiptAsync);
    } else {
        throw new Error("Invalid Type: " + txHash);
    }
};

function expectedExceptionPromise(action, gasToUse) {
  return new Promise(function (resolve, reject) {
    try {
      resolve(action());
    } catch(e) {
      reject(e);
    }
  })
  .then(function (txn) {
    // https://gist.github.com/xavierlepretre/88682e871f4ad07be4534ae560692ee6
    return getTransactionReceiptMined(txn);
  })
  .then(function (receipt) {
    // We are in Geth
    assert.equal(receipt.gasUsed, gasToUse, "should have used all the gas");
  })
  .catch(function (e) {
    if ((e + "").indexOf("invalid JUMP") || (e + "").indexOf("out of gas") > -1) {
      // We are in TestRPC
    } else if ((e + "").indexOf("please check your gas amount") > -1) {
      // We are in Geth for a deployment
    } else {
      throw e;
    }
  });
};


contract('Splitter', accounts => {
  var owner = accounts[0];
  var recipients = accounts.slice(2, 4);
  var sender = accounts[1];
  var contractInstance;
  var amountSent = parseInt(web3.toWei(1, 'ether'));
  var txobj;

  beforeEach(() => {
    return Splitter.new(
      sender,
      {from: owner})
    .then(instance => {
      contractInstance = instance;
    });
  });

  describe("Initialize contract appropriately", () => {
    it('should set the owner to the contract creator', () => {
      return contractInstance.owner.call()
      .then(_owner => {
        assert.equal(
          _owner,
          owner,
          'The contract owner was not set to the initial creator');
      });
    });
    it('should set the sender', () => {
      return contractInstance.sender.call()
      .then(_sender => {
        assert.equal(_sender, sender, "Sender was not set correctly");
      });
    });
  });

  it('should have no contract code after being destroyed', () => {
    return contractInstance.destroy()
    .then(txObj => {
      return contractInstance.owner.call();
    })
    .then(_owner => {
      assert.equal(
        web3.eth.getCode(contractInstance.address),
        '0x0',
        'The owner is not equal to 0 (empty address)');
    });
  });

  describe("should correctly handle money sent by the sender", () => {
    it('should allow only sender send the split', () => {
      var gasToUse = 5000000;
      return expectedExceptionPromise(function () {
        return contractInstance.sendSplit(
          recipients,
          {from: owner, gas: gasToUse, value: amountSent})
        }, gasToUse);
    });

    it('should keep the balance sent by the sender', () => {
      return contractInstance.sendSplit(
        recipients,
        {from: sender, value: amountSent})
        .then(txObj => {
          return web3.eth.getBalance(contractInstance.address)
      })
      .then(balance => {
        assert.equal(
          balance.toNumber(),
          amountSent,
          "The amount sent was not stored by the contract");
      });
    });

    it('should let the sender send multiple amounts before they are withdrawn', () => {
      return Promise.all([
        contractInstance.sendSplit(
          recipients,
          {from: sender, value: amountSent * 1}),
        contractInstance.sendSplit(
          recipients,
          {from: sender, value: amountSent * 2}),
        contractInstance.sendSplit(
          recipients,
          {from: sender, value: amountSent * 3})
      ])
      .then(txObj => {
        Promise.all(
          recipients.map(address => contractInstance.balances.call(address)))
        .then(balances => {
          assert.equal(
            balances[0].valueOf(),
            (amountSent * 3) + '',
            "Half the amount sent was not stored for first recipient");
          assert.equal(
            balances[1].valueOf(),
            (amountSent * 3) + '',
            "Half the amount sent was not stored for second recipient");
        });
      });
    });

    it('should split sent amount in 2 and keep the change', () => {
      return contractInstance.sendSplit(
        recipients,
        {from: sender, value: amountSent + 1})
      .then(txObj => {
        Promise.all(
          recipients.map(address => contractInstance.balances.call(address)))
        .then(balances => {
          assert.equal(
            balances[0],
            amountSent / 2,
            "Half the amount sent was not stored for first recipient");
          assert.equal(
            balances[1],
            amountSent / 2,
            "Half the amount sent was not stored for second recipient");
        })
      })
    });

    // Revisit test to make it check all recipients
    // Try using Promise.all
    // Calculate exact gas costs using tx and tx receipt with gas & gas price
    it('should let recipients withdraw', () => {
      var currentBalance = web3.eth.getBalance(recipients[0])
      return contractInstance.sendSplit(
        recipients,
        {from: sender, value: amountSent})
      .then(txObj => {
        return contractInstance.withdraw({from: recipients[0]});
      })
      .then(txObjs => {
        return web3.eth.getBalance(recipients[0])
      })
      .then(balance => {
          assert.isAbove(
            balance.toNumber(),
            currentBalance.toNumber(),
            "Recipient's balance was not appropriately credited");
        // }
      });
    });
  });
});
