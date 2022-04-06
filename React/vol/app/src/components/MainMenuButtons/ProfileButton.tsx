import React from "react";
import "./MainMenuButton.css";

function ProfileClick ()
{
	alert("Profile");
}

function ProfileButton ()
{
	return <button className="main_menu_button" onClick={ProfileClick}>Mon Profil</button>;
}

export default ProfileButton;
