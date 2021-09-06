import {ethers} from "ethers";

// import detectEthereumProvider from '@metamask/detect-provider'


export function resolveProvider() {
  if (typeof window.ethereum !== 'undefined') {
    return new ethers.providers.Web3Provider(window.ethereum)
  }
  // throw Error('window.ethereum not defined') // TODO: Be more graceful
  
}
