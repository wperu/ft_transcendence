import "./Profile.css";
import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from 'react-router-dom';
import { useAuth } from "../../auth/useAuth";
import IUser from "../../Common/Dto/User/User";
import MatchHistory from "./MatchHistory";
import BackToMainMenuButton from "../../components/FooterButton/BackToMainMenuButton";
import TwoFactorAuthSetting from "../../components/ProfileSettings/TFAsetting/TFAsetting";
import ChangeablePP from "../../components/ProfileSettings/ChangeablePP/ChangeablePP";
import ChangeableUsername from "../../components/ProfileSettings/ChangeableUsername/ChangeableUsername";
import { IProfileDTO } from "../../Common/Dto/User/ProfileDTO";
import axios from "axios";

interface headerInfo
{
	user:	IUser;
	qrUri:	string;
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
			<TwoFactorAuthSetting user={props.user} is_active={props.user.useTwoFa} qrUri={props.qrUri} />
		</header>
	);
}

interface profileInfo
{
	user: IProfileDTO | null;
}

function OtherUserProfileHeader(props : profileInfo)
{
	function getUserName() : string
	{
		if (props.user === null)
			return ("default");
		return (props.user.username);
	}

	return (
		<header id="profile_header">
			<img src={process.env.REACT_APP_API_USER + '/' + props.user?.reference_id + '/avatar'}
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

	const { id }					= useParams<("id")>();
	const auth						= useAuth();
	var	user: IUser 				= null!;
	const [profile, setProfile]		= useState<IProfileDTO | null>(null);
	const [qrUri, setQrUri]			= useState<string>();

	const getURL = useCallback(() => {
		var ret =  "";
		if (auth && auth.user)
		{
			const url = process.env.REACT_APP_API_USER + '/' + auth.user.reference_id +  '/twFactorQR';
			const headers = {
				'authorization'	: auth.user ? (auth.user.accessCode) : '',
			}
			axios({
				method: 'get',
				url: url,
				headers: headers,
			})
			.then(res => {
				ret = res.data.url;
				setQrUri(res.data.url);
			})
			.catch(res => {
				console.log(res); //fix parseme pls /!\
				//setIsTwoFactor(isTwoFactor);
				return "";
			});
		}
		return ret;
	}, [auth])

	useEffect(() => {
		if (!id)
			setQrUri(getURL());
	}, [id, getURL]);


	useEffect(() => {
		setProfile(null);
	}, [id]);
	

	useEffect(() => {
		if (profile === null && id)
		{
			if (auth.user)
			{
				const url : string	= process.env.REACT_APP_API_USER + '/profile/' + id;
				console.log(url);
				const headers = {
					authorization: auth.user.accessCode,
				}
				axios.get(url, {headers})
				.then(resp => {
					 const data : IProfileDTO = resp.data;
					setProfile(data);
				})
				.catch(error => {
					console.log(error);
				});
			}
		}
	}, [profile, id, auth.user])

	if (!id)
	{
		if (auth.user)
			user = auth.user;
		return (
			<div id="profile_page">
				<CurrentUserProfileHeader user={user} qrUri={qrUri!}/>
				<MatchHistory />
				<footer>
					<Link to='/'><BackToMainMenuButton /></Link>
				</footer>
			</div>
		);
	}
	else if (profile)
	{
		
		return (
			<div id="profile_page">
				<OtherUserProfileHeader user={profile} />
				<MatchHistory />
				<footer>
					<Link to='/' replace={false}><BackToMainMenuButton /></Link>
				</footer>
			</div>
		);
	}
	else
	{
		return <></> //todo
	}
	;
  }

  export default Profile;
