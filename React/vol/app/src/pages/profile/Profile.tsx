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
import { GetFinishedGameDto } from "../../Common/Dto/FinishedGameDto";
import axios from "axios";

interface headerInfo
{
	user:	IUser;
	qrUri:	string;
	wins:	number;
	losses:	number;
}

function CurrentUserProfileHeader(props : headerInfo)
{
	// const inputEl = useRef(null);
	console.log("truc");

	return (
		<header id="profile_header">
			<ChangeablePP user={props.user} />
			<ChangeableUsername user={props.user} />
			<div id="profile_stats">
				<div id="profile_lvl">Level 4</div>
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
	wins: number;
	losses: number;
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
				<div id="profile_ratio">
					<span id="ratio_caption">W:L</span>
					<span id="ratio_wins">{props.wins}</span>
					:
					<span id="ratio_losses">{props.losses}</span>
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
	const	[history, setHistory]	= useState<GetFinishedGameDto []>([]);
	var		ref_id					= id;
	const	[wins, setWins]			= useState<number>(0);
	const	[losses, setLosses]		= useState<number>(0);

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
		if (auth.user)
		{
			if (profile === null && id)
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
			else
				ref_id = auth.user.reference_id.toString();
		}
		fetch('/api/game-history/' + ref_id)
			.then(res => res.json())
			.then(result => {
				setHistory(result);
			}, error => {
				if (error)
					console.log("fetch error");
			});
	}, [profile, id, auth.user])

	useEffect(() => {
		let tmp_wins = 0;
		let tmp_losses = 0;
		for(let match of history)
		{
			if (ref_id === match.ref_id_one.toString())
			{
				if (match.score_one > match.score_two)
					tmp_wins++;
				else
					tmp_losses++;
			}
			else
			{
				if (match.score_two > match.score_one)
					tmp_wins++;
				else
					tmp_losses++;
			}
		}
		setWins(tmp_wins);
		setLosses(tmp_losses);
	}, [history, ref_id]);

	if (!id)
	{
		if (auth.user)
			user = auth.user;
		return (
			<div id="profile_page">
				<CurrentUserProfileHeader user={user} wins={wins}
					losses={losses} qrUri={qrUri!}/>
				<MatchHistory history={history} ref_id={user?.reference_id || 0}/>
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
				<OtherUserProfileHeader user={profile} wins={wins} losses={losses} />
				<MatchHistory history={history} ref_id={profile?.reference_id || 0}/>
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
  }

  export default Profile;
