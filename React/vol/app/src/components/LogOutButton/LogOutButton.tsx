import React from "react";
import "./LogOutButton.css";

function LogOutClick ()
{
	alert("déConnexion");
}

function LogOutButton ()
{
	return <button id="LogOut" onClick={LogOutClick}>Se déconnecter</button>;
}

export default LogOutButton;
