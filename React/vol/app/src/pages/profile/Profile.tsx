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
import calculateLevel from "../../components/calculateLevel";
import QuatreCentQuatre from "../404/404";

interface headerInfo
{
	user:	IUser;
	qrUri:	string;
	wins:	number;
	losses:	number;
	xp: number;
}

function CurrentUserProfileHeader(props : headerInfo)
{
	// const inputEl = useRef(null);
	return (
		<header id="profile_header">
			<ChangeablePP user={props.user} />
			<ChangeableUsername user={props.user} />
			<div id="profile_stats">
				<div id="profile_lvl">Level {calculateLevel(props.xp)}</div>
				<div id="profile_ratio">
					<span id="ratio_caption">W:L</span>
					<span id="ratio_wins">{props.wins}</span>
					:
					<span id="ratio_losses">{props.losses}</span>
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
				<div id="profile_lvl">Niveau {calculateLevel(props.user?props.user.xp:0)}</div>
				<div id="profile_ratio">
					<span id="ratio_caption">W:L</span>
					<span id="ratio_wins">{props.user?.wins}</span>
					:
					<span id="ratio_losses">{props.user?.losses}</span>
				</div>
			</div>
		</header>
	);
}

function Profile() {

	const { id }					= useParams<("id")>();
	const auth						= useAuth();
	var	user: IUser 				= null!;
	const	[profile, setProfile]	= useState<IProfileDTO | null>(null);
	const	[qrUri, setQrUri]		= useState<string>();

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
				// console.log(res); //fix parseme pls /!\
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
		if (auth.user)
		{
			if (profile === null)
			{
				let url : string
				if (id)
					url = process.env.REACT_APP_API_USER + '/profile/' + id;
				else
					url = process.env.REACT_APP_API_USER + '/profile/' + auth.user.reference_id;
				const headers = {
					authorization: auth.user.accessCode,
				}
				axios.get(url, {headers})
				.then(resp => {
					 const data : IProfileDTO = resp.data;
					setProfile(data);
				})
				.catch(error => {
					
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
				<CurrentUserProfileHeader wins={profile?profile.wins:0}
					losses={profile?profile.losses:0} xp={profile?profile.xp:0}
					qrUri={qrUri!} user={user} />
				<MatchHistory ref_id={user?.reference_id || 0}
					access_code={auth.user?auth.user.accessCode:""} />
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
				<MatchHistory ref_id={profile?.reference_id || 0}
					access_code={auth.user?auth.user.accessCode:""} />
				<footer>
					<Link to='/' replace={false}><BackToMainMenuButton /></Link>
				</footer>
			</div>
		);
	}
	else
	{
		return <QuatreCentQuatre></QuatreCentQuatre> //todo
	}
  }

  export default Profile;
