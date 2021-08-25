const hre = require("hardhat");

async function main() {
  const UnstableAnimals = await hre.ethers.getContractFactory("UnstableAnimals");
  const unstableAnimals = await UnstableAnimals.deploy("Unstable Animals", "UNSTBL", "https://parallelworlds.mypinata.cloud/ipfs/QmQDWG92prsc64fPoeVtKrSZhR3RM2PCaCBCJLdH7A1vaK/");
  //const unstableAnimals = await UnstableAnimals.deploy("UnstableTEST", "UNSTest", "https://gateway.pinata.cloud/ipfs/QmeKJxzoc7PhhFn4ccsYtNqFzAAe8F6goSRhnJ6F6wWJBW/");

  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying contracts with the account:",
    deployer.address
    );
  
  console.log("Account balance:", (await deployer.getBalance()).toString());
  
  await unstableAnimals.deployed();

  console.log("UnstableAnimals deployed to:", unstableAnimals.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
