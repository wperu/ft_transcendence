import "./Home.css"
import MatchmakingButton from  "../../components/MainMenuButtons/MatchmakingButton"
import ProfileButton from  "../../components/MainMenuButtons/ProfileButton"
import PongLogo from  "../../components/PongLogo/PongLogo"
import ProfileSummary from  "../../components/ProfileSummary/ProfileSummary"
import LogOutButton from  "../../components/LogOutButton/LogOutButton"
import Sidebar from  "../../components/Sidebar/Sidebar"
import { Link } from "react-router-dom"
// import InfoButton from "../../components/InfoButton/InfoButton";

function HomeLoggedIn() {
	return (
		<div id="homepage">
			<header id="home_header">
				<ProfileSummary />
				<PongLogo />
			</header>
			<ul id="buttons">
				<li><MatchmakingButton /></li>
				<li><Link to='/profile'><ProfileButton /></Link></li>
			</ul>
			<Sidebar />
			<footer id="home_footer">
				<LogOutButton />
			</footer>
		</div>
	);
}

export default HomeLoggedIn;
