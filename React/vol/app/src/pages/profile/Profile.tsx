import LogOutButton from "../../components/LogOutButton/LogOutButton";
import ProfileSummary from "../../components/ProfileSummary/ProfileSummary";
import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { useAuth } from "../../auth/useAuth";
import IUser from "../../interface/User";
import axios from "axios";
import ProfileSummarySettings from "../../components/ProfileSummarySettings/ProfileSummarySettings";

function Profile() {
	
	let { id }						= useParams<"id">();
	const auth						= useAuth();
	const [user, setUser]			= useState<IUser>(null!);
	const [profilSum, setProfilSum] = useState<JSX.Element>(<ProfileSummary/>);

	useEffect(() =>
	{
		if (!id)
		{
			//me
			if (auth.user)
				setUser(auth.user);

			setProfilSum(<ProfileSummarySettings/>);	
		}
		else
		{
			const url : string	= process.env.REACT_APP_API_USER || "/";

			axios.get(url + "/" + id).then( resp => {
				let data : IUser = resp.data;
				//JSON.parse(resp.data);
				//setUser(data);
				console.log(data);
			})
			.catch(error => {
				console.log(error.response.status);
				//console.log(resp);
			});
		}
	}, []);

	return (
		<div>
			<header id="home_header">
				{profilSum}
				<h1>Profile</h1>
			</header>
			 <footer>
				<LogOutButton />
			</footer>
		</div>
	);
  }
  
  export default Profile;
  
