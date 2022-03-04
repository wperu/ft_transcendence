import React from "react";
import "./ProfileSummary.css";
import defaultLogo from "../../ressources/images/user-icon-0.png";

function ProfileSummary() {
	return (
		<aside id="profile">
			<img src={defaultLogo} alt="truc" />
			<div id="infos">
				<p> {'> '} Username</p>
				<p> {'> '} Level</p>
			</div>
		</aside>
	);
}

export default ProfileSummary;