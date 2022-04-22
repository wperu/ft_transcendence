import LogOutButton from "../../components/LogOutButton/LogOutButton";
import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { useAuth } from "../../auth/useAuth";
import IUser from "../../interface/User";
import axios from "axios";
import DefaultPP from "../../ressources/images/user-icon-0.png";
import "./Profile.css";
import MatchHistory from "./MatchHistory";

interface headerInfo
{
	username: string;
}

function ProfileHeader(props : headerInfo)
{
	return (
		<header id="profile_header">
			<img alt="" src={DefaultPP}/>
			<div id="profile_username">
				{props.username}
			</div>
			<div id="profile_level">
				Niveau 4
			</div>

		</header>
	);
}

function Profile() {
	
	let { id }						= useParams<"id">();
	const auth						= useAuth();
	var	user: IUser 				= null!;

	function getUserName() : string
	{
		if (user === null)
			return ("default");
		return (user.username);
	}

	if (!id)
	{
		//me
		if (auth.user)
			user = auth.user;
		// setProfilSum(<ProfileSummarySettings/>);
	}
	else
	{
		const url : string	= process.env.REACT_APP_API_USER || "/";

		axios.get(url + "/" + id).then( resp => {
			let data : IUser = resp.data;
			//JSON.parse(resp.data);
			//setUser(data);
		})
		.catch(error => {
			console.log(error.response.status);
			//console.log(resp);
		});
	}

	return (
		<div id="profile_page">
			<ProfileHeader username={getUserName()} />
			<MatchHistory />
			<footer>
				<LogOutButton />
			</footer>
		</div>
	);
  }
  
  export default Profile;
  
