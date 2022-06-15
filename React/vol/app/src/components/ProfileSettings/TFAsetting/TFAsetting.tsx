import axios from "axios";
import { useEffect, useState, KeyboardEvent } from "react";
import QRCode from "react-qr-code";
import Popup from "reactjs-popup";
import { useAuth } from "../../../auth/useAuth";
import IUser from "../../../Common/Dto/User/User";
import { ELevel, useNotifyContext } from "../../NotifyContext/NotifyContext";
import "./TFA.css";

interface twoFAProps
{
	user: IUser;
	is_active: boolean;
	qrUri: string;
}

function TwoFactorAuthSetting(props: twoFAProps)
{
	const [isTwoFactor, setIsTwoFactor]	= useState<boolean>(props.is_active);
	const [isOpen, setIsOpen]			= useState<boolean>(false);
	const { user } = useAuth();
	const {addNotice} = useNotifyContext()

	function changeTwoFactor()
	{
		setIsOpen(true);
	}

	function pressedSend(event: KeyboardEvent<HTMLInputElement>)
	{
		if (event.key === "Enter" && event.currentTarget.value.length > 0)
		{
			if (props.user)
			{
				const url = process.env.REACT_APP_API_USER + '/' + props.user.reference_id +  '/useTwoFactor';
				const headers = {
					'authorization'	: user ? (user.accessCode) : '',
				}
				const body = {
					token: event.currentTarget.value,
				}
				axios({
					method: 'put',
					url: url,
					headers: headers,
					data: body,
				})
				.then(res => {
					if (res.status === 200)
						setIsTwoFactor(!isTwoFactor);
				})
				.catch(res => {
					addNotice(ELevel.error, res.response.data.message, 3000);
				});
			}
			event.currentTarget.value = '';
		}
	};

	useEffect(() => {
		if (user)
			user.useTwoFa = isTwoFactor;
	},[user, isTwoFactor])

	return (
		<div id="tfa_setting">
			2FA
			<input id="tfa_checkbox" type="checkbox" checked={isTwoFactor} onChange={changeTwoFactor} />
			<label id="tfa_switch" htmlFor="tfa_checkbox">
				<span id="tfa_slider"></span>
			</label>

			<Popup className="tfa-popup" open={isOpen} onClose={() => setIsOpen(false)}>
				<div className="tfa-popup-header">
					<QRCode  value={props.qrUri} size={124} />
				</div>
				<div className="tfa-popup-content">
					Enter your token to turn {isTwoFactor ? 'off' : 'on'} google authentificator
					<input id="tfa_key_input" type="text" onKeyPress={pressedSend} maxLength={6}/>
				</div>
			</Popup>
		</div>
	);
}//

export default TwoFactorAuthSetting;
