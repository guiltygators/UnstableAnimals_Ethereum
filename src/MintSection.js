import {useEffect, useRef, useState} from 'react'
import { utils } from 'ethers'
import Modal from 'react-modal'
import AnimateOnChange from 'react-animate-on-change'
import UnstableGIF from './images/rainbowgif.gif'
import pixelParty from './images/pixel-party.png'
import { ReactComponent as MetaMaskLogo } from './images/mm-logo.svg'
import './MintSection.css'
import './pixelLoader.css'
import { createContractStateHook } from "./createContractStateHook";
import { resolveProvider } from "./resolveProvider";
import { createContractHelper } from "./createContractHelper";
import GuiltyGators from './GuiltyGators.json'
import MintGallery from "./MintGallery";
import {useSmoothScrollTo} from "./useSmoothScrollTo";
import {useLocalStorage} from './useLocalStorage'
import {usePrevious} from "./usePrevious";
import Web3 from 'web3';

const GuiltyGators_ADDRESS = '0xD51180AE387C7cC9AFCF2f80d6D93aa1885603c9'
const CHAIN_ID = '0x1'
export const OPENSEA_NAME = 'guiltygators'

const provider = resolveProvider()
const guiltyGators = createContractHelper(GuiltyGators_ADDRESS, GuiltyGators.abi, provider)
const useGuiltyGatorstate = createContractStateHook(guiltyGators.reader)

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
  const [lastPurchasedGuiltyGatorsIds, setLastPurchasedGuiltyGatorsIds] = useState([])
// temporalmente comento esta linea (volverla a activar luego) la que dice ready to mint
  const [appState, setAppState] = useState(APP_STATE.readyToMint)

// borrar esta linea de .soldout solo esta para que en la pagina no este activa la compra
  //const [appState, setAppState] = useState(APP_STATE.soldOut)
