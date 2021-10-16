import './SplashHeader.css'
//import headlogo from './images/headlogo.png'
import logo from './images/logo.png'
import { ReactComponent as TelegramIcon } from "./images/telegram.svg";
import { ReactComponent as DiscordIcon } from "./images/discord.svg";
import { ReactComponent as TwitterIcon } from "./images/twitter.svg";
import { ReactComponent as GithubIcon } from "./images/github.svg";
import { ReactComponent as OpenSeaIcon } from "./images/open-sea.svg";
import { OPENSEA_NAME } from "./MintSection";

function SplashHeader() {

  const scrollToMint = new Event('scrollToMint')

  return (
    <div className="SplashHeader">
      <div className="splash-spacer">&nbsp;</div>
      {/* <div className="unstable-wrap-away">
        <div className="unstable-wrap-sway">
          <div className="unstable-wrap-rotate">
            <div className={"unstable-wrap-float"}>
              <img className="unstable" src={headlogo} alt="Unstable Animals" /><br />
            </div>
          </div>
        </div>
      </div> */}
      <img className="logo" src={logo} alt="Unstable Animals Logo" /><br />
      <a onClick={() => dispatchEvent(scrollToMint)} className="button-1">
        Mint your Guilty Gators!
      </a><br />
      <a href={`https://opensea.io/collection/${OPENSEA_NAME}`} target='_blank' rel='noreferrer' className="button-2">
        VIEW GALLERY
      </a><br />
      <div className="social-icons">
          {/* <a href="https://t.me/joinchat/2T-GN74qV6xhMzZh" target='_blank' rel='noreferrer' className="social-icon"><TelegramIcon /></a> */}
          <a href="https://discord.gg/GBVd4ZgvGR" target='_blank' rel='noreferrer' className="social-icon"><DiscordIcon /></a>
          <a href="https://twitter.com/guiltygators" target='_blank' rel='noreferrer' className="social-icon"><TwitterIcon /></a>
          <a href={`https://opensea.io/collection/${OPENSEA_NAME}`} target='_blank' rel='noreferrer' className="social-icon"><OpenSeaIcon style={{marginBottom: 6}} /></a>
      </div>
    </div>
  )
}

export default SplashHeader
