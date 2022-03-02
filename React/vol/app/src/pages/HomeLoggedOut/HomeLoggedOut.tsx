import "./Home.css"
import SignInButton from  "../../components/MainMenuButtons/SignInButton"
import PongLogo from  "../../components/PongLogo/PongLogo"

function HomeLoggedOut() {
	return (
		<div id="homepage">
			<PongLogo />
			<SignInButton />
		</div>
	);
}

export default HomeLoggedOut;
