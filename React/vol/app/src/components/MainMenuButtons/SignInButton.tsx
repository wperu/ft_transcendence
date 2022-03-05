import React from "react";
import "./MainMenuButton.css";
import { useAuth } from "../../auth/useAuth";
import { useLocation, useNavigate } from "react-router-dom";

function SignInButton ()
{
	let	auth		= useAuth();
	let	location	= useLocation();
	let navigate 	= useNavigate();

	//Redirect to request request URL
	let from = location.state?.from?.pathname || '/';

	function signInClick ()
	{
		alert("Connexion");
		auth.signin(() => {});
		navigate(from, { replace: true});
	}

	return <button onClick={signInClick}>Se connecter</button>;
}

export default SignInButton;
