import React from "react";
import "../ressources/MainMenuButton.css";

function SignInClick ()
{
	alert("allo");
}

function SignInButton ()
{
	return <button onClick={SignInClick}>Sign In</button>;
}

export default SignInButton;
