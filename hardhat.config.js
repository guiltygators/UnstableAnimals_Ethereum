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
// const Private_KeyMainnet = ""

// module.exports = {
//   solidity: "0.8.4",
//   networks: {
//   	mainnet: {
//   		url: "https://mainnet.infura.io/v3/",
//   		accounts: [Private_KeyMainnet],
//       gas: 2000000,
//       gasPrice: 35E9
//   	}
//   }
// };

// test networks code
// account 1
//const Private_KeyRinkeby = ""
//account 2
// const Private_KeyRinkeby = "asd"

// module.exports = {
//   solidity: "0.8.4",
//   networks: {
//   	rinkeby: {
//   		url: "https://rinkeby.infura.io/v3/asd",
//   		accounts: [Private_KeyRinkeby],
//       gasPrice: 1E9
//   	},
//   }
// };