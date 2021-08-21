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

// mainnet networks code
const Private_KeyMainnet = ""

module.exports = {
  solidity: "0.8.4",
  networks: {
  	mainnet: {
  		url: "https://mainnet.infura.io/v3/XXX",
  		accounts: [Private_KeyMainnet],
      gas: 1600000,
      gasPrice: "aqui poner el numero del average Gwei, si no esto pone el mas alto" 
      // 0.000000026 = 26Gwei por gas limit de 3000000 = 0.078
      // yo me fui en 36.4 Gwei y gas limit de 3800000 = 0.138
  	}
  }
};



// test networks code
// const Private_KeyRinkeby = "nope"

// module.exports = {
//   solidity: "0.8.4",
//   networks: {
//   	rinkeby: {
//   		url: "https://rinkeby.infura.io/v3/YYY",
//   		accounts: [Private_KeyRinkeby]
//   	}
//   }
// };