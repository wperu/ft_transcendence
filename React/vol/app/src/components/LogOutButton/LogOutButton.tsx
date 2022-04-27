import React from "react";
import "./LogOutButton.css";
import { useAuth } from "../../auth/useAuth";

function LogOutButton () : JSX.Element
{
	let	auth		= useAuth();


	function delUser()
	{
		localStorage.removeItem('user');
	}

	function LogOutClick ()
	{
		auth.signout(delUser);
	}


	return <button id="LogOut" onClick={LogOutClick}>Se déconnecter</button>;
}

export default LogOutButton;
