import {useEffect, useRef, useState} from 'react'
import { utils } from 'ethers'
import Modal from 'react-modal'
import AnimateOnChange from 'react-animate-on-change'
import UnstableGIF from './images/UnstableGIF.gif'
import pixelParty from './images/pixel-party.png'
import { ReactComponent as MetaMaskLogo } from './images/mm-logo.svg'
import './MintSection.css'
import './pixelLoader.css'
import { createContractStateHook } from "./createContractStateHook";
import { resolveProvider } from "./resolveProvider";
import { createContractHelper } from "./createContractHelper";
import UnstableAnimals from './UnstableAnimals.json'
import MintGallery from "./MintGallery";
import {useSmoothScrollTo} from "./useSmoothScrollTo";
import {useLocalStorage} from './useLocalStorage'
import {usePrevious} from "./usePrevious";
import Web3 from 'web3';

// cambiar direccion de smart contract
const UnstableAnimals_ADDRESS = '0xe29d2d356bffE827E4Df3B6cA9Fdc9819C3e2651'
const CHAIN_ID = '0x1'
export const OPENSEA_NAME = 'unstable-animals'

const provider = resolveProvider()
const unstableAnimals = createContractHelper(UnstableAnimals_ADDRESS, UnstableAnimals.abi, provider)
const useUnstableAnimalstate = createContractStateHook(unstableAnimals.reader)

export const APP_STATE = {
  readyToMint: 'READY_TO_MINT',
  waitingForTx: 'WAITING_FOR_TX',
  txSuccess: 'TX_SUCCESS',
  soldOut: 'SOLD_OUT',
}

// Reload on chain change
if (window.ethereum) {
  window.ethereum.on('chainChanged', (_chainId) => window.location.reload())
}

function wait(ms) {
  return new Promise(function(resolve) {
    setTimeout(resolve, ms);
  })
}

