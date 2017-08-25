Splitter
========


First, you'll need to install truffle and testrpc
```bash
npm install truffle
npm install ethereumjs-testrpc
```

Make sure to run the tests
start a testrpc for this
```bash
testrpc
```
and in a separate console:
```bash
truffle test
```

Go into the truffle console and grab the address of your splitter
```bash
truffle console
```
```js
Splitter.address
```

You'll need to edit `index.js` to use your new address on line 145

To use a contract deployed on a live network, change the network provider on line 144
