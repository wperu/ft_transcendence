import React, { KeyboardEvent, useState, useRef, useEffect } from "react";
import "./ProfileSummarySettings.css";
import defaultLogo from "../../ressources/images/user-icon-0.png";
import { useAuth } from "../../auth/useAuth";
import axios from "axios";

//Todo Switch CSS checkbox (fixeheight)
function ProfileSummarySettings() {

	const { user } = useAuth();
	const [img, setImg] = useState(defaultLogo);
	const [file, setFile] = useState<File | undefined >(undefined);
	const [isTwoFactor, setIsTwoFactor] = useState<boolean>(false);

	const inputEl = useRef(null);


	function getUserName() : string
	{
		if (user === null)
			return ("default");
		return (user.username);
	}
	//<img src={defaultLogo} alt="truc" />

	//todo authorization | add to .env REACT_APP_AVATAR_TYPE
	function selectFile(e: React.ChangeEvent<HTMLInputElement>)
	{
		if (!e.target.files || e.target.files.length === 0) {
            setFile(undefined)
            return
        }
		//setFile(e.target.files[0]);

		const value : File = e.target.files[0];
        // I've kept this example simple by using the first image instead of multiple
        
		if (user)
		{
			const url = process.env.REACT_APP_API_USER + '/' + user.id +  '/avatar';
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

	function pressedSend(event: KeyboardEvent<HTMLInputElement>)
	{
		if(event.key === "Enter")
		{
			//if (user)
			{
				const url = process.env.REACT_APP_API_USER + '/' + 0 +  '/update/username'; //fixme
				const headers = {
					//'authorization'	: user.access_token_42,
					//'grant-type': 'authorization-code',
					//'authorization-code': accessCode
					//'content-type'	: process.env.REACT_APP_AVATAR_TYPE || '',
				}
				axios.post(url, {username: event.currentTarget.value}, {headers})
				.then(res => {
					console.log("send");
				})
				.catch(res => {
					console.log(res);
					setIsTwoFactor(isTwoFactor);
				});
			}
			event.currentTarget.value = '';
		}
	};

	//todo authorization | add  twofactor path
	function changeTwoFactor()
	{
		setIsTwoFactor(!isTwoFactor);
		if (user)
		{
			const url = process.env.REACT_APP_API_USER + '/' + user.id +  '/'; //fixme
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
			})
			.catch(res => {
				console.log(res);
				setIsTwoFactor(isTwoFactor);
			});
		}
	}

	useEffect(() => {
        if (!file) {
            setImg(defaultLogo);
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setImg(objectUrl);

        // free memory when ever this component is unmounted
        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);


	//fix MaxLength username
	return (
		<aside id="profile">
			<div id="img-upload">
				<label >
					<img src={img} alt="truc" />
					<input id="input-img" type="file" src={defaultLogo} name="img" accept="image/*"  ref={inputEl} onChange={selectFile}/>
				</label>
			</div>

			<div id="infos">
				<p> {'> '} <input type="text" maxLength={20} id="user-name" onKeyPress={pressedSend} placeholder={getUserName()}  /> </p>
				<p> {'> '} Level</p>
				<p> {'Two factor'} 
					<label id='switch'>
						<input type="checkbox" checked={isTwoFactor} onChange={changeTwoFactor} />
						<span id='slider'></span>
					</label>
				</p>
			</div>
		</aside>
	);
}

export default ProfileSummarySettings;