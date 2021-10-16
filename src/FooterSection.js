import './FooterSection.css'
import { ReactComponent as TelegramIcon } from "./images/telegram.svg";
import { ReactComponent as DiscordIcon } from "./images/discord.svg";
import { ReactComponent as TwitterIcon } from "./images/twitter.svg";
import { ReactComponent as GithubIcon } from "./images/github.svg";
import { ReactComponent as OpenSeaIcon } from "./images/open-sea.svg";
import { OPENSEA_NAME } from "./MintSection";

function FooterSection() {

    return (
      <div class = "footer" > 
        
      <div class = "social" > 
          {/* <a href="https://t.me/joinchat/2T-GN74qV6xhMzZh" target='_blank' rel='noreferrer' className="social-icon"><TelegramIcon /></a> */}
          <a href="https://discord.gg/GBVd4ZgvGR" target='_blank' rel='noreferrer' className="social-icon"><DiscordIcon /></a>
          <a href="https://twitter.com/guiltygators" target='_blank' rel='noreferrer' className="social-icon"><TwitterIcon /></a>
          <a href={`https://opensea.io/collection/${OPENSEA_NAME}`} target='_blank' rel='noreferrer' className="social-icon"><OpenSeaIcon style={{marginBottom: 6}} /></a>
          <a href="https://etherscan.io/address/0xD51180AE387C7cC9AFCF2f80d6D93aa1885603c9#code" target='_blank' rel='noreferrer' >Verified Smart Contract</a>
      </div>
      </div>
    )

}

export default FooterSection 