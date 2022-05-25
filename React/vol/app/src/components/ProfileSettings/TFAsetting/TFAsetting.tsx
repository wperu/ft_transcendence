import axios from "axios";
import { useEffect, useState, KeyboardEvent } from "react";
import QRCode from "react-qr-code";
import Popup from "reactjs-popup";
import { useAuth } from "../../../auth/useAuth";
import IUser from "../../../Common/Dto/User/User";
import "./TFA.css";

interface twoFAProps
{
	user: IUser;
	is_active: boolean;
}

function TwoFactorAuthSetting(props: twoFAProps)
{
	const [isTwoFactor, setIsTwoFactor]	= useState<boolean>(props.is_active);
	const [isOpen, setIsOpen]			= useState<boolean>(false);
	const [qrUri, setQrUri]				= useState<string>("other world !");
	const { user } = useAuth();

	function changeTwoFactor()
	{
		setIsOpen(true);
	}

	function pressedSend(event: KeyboardEvent<HTMLInputElement>)
	{
		if ( event.key === "Enter" && event.currentTarget.value.length > 0)
		{
			setIsTwoFactor(!isTwoFactor);
			if (props.user)
			{
				console.log(user?.accessCode);
				const url = process.env.REACT_APP_API_USER + '/' + props.user.reference_id +  '/useTwoFactor'; //fixme
				const headers = {
					'authorization'	: user ? (user.accessCode) : '',
					'grant-type': 'authorization-code',
				}
				const body = {
					token: event.currentTarget.value,
				}
				console.log(url);
				const respo = axios({
					method: 'put',
					url: url,
					headers: headers,
					data: body,
				})
				.then(res => {
					console.log(res);
				})
				.catch(res => {
					console.log(res); //fix parseme pls /!\
					setIsTwoFactor(isTwoFactor);
				});
			}

			event.currentTarget.value = '';
		}
	};

	function getURL() : string
	{
		var ret =  "other world";
		const url = process.env.REACT_APP_API_USER + '/' + props.user.reference_id +  '/twFactorQR'; //fixme
				const headers = {
					'authorization'	: user ? (user.accessCode) : '',
					'grant-type': 'authorization-code',
				}
				console.log(url);
				const respo = axios({
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
					setIsTwoFactor(isTwoFactor);
					return "";
				});

				
				return ret;
	}

	useEffect(() => {
		if (user)
			user.useTwoFa = isTwoFactor;
		getURL();
	},[user, isTwoFactor])

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
			{user?.secret}
			<input id="tfa_key_input" className={getKeyInputVisibility()} type="text" placeholder={user?.secret} />
			
			
				
			<Popup className="my-popup" open={isOpen} onClose={() => setIsOpen(false)}>
				<div id="qrstyle" >
					<QRCode  value={qrUri} size={124} />
					Enter code to turn token {isTwoFactor ? 'off' : 'on'}
					<input id="tfa_key_input" type="text" onKeyPress={pressedSend} maxLength={6}/>
				</div>
			</Popup>
		</div>
	);
}//

export default TwoFactorAuthSetting;