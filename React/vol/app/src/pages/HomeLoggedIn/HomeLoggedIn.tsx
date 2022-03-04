import "./Home.css"
import MatchmakingButton from  "../../components/MainMenuButtons/MatchmakingButton"
import ProfileButton from  "../../components/MainMenuButtons/ProfileButton"
import PongLogo from  "../../components/PongLogo/PongLogo"
import ProfileSummary from  "../../components/ProfileSummary/ProfileSummary"
import LogOutButton from  "../../components/LogOutButton/LogOutButton"
import Sidebar from  "../../components/Sidebar/Sidebar"
// import InfoButton from "../../components/InfoButton/InfoButton";

function HomeLoggedIn() {
	return (
		<div id="homepage">
			<header>
				<ProfileSummary />
				<PongLogo />
			</header>
			<ul id="buttons">
				<li><MatchmakingButton /></li>
				<li><ProfileButton /></li>
			</ul>
			<Sidebar />
			<footer>
				<LogOutButton />
			</footer>
		</div>
	);
}

export default HomeLoggedIn;
