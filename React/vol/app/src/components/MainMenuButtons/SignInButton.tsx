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

	/**
	 * Callback fct for signin
	 * 
	 * setAuth and Redirect to request Url
	 */
	function useRedirectToAuthPage()
	{
		const redirectTo	=	isObjectWithKey(location.state, 'from')
							&&	isObjectWithKey(location.state.from, 'pathname')
							&&	typeof location.state.from.pathname === 'string'
					   		?	location.state.from.pathname
					   		:	"/";

		console.log("Redirect");
		auth.setIsAuth(true);
		navigate(redirectTo, { replace: true});
	};

	function signInClick ()
	{
		alert("Connexion");
		auth.signin(useRedirectToAuthPage);
	}

	return <button onClick={signInClick}>Se connecter</button>;
}

export default SignInButton;