function MintSection() {
  const [buyAmount, setBuyAmountValue] = useState(1)
  const [lastPurchasedUnstableAnimalsIds, setLastPurchasedUnstableAnimalsIds] = useState([])
// temporalmente comento esta linea (volverla a activar luego) la que dice ready to mint
  const [appState, setAppState] = useState(APP_STATE.readyToMint)

// borrar esta linea de .soldout solo esta para que en la pagina no este activa la compra
  //const [appState, setAppState] = useState(APP_STATE.soldOut)
//  ^^^^^^^^^^^^^^^^^^^^^^^^^^ ESTA ^^^^^^^^^^^^^^^^^^^^^^^^^^^^ BORRAR

  const [modalIsOpen, setModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [shouldAnimateCount, setShouldAnimateCount] = useState(false)
  const [hasMintedUnstableAnimals, setHasMintedUnstableAnimals] = useLocalStorage('hasMintedUnstableAnimals', false)
  const [showViewUnstableAnimals, setShowViewUnstableAnimals] = useState(false)

  const loadedNoneMinted = useRef(hasMintedUnstableAnimals !== true)

  function disableCountAnimation() {
    setShouldAnimateCount(false)
  }

  useEffect(() => {
    if (hasMintedUnstableAnimals && loadedNoneMinted.current !== hasMintedUnstableAnimals) {
      setShowViewUnstableAnimals(true)
    }
  }, [hasMintedUnstableAnimals, appState])

  const [buyPrice] = useUnstableAnimalstate({
    stateVarName: 'price',
    initialData: utils.parseUnits('0'),
    transformData: (data) => ({
      wei: data,
      number: utils.formatEther(data)
    })
  })

  const [isSaleActive, _, __, refreshIsSaleActive] = useUnstableAnimalstate('saleEnabled', true)
  const [UnstableAnimalsMinted, ___, ____, refreshUnstableAnimalsMinted] = useUnstableAnimalstate({
    stateVarName: 'UnstableAnimalsMinted',
    transformData: (data) => data.toNumber(),
    swrOptions: { refreshInterval: 6000 },
  })
  const [maxUnstableAnimalsCount] = useUnstableAnimalstate({
    initialData: utils.parseUnits('10000', 'wei'),
    stateVarName: 'MAX_SUPPLY',
    transformData: (data) => data.toNumber(),
  })

  let allSold = maxUnstableAnimalsCount === UnstableAnimalsMinted
  if (!window.ethereum) {
    allSold = false
  }

  const UnstableAnimalsMintedPrevious = usePrevious(UnstableAnimalsMinted)
  useEffect(() => {
    if (
      UnstableAnimalsMinted !== undefined &&
      UnstableAnimalsMintedPrevious !== undefined &&
      UnstableAnimalsMinted !== UnstableAnimalsMintedPrevious
    ) {
      setShouldAnimateCount(true)
    }
  }, [UnstableAnimalsMinted, UnstableAnimalsMintedPrevious])

  useEffect(() => {
    if (!isSaleActive || allSold) {
      setAppState(APP_STATE.soldOut)
    }
  }, [isSaleActive, allSold])

  function showModal(bool) {
    return () => setModalOpen(bool)
  }

  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' })
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: CHAIN_ID }],
    });
  }

  function resetAppState() {
    loadedNoneMinted.current = false
    setAppState(APP_STATE.readyToMint)
  }

  async function buyUnstableAnimals() {
    setErrorMessage(null)
    if (!unstableAnimals.web3Enabled) {
      // devolver a true para PRODUCCION
      setModalOpen(true)
      // desactivar error
      //throw Error('Fake error first if.')
      return
    }
    if (!buyAmount || !parseInt(buyAmount || !buyPrice.wei)) return
    const etherAmount = buyPrice.wei.mul(buyAmount)
    await requestAccount()
    let txHash
    try {
      //desactivar linea 146
      //throw Error('Fake error pre-tx.')
      const transaction = await unstableAnimals.signer.buy(
        buyAmount, {
          value: etherAmount,
          gasLimit: `0x${(buyAmount * 200000).toString(16)}`
        }
      )
      txHash = transaction.hash
      // throw Error('Fake error post-tx.')
      setAppState(APP_STATE.waitingForTx)
      setLastPurchasedUnstableAnimalsIds([])
      // await wait(5000)
      await transaction.wait()
      setAppState(APP_STATE.txSuccess)
      const txReceipt = await provider.getTransactionReceipt(transaction.hash)
      const purchasedIds = txReceipt.logs
        .map((log) => unstableAnimals.interface.parseLog(log))
        .filter((log) => log.name === 'Transfer')
        .map((log) => log.args.tokenId.toNumber())
      setLastPurchasedUnstableAnimalsIds(purchasedIds)
      setHasMintedUnstableAnimals(true)
      await refreshUnstableAnimalsMinted()
    } catch (err) {
      refreshIsSaleActive()
      console.error(err)
      if (txHash) {
        setErrorMessage(
          <div className='error-message'>
            Transaction failed; you may have run out of gas. <br />
            <a href={`https://etherscan.io/tx/${txHash}`} target="_blank" rel='noreferrer'>Click here to see what happened on EtherScan.</a>
          </div>
        )
      } else {
        setErrorMessage(
          <div className='error-message'>
            Error occurred! Error message: {`${err.message}`}
          </div>
        )
      }
      resetAppState()
    }

  }

  const formattedEthAmount = provider ? `${utils.formatEther(buyPrice.wei.mul(buyAmount))} ETH` : undefined

  function getMintButton() {
    switch (appState) {
      case APP_STATE.readyToMint:
        //return <button onClick={buyUnstableAnimals}>
        return <button onClick={finishPayment}>
          <span className='mint-word' style={formattedEthAmount ? {float: 'left', marginLeft: 8} : {}}>Mint</span>
          {formattedEthAmount ? <span className='mint-price'>({formattedEthAmount})</span> : ''}
        </button>;

      case APP_STATE.waitingForTx:
        return <button
          className='minting'
          disabled={true}
        >
          <span>Minting...</span>
        </button>

      case APP_STATE.txSuccess:
        return <button
          onClick={resetAppState}
        >
          <span className='mint-more'>Mint more!</span>
        </button>

      case APP_STATE.soldOut:
        return <button
          className='sold-out'
          disabled={true}
        >
          <span className='mint-word'>Sale not started</span>
        </button>

      default:
        return
    }
  }

  function getMintInput() {
    switch (appState) {
      case APP_STATE.readyToMint:
        return <input
          type='number'
          min={1}
          max={20}
          step={1}
          pattern="[0-19]"
          onClick={e => {
            e.target.select()
          }}
          onChange={e => {
            const inputValue = e.target.value
            if (inputValue.indexOf('.') > -1) {
              setBuyAmountValue(inputValue.split('.')[0])
              return
            }
            if (inputValue === '') {
              return
            }
            const inputValueInt = parseInt(inputValue)
            if (isNaN(inputValue)) {
              return
            }
            if (inputValueInt > 20) {
              let toSet = inputValue % 20
              toSet = toSet == 0 ? 20 : toSet
              toSet = inputValue == 100 ? 20 : toSet
              toSet = toSet < 1 ? 1 : toSet
              setBuyAmountValue(toSet < 1 ? 1 : toSet)
              return
            }
            if (!e.target.validity.valid) {
              return
            }
            setBuyAmountValue(inputValue)
          }}
          value={buyAmount}
        />

      case APP_STATE.waitingForTx:
        return <div className="loader-container"><div className="pixel-loader"></div></div>

      case APP_STATE.txSuccess:
        return <img src={pixelParty} className='pixel-party' />

      case APP_STATE.soldOut:
        return

      default:
        return
    }
  }

  const refToScroll = useSmoothScrollTo('#mint', 'scrollToMint')


  // empieza codigo nuevo
        let qtdMintLeftDiv = "qtdMintLeftDiv";
        let notificationDiv = "notificationDiv";
        let classLoadingMint = "loadingMint";
        let classModalMint = "contact-form";
        let qtdMintInput = "form-field-qtdMintInput";
        let projectAddressOpenSea = "0xe29d2d356bffE827E4Df3B6cA9Fdc9819C3e2651"
        let saleAddress = "0xe29d2d356bffE827E4Df3B6cA9Fdc9819C3e2651"
        let chainIdValid = 1;
        let urlInfura = "https://mainnet.infura.io/v3/7ed550e4c51243b2ac36ca251d287b64";
        let web3_ = new Web3(Web3.givenProvider || urlInfura);
        let strayCatAbi = [{
            inputs: [],
            name: "totalSupply",
            outputs: [
                {
                    internalType: "uint256",
                    name: "",
                    type: "uint256"
                }
            ],
            stateMutability: "view",
            type: "function"
        }]

        async function totalSupply() {
            const contract = new web3_.eth.Contract(strayCatAbi, projectAddressOpenSea);
            let totalSupply = "0";
            try {
                totalSupply = await contract.methods.totalSupply().call();
            } catch (e) { }

            return totalSupply;
        };

        // setTimeout(async function () {
        //     let qtdLeft = await totalSupply();
        //     jQuery("#" + qtdMintLeftDiv).html(qtdLeft+" / 10000");
        // }, 300);

        var connected = false;
        var saleAbi = [{
            inputs: [
                {
                    internalType: "uint256",
                    name: "amountToBuy",
                    type: "uint256"
                }
            ],
            name: "buy",
            outputs: [],
            stateMutability: "payable",
            type: "function"
        }, {
            inputs: [],
            name: "price",
            outputs: [
                {
                    internalType: "uint256",
                    name: "",
                    type: "uint256"
                }
            ],
            stateMutability: "view",
            type: "function"
        }]

        async function buyUnstableAnimal(qtdNft) {

            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const account = accounts[0];

            if (!account) {
              throw Error("There is no account connected!");
                return;
            }

            // jQuery("." + classModalMint).css("display", "none");
            // jQuery("." + classLoadingMint).css("display", "block");
            const sale = new window.web3.eth.Contract(saleAbi, saleAddress)

            const price = await sale.methods.price().call();
            const amount = Number(price) * Number(qtdNft)

            const method = sale.methods.buy(Number(qtdNft));
            const gasEstimation = await method.estimateGas({
                from: account,
                value: amount,
            });

            return await method
                .send({
                    from: account,
                    gas: gasEstimation,
                    value: amount,
                })
                .once("confirmation", async (res) => {
                  throw Error("SUCCESS");
                    // jQuery("." + classModalMint).css("display", "block");
                    // jQuery("." + classLoadingMint).css("display", "none");
                    return;
                });
        };

        async function getWeb3() {
            try {
                if (window.ethereum) {
                    await window.ethereum.send('eth_requestAccounts');
                    window.web3 = new Web3(window.ethereum);
                    return true;
                }
                throw Error("You don't have Metamask plugin installed");
            } catch (e) {
                if (e.message.includes("wallet_requestPermissions")) {
                  throw Error("You already have one solicitation on your Wallet");
                    return false;
                }

                return false;
            }

            return false;
        };

        async function finishPayment() {
            setErrorMessage(null)
            const isConnected = await getWeb3();
            if (!unstableAnimals.web3Enabled) {
              // devolver a true para PRODUCCION
              setModalOpen(true)
              // desactivar error
              //throw Error('Fake error first if.')
              return
            }
            try {
                if (isConnected) {
                    if (window.web3 && window.web3.eth) {
                        const chainId = await window.web3.eth.net.getId();
                        if (chainId != chainIdValid) {
                            throw Error("Please use Ethereum Mainnet");
                            return;
                        } else {
                            let qtdMint = buyAmount;
                            if (qtdMint >= 0 && qtdMint <= 20) {
                                await buyUnstableAnimal(qtdMint);
                            } else {
                                throw Error("Please, enter a valid number from 0 to 20");
                                return;
                            }
                        }
                    }
                }
            } catch (err) {
              refreshIsSaleActive()
              console.error(err)
                setErrorMessage(
                  <div className='error-message'>
                    Error occurred! Error message: {`${err.message}`}
                  </div>
                )
              }
              resetAppState()
        };

        async function getTeddys() {
            //headers: {'X-API-KEY': 'X-API-KEY'}

            if (!window.ethereum.selectedAddress) {
                throw Error("Connect your wallet to see your Bears");
                await window.ethereum.enable(); // <<< ask for permission
            }

            if (!window.ethereum.selectedAddress) {
                return;
            }

            const userAccount = window.ethereum.selectedAddress;
            const options = { method: 'GET' };

            let result = fetch('https://api.opensea.io/api/v1/assets?owner=' + userAccount + '&asset_contract_address=' + projectAddressOpenSea + '&order_direction=desc&offset=0&limit=20', options)
                .then(response => response.json())
                .then(response => console.log(response))
                .catch(err => console.error(err));

            console.log(result);
        }

        // function throw Error(msg, type) {
        //     jQuery("." + notificationDiv).html(msg);
        //     setTimeout(async function () {
        //         jQuery("." + notificationDiv).css("display", "none");
        //     }, 5000);

        //     if (type === "error") {
        //         jQuery("." + notificationDiv).css("background-color", "red");
        //     } else if (type === "success") {
        //         jQuery("." + notificationDiv).css("background-color", "green");
        //     } else if (type === "warning") {
        //         jQuery("." + notificationDiv).css("background-color", "blue");
        //     }

        //     jQuery("." + notificationDiv).css("display", "block");
        // }

  return (

    <div ref={refToScroll} className="MintSection">
      <div className="mint-content-left">

        {/* <script src="https://cdn.jsdelivr.net/npm/web3@latest/dist/web3.min.js"></script>
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"
          integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=" crossorigin="anonymous"></script> */}

        <h1>Find your Unstable Animals!</h1>
        <p>In our latest expedition to the parallel worlds, we found a breach in space. 10,000 unstable animals have crossed to our reality and now live in our blockchain.</p>
        {/* <p>Use our minting technology to stabilize them in our reality</p> */}
        <p>You could find 15 different species with 9 trait categories.</p>
        <p>Rare species: Martian, Dragon, Dinosaur and an Unknown Alien. (Each with less than 1% drop chance).</p>
        <p class="why-different">Why we are different:</p>
        <p>- 3D voxel design.</p>
        <p>- Stored in IPFS with a premium gateway to secure your NFT access for ever.</p>
        <p>- Part of the proceeds will be donated to a Free of Speech NGO. You will help us decide!</p>
        <p>- We are supporting this project in the long term and making Unstable Animals the biggest brand possible.</p>
        <p class="mint-time">Sale is ACTIVE! You can mint up to 10 at a time!</p>

        <div className="mint-interface">
          <div className='UnstableAnimals-minted-wrapper'>

            {UnstableAnimalsMinted !== undefined && <div className='UnstableAnimals-minted'>
              <AnimateOnChange
                baseClassName='UnstableAnimals-minted-count'
                animationClassName='UnstableAnimals-minted-count--flash'
                animate={shouldAnimateCount}
                onAnimationEnd={disableCountAnimation}
              >
                {UnstableAnimalsMinted}
              </AnimateOnChange> / 10,000 Unstable Animals&nbsp;MINTED
            </div>}

          </div>
          {getMintInput()}
          {getMintButton()}

        </div>
      </div>

      <div className="mint-content-right">
        <img src={UnstableGIF} />
      </div>

      {errorMessage && errorMessage}

      {!(appState === APP_STATE.soldOut) && <MintGallery
        buyAmount={buyAmount}
        purchasedIds={lastPurchasedUnstableAnimalsIds}
        appState={appState}
        contractAddress={UnstableAnimals_ADDRESS}
      />}

      {/* <div
        disabled={!showViewUnstableAnimals}
        className={showViewUnstableAnimals ? 'view-my-UnstableAnimals' : 'view-my-UnstableAnimals not-minted-yet'}
      >
        <p>View my UnstableAnimals on:</p>
        <a
          href={`https://opensea.io/${window.ethereum?.selectedAddress}/${OPENSEA_NAME}`}
          target='_blank'
          rel='noreferrer'
        >
          OpenSea
        </a>
        <a
          href={`https://rarible.com/user/${window.ethereum?.selectedAddress}?tab=owned`}
          target='_blank'
          rel='noreferrer'
        >
          Rarible
        </a>
      </div> */}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={showModal(false)}
        className="get-metamask-modal"
        overlayClassName="get-metamask-modal-overlay"
        contentLabel="Example Modal"
      >
        <button onClick={showModal(false)}>✕</button>
        <p>You'll need to install MetaMask and refresh to continue.<br />Mobile user? open this page on you metamask app :) </p>
        <a href='https://metamask.io/download.html' target='_blank' rel='noreferrer'>Install Metamask<MetaMaskLogo /></a>

      </Modal>
    </div>
  )
}

export default MintSection