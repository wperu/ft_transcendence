import React from "react";
import "./ProfileSummary.css";
import defaultLogo from "../../ressources/images/user-icon-0.png";
import IUser from "../../interface/User";

function parsUserData(userData: string | null) : IUser | null
{
	if (userData === null)
		return null;
	
	return (JSON.parse(userData));
}

function ProfileSummary() {

	const userData = localStorage.getItem('user');
	const user : IUser | null = parsUserData(userData);

	function getUserName() : string
	{
		if (user === null)
			return ("default");
		return (user.username);
	}

	return (
		<aside id="profile">
			<img id="profile_summary_img" src={defaultLogo} alt="truc" />
			<div id="infos">
				<p> {'> '} {getUserName()}</p>
				<p> {'> '} Level</p>
			</div>
		</aside>
	);
}

export default ProfileSummary;