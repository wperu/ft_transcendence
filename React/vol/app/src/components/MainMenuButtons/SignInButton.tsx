import React from "react";
import "./MainMenuButton.css";

function SignInClick ()
{
	alert("Connexion");
}

function SignInButton ()
{
	return <button onClick={SignInClick}>Se connecter</button>;
}

export default SignInButton;
