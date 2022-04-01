import "./Home.css";
import React from "react";
import SignInButton from  "../../components/MainMenuButtons/SignInButton";
import PongLogo from  "../../components/PongLogo/PongLogo";
import { useAuth } from "../../auth/useAuth";
import HomeLoggedIn from "../HomeLoggedIn/HomeLoggedIn";

function HomeLoggedOut() : JSX.Element {
	return (
		<div id="homepage">
			<PongLogo />
			<SignInButton />
		</div>
	);
}

export default HomeLoggedOut;
