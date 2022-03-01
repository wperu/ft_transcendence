import "./Home.css"
import SignInButton from  "../../components/SignInButton"
import PongLogo from  "../../components/PongLogo/PongLogo"
import InfoButton from "../../components/InfoButton";

function Home() {
	return (
		<div id="homepage">
			<PongLogo />
			<SignInButton />
		</div>
	);
}

export default Home;
