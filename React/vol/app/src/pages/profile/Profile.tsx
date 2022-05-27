import "./Profile.css";
import {  useState } from "react";
import { useParams, Link } from 'react-router-dom';
import { useAuth } from "../../auth/useAuth";
import IUser from "../../Common/Dto/User/User";
import MatchHistory from "./MatchHistory";
import BackToMainMenuButton from "../../components/FooterButton/BackToMainMenuButton";
import TwoFactorAuthSetting from "../../components/ProfileSettings/TFAsetting/TFAsetting";
import ChangeablePP from "../../components/ProfileSettings/ChangeablePP/ChangeablePP";
import ChangeableUsername from "../../components/ProfileSettings/ChangeableUsername/ChangeableUsername";

interface headerInfo
{
	user: IUser;
}

function CurrentUserProfileHeader(props : headerInfo)
{

	// const inputEl = useRef(null);

	return (
		<header id="profile_header">
			<ChangeablePP user={props.user} />
			<ChangeableUsername user={props.user} />
			<div id="profile_stats">
				<div id="profile_lvl">Niveau 4</div>
				<div id="profile_ratio">
					<span id="ratio_caption">W:L</span>
					<span id="ratio_wins">42</span>
					:
					<span id="ratio_losses">667</span>
				</div>
			</div>
			<TwoFactorAuthSetting user={props.user} is_active={props.user.useTwoFa} />
		</header>
	);
}

function OtherUserProfileHeader(props : headerInfo)
{
	function getUserName() : string
	{
		if (props.user === null)
			return ("default");
		return (props.user.username);
	}
	function getID() : number
	{
		if (props.user === null)
			return (0);
		return (props.user.id);
	}

	return (
		<header id="profile_header">
			<img src={process.env.REACT_APP_API_USER + '/' + getID() + '/avatar'}
				alt="PP" id="profile_pic"/>
			<div id="profile_username">{getUserName()}</div>
			<div id="profile_stats">
				<div id="profile_lvl">Niveau 4</div>
				<div id="profile_ratio"><span id="ratio_caption">W:L</span> <span id="ratio_wins">42</span>:<span id="ratio_losses">667</span></div>
			</div>
		</header>
	);
}

function Profile() {

	let { id }						= useParams<"id">();
	const auth						= useAuth();
	var	user: IUser 				= null!;

	if (!id)
	{
		//me
		if (auth.user)
			user = auth.user;
		// setProfilSum(<ProfileSummarySettings/>);
		return (
			<div id="profile_page">
				<CurrentUserProfileHeader user={user} />
				<MatchHistory />
				<footer>
					<Link to='/'><BackToMainMenuButton /></Link>
				</footer>
			</div>
		);
	}
	else
	{
		// const url : string	= process.env.REACT_APP_API_USER || "/";

		// axios.get(url + "/" + id).then( resp => {
		// 	let data : IUser = resp.data;
		// 	//JSON.parse(resp.data);
		// 	//setUser(data);
		// })
		// .catch(error => {
		// 	console.log(error.response.status);
		// 	//console.log(resp);
		// });
		if (auth.user)
			user = auth.user;
		return (
			<div id="profile_page">
				<OtherUserProfileHeader user={user} />
				<MatchHistory />
				<footer>
					<Link to='/'><BackToMainMenuButton /></Link>
				</footer>
			</div>
		);
	}


  }

  export default Profile;
