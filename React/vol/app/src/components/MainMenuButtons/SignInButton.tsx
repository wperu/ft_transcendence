import React from "react";
import "./MainMenuButton.css";
import { useAuth } from "../../auth/useAuth";
import { useLocation, useNavigate } from "react-router-dom";

const isObjectWithKey = <T extends string>(
	given: unknown,
	key: T
  ): given is Partial<Record<T, unknown>> =>
	typeof given === 'object' && given !== null && key in given

function SignInButton ()
{
	let	auth		= useAuth();
	let	location	= useLocation();
	let navigate 	= useNavigate();

	//Redirect to request request URL

	const redirectTo =	isObjectWithKey(location.state, 'from')
 					&&	isObjectWithKey(location.state.from, 'pathname')
  					&&	typeof location.state.from.pathname === 'string'
    				?	location.state.from.pathname
    				:	"/";

	function signInClick ()
	{
		alert("Connexion");
		auth.signin(() => {});
		navigate(redirectTo, { replace: true});
	}

	return <button onClick={signInClick}>Se connecter</button>;
}

export default SignInButton;
