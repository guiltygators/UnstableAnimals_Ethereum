require("@nomiclabs/hardhat-waffle");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html

// task("accounts", "Prints the list of accounts", async () => {
//   const accounts = await ethers.getSigners();

//   for (const account of accounts) {
//     console.log(account.address);
//   }
// });

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

// test networks code
const Private_KeyRinkeby = "0x914c092efa431a94f9f34ab42990e297e2df8ba4bd733545d576e1413fa72df4"

module.exports = {
  solidity: "0.8.4",
  networks: {
  	rinkeby: {
  		url: "https://rinkeby.infura.io/v3/e5416ceda0cf4b44a51726f176e8d11f",
  		accounts: [Private_KeyRinkeby]
  	}
  }
};