//  ^^^^^^^^^^^^^^^^^^^^^^^^^^ ESTA ^^^^^^^^^^^^^^^^^^^^^^^^^^^^ BORRAR

  const [modalIsOpen, setModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [shouldAnimateCount, setShouldAnimateCount] = useState(false)
  const [hasMintedGuiltyGators, setHasMintedGuiltyGators] = useLocalStorage('hasMintedGuiltyGators', false)
  const [showViewGuiltyGators, setShowViewGuiltyGators] = useState(false)

  const loadedNoneMinted = useRef(hasMintedGuiltyGators !== true)

  function disableCountAnimation() {
    setShouldAnimateCount(false)
  }

  useEffect(() => {
    if (hasMintedGuiltyGators && loadedNoneMinted.current !== hasMintedGuiltyGators) {
      setShowViewGuiltyGators(true)
    }
  }, [hasMintedGuiltyGators, appState])

  const [buyPrice] = useGuiltyGatorstate({
    //stateVarName: 'price',
    stateVarName: 'cost',
    initialData: utils.parseUnits('0'),
    transformData: (data) => ({
      wei: data,
      number: utils.formatEther(data)
    })
  })

  //const [isSaleActive, _, __, refreshIsSaleActive] = useGuiltyGatorstate('saleEnabled', true)
  const [isSaleActive, _, __, refreshIsSaleActive] = useGuiltyGatorstate('paused', true)
  const [GuiltyGatorsMinted, ___, ____, refreshGuiltyGatorsMinted] = useGuiltyGatorstate({
    //stateVarName: 'GuiltyGatorsMinted',
    stateVarName: 'totalSupply',
    transformData: (data) => data.toNumber(),
    swrOptions: { refreshInterval: 6000 },
  })
  const [maxGuiltyGatorsCount] = useGuiltyGatorstate({
    initialData: utils.parseUnits('10000', 'wei'),
    //stateVarName: 'MAX_SUPPLY',
    stateVarName: 'maxSupply',
    transformData: (data) => data.toNumber(),
  })

  let allSold = maxGuiltyGatorsCount === GuiltyGatorsMinted
  if (!window.ethereum) {
    allSold = false
  }

  const GuiltyGatorsMintedPrevious = usePrevious(GuiltyGatorsMinted)
  useEffect(() => {
    if (
      GuiltyGatorsMinted !== undefined &&
      GuiltyGatorsMintedPrevious !== undefined &&
      GuiltyGatorsMinted !== GuiltyGatorsMintedPrevious
    ) {
      setShouldAnimateCount(true)
    }
  }, [GuiltyGatorsMinted, GuiltyGatorsMintedPrevious])

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

  async function buyGuiltyGators() {
    setErrorMessage(null)
    if (!guiltyGators.web3Enabled) {
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
      const transaction = await guiltyGators.signer.mint(
        buyAmount, {
          value: etherAmount,
          gasLimit: `0x${(buyAmount * 200000).toString(16)}`
        }
      )
      txHash = transaction.hash
      // throw Error('Fake error post-tx.')
      setAppState(APP_STATE.waitingForTx)
      setLastPurchasedGuiltyGatorsIds([])
      // await wait(5000)
      await transaction.wait()
      setAppState(APP_STATE.txSuccess)
      const txReceipt = await provider.getTransactionReceipt(transaction.hash)
      const purchasedIds = txReceipt.logs
        .map((log) => guiltyGators.interface.parseLog(log))
        .filter((log) => log.name === 'Transfer')
        .map((log) => log.args.tokenId.toNumber())
      setLastPurchasedGuiltyGatorsIds(purchasedIds)
      setHasMintedGuiltyGators(true)
      await refreshGuiltyGatorsMinted()
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
        {/* <button onClick={finishPayment}>
        <span className='mint-word' style={formattedEthAmount ? {float: 'left', marginLeft: 8} : {}}>Mint</span>
        {formattedEthAmount ? <span className='mint-price'>({formattedEthAmount})</span> : ''}
      </button>; */}
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
          max={10}
          step={1}
          pattern="[0-9]"
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
            if (inputValueInt > 10) {
              let toSet = inputValue % 10
              toSet = toSet == 0 ? 10 : toSet
              toSet = inputValue == 100 ? 10 : toSet
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
        
        let saleAddress = "0xD51180AE387C7cC9AFCF2f80d6D93aa1885603c9"
        let chainIdValid = 1;

        var saleAbi = [{
            inputs: [
              {
                internalType: "address",
                name: "_to",
                type: "address"
              },
              {
                internalType: "uint256",
                name: "_mintAmount",
                type: "uint256"
              }
            ],
            name: "mint",
            outputs: [],
            stateMutability: "payable",
            type: "function"
        }, {
            inputs: [],
            name: "cost",
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

        async function buyUnstableAnimal(addressTo, qtdNft) {
            setErrorMessage(null)
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const account = accounts[0];
          
            if (!account) {
              setErrorMessage(
                <div className='error-message'>
                  There is no account connected!
                </div>
              )
              //throw Error("There is no account connected!");
            }

            const sale = new window.web3.eth.Contract(saleAbi, saleAddress)

            const price = await sale.methods.cost().call(); // puse cost y quite price
            const amount = Number(price) * Number(qtdNft)

            const method = sale.methods.mint(account, Number(qtdNft)); //puse la variable account y quite el nuevo parametro accountTo
            const gasEstimation = await method.estimateGas({
                from: account,
                value: amount,
            });

            setAppState(APP_STATE.waitingForTx)
            //define gas limit
            let gaslimit = `0x${(qtdNft * 200000).toString(16)}`

            return await method
                .send({
                    from: account,
                    gasLimit: gaslimit,
                    value: amount,
                })
                .once("confirmation", async (res) => {
                  setAppState(APP_STATE.txSuccess)
                  setErrorMessage(
                    <div className='confirmation-message'>
                      Transaction successfully completed.
                    </div>
                  )
                    //return;
                });
        };

        async function getWeb3() {
            setErrorMessage(null)
            try {
                if (window.ethereum) {
                    await window.ethereum.send('eth_requestAccounts');
                    window.web3 = new Web3(window.ethereum);
                    return true;
                }
                setErrorMessage(
                  <div className='error-message'>
                    You don't have Metamask plugin installed
                  </div>
                )
                //throw Error("You don't have Metamask plugin installed");
            } catch (e) {
                if (e.message.includes("wallet_requestPermissions")) {
                  setErrorMessage(
                    <div className='error-message'>
                      You already have one solicitation on your Wallet
                    </div>
                  )
                  //throw Error("You already have one solicitation on your Wallet");
                    return false;
                }

                return false;
            }

        };

        async function finishPayment() {
            setErrorMessage(null)
            const isConnected = await getWeb3();
            if (!guiltyGators.web3Enabled) {
              setModalOpen(true)
              return
            }
            try {
                if (isConnected) {
                    if (window.web3 && window.web3.eth) {
                        const chainId = await window.web3.eth.net.getId();
                        if (chainId != chainIdValid) {
                            setErrorMessage(
                              <div className='error-message'>
                                Please use Ethereum Mainnet
                              </div>
                            )
                            //throw Error("Please use Ethereum Mainnet");
                            return;
                        } else {
                            let qtdMint = buyAmount;
                            //added addressTo parameter to buyUnstableAnimal function
                            var addressTo = "0" //window.web3.eth.requestAccount(); //window.web3.eth.accounts ??
                            if (qtdMint >= 0 && qtdMint <= 10) {
                                await buyUnstableAnimal(addressTo, qtdMint);
                                //setAppState(APP_STATE.txSuccess)
                            } else {
                                setErrorMessage(
                                  <div className='error-message'>
                                    Please, enter a valid number from 0 to 10
                                  </div>
                                )
                                //throw Error("Please, enter a valid number from 0 to 10");
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
                    Error occurred! {`${err.message}`}
                  </div>
                )
              }
              resetAppState()
        };

  return (

    <div ref={refToScroll} className="MintSection">
      <div className="mint-content-left">

        {/* <script src="https://cdn.jsdelivr.net/npm/web3@latest/dist/web3.min.js"></script>
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"
          integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=" crossorigin="anonymous"></script> */}

        <h1>Welcome To The Guilty Gator’s Clubhouse!</h1>
        <p>***(PRESALE POSTPONED) (Check our Discord for updates)***</p>
        {/* <p>Use our minting technology to stabilize them in our reality</p> */}
        <p>The Guilty Gators are a collection of 10,000 provably unique ERC-721 NFTs stored on the Ethereum Blockchain.</p>
        <p>Owning a Guilty Gator gives you access to the Guilty Gator Clubhouse which will be opened shortly after our pre-sale. The Guilty Gator Clubhouse will feature member-only benefits and perks only accessible to gator holders.</p>
        {/* <p class="why-different">Why we are different:</p>
        <p>- 3D voxel design.</p>
        <p>- Stored in IPFS with a premium gateway to secure your NFT access for ever.</p>
        <p>- Part of the proceeds will be donated to a Free of Speech NGO. You will help us decide!</p>
        <p>- We are supporting this project in the long term and making Unstable Animals the biggest brand possible.</p> */}
        {/* <p class="mint-time">Sale is ACTIVE! You can mint up to 10 at a time!</p> */}

        <div className="mint-interface">
          <div className='GuiltyGators-minted-wrapper'>

            {GuiltyGatorsMinted !== undefined && <div className='GuiltyGators-minted'>
              <AnimateOnChange
                baseClassName='GuiltyGators-minted-count'
                animationClassName='GuiltyGators-minted-count--flash'
                animate={shouldAnimateCount}
                onAnimationEnd={disableCountAnimation}
              >
                {GuiltyGatorsMinted}
              </AnimateOnChange> / 10,000 Guilty Gators&nbsp;MINTED
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
        purchasedIds={lastPurchasedGuiltyGatorsIds}
        appState={appState}
        contractAddress={GuiltyGators_ADDRESS}
      />}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={showModal(false)}
        className="get-metamask-modal"
        overlayClassName="get-metamask-modal-overlay"
        contentLabel="Example Modal"
      >
        <button onClick={showModal(false)}>✕</button>
        <p>You'll need to install MetaMask and refresh to continue.<br />Mobile user:</p>
        <a href='https://metamask.app.link/dapp/www.GuiltyGators.com' target='_blank' rel='noreferrer'>Link this page with your app<br/></a>
        <a href='https://metamask.io/download.html' target='_blank' rel='noreferrer'>Install Metamask<MetaMaskLogo /></a>

      </Modal>
    </div>
  )
}

export default MintSection