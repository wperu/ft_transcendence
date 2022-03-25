//import axios from "axios";
import LogOutButton from "../../components/LogOutButton/LogOutButton";
import ProfileSummary from "../../components/ProfileSummary/ProfileSummary";
import React from "react";
import { useParams } from 'react-router-dom';
import { useAuth } from "../../auth/useAuth";

function Profile() {
	
	let id = useParams<"id">();
	const auth = useAuth();
	
	if (!id)
	{

	}

	return (
		<div>
			<header id="home_header">
				<ProfileSummary />
				<h1>Profile</h1>
			</header>
			 <footer>
				<LogOutButton />
			</footer>
		</div>
	);
  }
  
  export default Profile;
  
