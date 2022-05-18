import "./Profile.css";
import {  useState } from "react";
import { useParams, Link } from 'react-router-dom';
import { useAuth } from "../../auth/useAuth";
import IUser from "../../interface/User";
import DefaultPP from "../../ressources/images/user-icon-0.png";
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
			<TwoFactorAuthSetting user={props.user} is_active={true} />
		</header>
	);
}

function OtherUserProfileHeader(props : headerInfo)
{
	const [img, setImg] = useState(DefaultPP);
	
	function getUserName() : string
	{
		if (props.user === null)
			return ("default");
		return (props.user.username);
	}

	return (
		<header id="profile_header">
			<img src={img} alt="PP" id="profile_pic"/>
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
  
