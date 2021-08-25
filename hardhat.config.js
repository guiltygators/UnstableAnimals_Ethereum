require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.4",
  paths: {
    artifacts: './src/artifacts',
  },
  networks: {
    hardhat: {
      chainId: 1337
    }
  }
};

// // mainnet networks code
// const Private_KeyMainnet = "5d121ff1054cd0bd0b1f439fdce02283ced4afdaa9ca3a867e91caf95785ad38"

// module.exports = {
//   solidity: "0.8.4",
//   networks: {
//   	mainnet: {
//   		url: "https://mainnet.infura.io/v3/6c44082b0de44311bc45c23c1926d3f8",
//   		accounts: [Private_KeyMainnet],
//       gas: 2000000,
//       gasPrice: 35E9
//   	}
//   }
// };



// test networks code
// account 1
//const Private_KeyRinkeby = "914c092efa431a94f9f34ab42990e297e2df8ba4bd733545d576e1413fa72df4"
//account 2
const Private_KeyRinkeby = "63c1083d19a9c71852fad965b796acbd4fb8c4217e4796598683fb0995f10c29"

module.exports = {
  solidity: "0.8.4",
  networks: {
  	rinkeby: {
  		url: "https://rinkeby.infura.io/v3/6c44082b0de44311bc45c23c1926d3f8",
  		accounts: [Private_KeyRinkeby],
      gasPrice: 1E9
  	},
  }
};