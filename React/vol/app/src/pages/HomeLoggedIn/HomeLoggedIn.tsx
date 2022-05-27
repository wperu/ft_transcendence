import "./Home.css"
import MatchmakingButton from  "../../components/MainMenuButtons/MatchmakingButton"
import ProfileButton from  "../../components/MainMenuButtons/ProfileButton"
import PongLogo from  "../../components/PongLogo/PongLogo"
import ProfileSummary from  "../../components/ProfileSummary/ProfileSummary"
import LogOutButton from  "../../components/FooterButton/LogOutButton"
import { Link } from "react-router-dom"

function HomeLoggedIn() {
	return (
		<div id="homepage">
			<header id="home_header">
				<ProfileSummary />
				<PongLogo />
			</header>
			<ul id="buttons">
				<li><Link to='/matchmaking' replace={false}><MatchmakingButton /></Link></li>
				<li><Link to='/profile'  replace={false}><ProfileButton /></Link></li>
			</ul>
			
			<footer id="home_footer">
				<LogOutButton />
			</footer>
		</div>
	);
}

export default HomeLoggedIn;
