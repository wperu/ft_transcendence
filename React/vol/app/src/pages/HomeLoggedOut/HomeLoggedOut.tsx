import "./Home.css";
import React from "react";
import SignInButton from  "../../components/MainMenuButtons/SignInButton";
import PongLogo from  "../../components/PongLogo/PongLogo";
import { useAuth } from "../../auth/useAuth";
import HomeLoggedIn from "../HomeLoggedIn/HomeLoggedIn";

function HomeLoggedOut() : JSX.Element {
	let auth = useAuth();

	if (auth.isAuth)
		return <HomeLoggedIn />;
		
	return (
		<div id="homepage">
			<PongLogo />
			<SignInButton />
		</div>
	);
}

export default HomeLoggedOut;
