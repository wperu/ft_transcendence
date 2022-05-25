import React from "react";
import "./FooterButton.css";
import { useAuth } from "../../auth/useAuth";

function LogOutButton () : JSX.Element
{
	let	auth		= useAuth();


	function delUser()
	{
		sessionStorage.removeItem('user');
	}

	function LogOutClick ()
	{
		auth.signout(delUser);
	}


	return <button className="footer_button" onClick={LogOutClick}>Se déconnecter</button>;
}

export default LogOutButton;
