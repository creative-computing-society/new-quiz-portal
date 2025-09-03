import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faLinkedin,
  faYoutube,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";

import {
  FooterContainer,
  FooterWrap,
  FooterLinksContainer,
  FooterLinksWrapper,
  FooterLinkTitle,
} from "./FooterElements";
import { SocialIcons } from "./FooterElements";

function Footer() {
  return (
    <FooterContainer>
      <FooterWrap>
        <FooterLinksContainer>
          <FooterLinksWrapper>
            <FooterLinkTitle>Connect With Us &hearts;</FooterLinkTitle>
          </FooterLinksWrapper>
        </FooterLinksContainer>
        <FooterLinksWrapper>
          <SocialIcons>
            <a
              style={{ color: "white" }}
              className="social-button facebook"
              href="https://www.facebook.com/CCSTU/?ref=br_rs"
              target="_blank"
              rel="noreferrer"
            >
              <FontAwesomeIcon icon={faFacebook} />
            </a>
            <a
              style={{ color: "white" }}
              className="social-button linkedin"
              href="https://www.linkedin.com/company/ccs-tiet/"
              target="_blank"
              rel="noreferrer"
            >
              <FontAwesomeIcon icon={faLinkedin} />
            </a>
            <a
              style={{ color: "white" }}
              className="social-button youtube"
              href="https://youtube.com/channel/UCc-F6rlsDdHAKfSiPJEnDLg"
              target="_blank"
              rel="noreferrer"
            >
              <FontAwesomeIcon icon={faYoutube} />
            </a>
            <a
              style={{ color: "white" }}
              className="social-button instagram"
              href="http://instagram.com/ccs_tiet?utm_source=qr"
              target="_blank"
              rel="noreferrer"
            >
              <FontAwesomeIcon icon={faInstagram} />
            </a>
          </SocialIcons>
        </FooterLinksWrapper>
      </FooterWrap>
    </FooterContainer>
  );
}

export default Footer;
