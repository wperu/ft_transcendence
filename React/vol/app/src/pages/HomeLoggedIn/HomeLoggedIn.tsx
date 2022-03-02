import "./Home.css"
import MatchmakingButton from  "../../components/MainMenuButtons/MatchmakingButton"
import ProfileButton from  "../../components/MainMenuButtons/ProfileButton"
import PongLogo from  "../../components/PongLogo/PongLogo"
// import InfoButton from "../../components/InfoButton/InfoButton";

function HomeLoggedIn() {
	return (
		<div id="homepage">
			<PongLogo />
			<ul id="buttons">
				<li><MatchmakingButton /></li>
				<li><ProfileButton /></li>
			</ul>
		</div>
	);
}

export default HomeLoggedIn;
