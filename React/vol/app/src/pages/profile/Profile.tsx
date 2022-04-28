import "./Profile.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from 'react-router-dom';
import { useAuth } from "../../auth/useAuth";
import IUser from "../../interface/User";
import DefaultPP from "../../ressources/images/user-icon-0.png";
import EditLogo from "../../ressources/images/draw.png";
import MatchHistory from "./MatchHistory";
import BackToMainMenuButton from "../../components/FooterButton/BackToMainMenuButton";


interface headerInfo
{
	user: IUser;
}

interface twoFAProps
{
	user: IUser;
	is_active: boolean;
}

function TwoFactorAuthSetting(props: twoFAProps)
{
	const [isTwoFactor, setIsTwoFactor] = useState<boolean>(props.is_active);

	function changeTwoFactor()
	{
		setIsTwoFactor(!isTwoFactor);
		if (props.user)
		{
			const url = process.env.REACT_APP_API_USER + '/' + props.user.id +  '/'; //fixme
			const headers = {
				//'authorization'	: user.access_token_42,
				//'grant-type': 'authorization-code',
				//'authorization-code': accessCode
				'content-type'	: process.env.REACT_APP_AVATAR_TYPE || '',
			}
			// axios.post(url, file, {headers})
			// .then(res => {
			// 	if (process.env.NODE_ENV === "development")
			// 	{
			// 		console.log('Avatar Post succes');
			// 	}
			// })
			// .catch(res => {
			// 	console.log(res);
			// 	setIsTwoFactor(isTwoFactor);
			// });
		}
	}

	function getKeyInputVisibility()
	{
		if (!isTwoFactor)
			return ("");
		else
			return ("invisible")
	}

	return (
		<div id="tfa_setting">
			2FA
			<input id="tfa_checkbox" type="checkbox" checked={isTwoFactor} onChange={changeTwoFactor} />
			<label id="tfa_switch" htmlFor="tfa_checkbox">
				<span id="tfa_slider"></span>
			</label>
			<input id="tfa_key_input" className={getKeyInputVisibility()} type="text" placeholder="Clé de 2FA Google" />
		</div>
	);
}

function CurrentUserProfileHeader(props : headerInfo)
{
	const [img, setImg] = useState(DefaultPP);
	const [file, setFile] = useState<File | undefined >(undefined);
	// const inputEl = useRef(null);
	
	function getUserName() : string
	{
		if (props.user === null)
			return ("default");
		return (props.user.username);
	}

	function changePP(e: React.ChangeEvent<HTMLInputElement>)
	{
		if (!e.target.files || e.target.files.length === 0) {
            setFile(undefined)
            return
        }
		//setFile(e.target.files[0]);

		const value : File = e.target.files[0];
        // I've kept this example simple by using the first image instead of multiple
        
		if (props.user)
		{
			const url = process.env.REACT_APP_API_USER + '/' + props.user.id +  '/avatar';
			const headers = {
				//'authorization'	: user.access_token_42,
				//'grant-type': 'authorization-code',
				//'authorization-code': accessCode
				'content-type'	: process.env.REACT_APP_AVATAR_TYPE || '',
			}
			axios.post(url, file, {headers})
			.then(res => {
				if (process.env.NODE_ENV === "development")
				{
					console.log('Avatar Post succes');
				}
				setFile(value);
			})
			.catch(res => {
				console.log(res);
			});
		}
	}

	useEffect(() => {
		if (!file) {
			setImg(DefaultPP);
			return;
		}

		const objectUrl = URL.createObjectURL(file);
		setImg(objectUrl);

		// free memory when ever this component is unmounted
		return () => URL.revokeObjectURL(objectUrl);
	}, [file]);

	return (
		<header id="profile_header">
			<label id="pp_label">
				<img src={img} alt="PP" id="profile_pic"/>
				<img src={EditLogo} alt="edit" className="edit_logo"
					id="profile_pic_edit_logo" />
				<input id="new_pp_input" type="file" name="img" accept="image/*"
					onChange={changePP}/>
			</label>
			<form id="current_profile_username">
				<input type="text" maxLength={20} id="profile_username_input"
					placeholder={getUserName()}  />
				<input type="submit" id="new_username_submit" value="Changer" />
			</form>
			<div id="profile_stats">
				<div id="profile_lvl">Niveau 4</div>
				<div id="profile_ratio"><span id="ratio_caption">W:L</span> <span id="ratio_wins">42</span>:<span id="ratio_losses">667</span></div>
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
  
