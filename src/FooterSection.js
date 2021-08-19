import './FooterSection.css'
import { ReactComponent as TelegramIcon } from "./images/telegram.svg";
import { ReactComponent as DiscordIcon } from "./images/discord.svg";
import { ReactComponent as TwitterIcon } from "./images/twitter.svg";
import { ReactComponent as GithubIcon } from "./images/github.svg";
import { ReactComponent as OpenSeaIcon } from "./images/open-sea.svg";

function FooterSection() {

    return (
      <div class = "footer" > 
        
      <div class = "social" > 

          <a href="https://t.me/UnstableAnimals" target='_blank' rel='noreferrer' className="social-icon"><TelegramIcon /></a>
          <a href="https://discord.gg/FZu7yurFF6" target='_blank' rel='noreferrer' className="social-icon"><DiscordIcon /></a>
          <a href="https://twitter.com/UnstableAnimals" target='_blank' rel='noreferrer' className="social-icon"><TwitterIcon /></a>
          <a href="https://opensea.io/Unstable_Animals" target='_blank' rel='noreferrer' className="social-icon"><OpenSeaIcon style={{marginBottom: 6}} /></a>

      </div>
      </div>
    )

}

export default FooterSection 