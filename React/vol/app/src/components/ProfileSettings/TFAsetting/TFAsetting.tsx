import axios from "axios";
import { useEffect, useState, KeyboardEvent } from "react";
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

	useEffect(() => {
		if (user)
			user.useTwoFa = isTwoFactor;
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

			<Popup open={isOpen} onClose={() => setIsOpen(false)}>
				<input id="tfa_key_input" type="text" onKeyPress={pressedSend} maxLength={6}/>
			</Popup>
		</div>
	);
}

export default TwoFactorAuthSetting;