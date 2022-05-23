import { useState } from "react";
import IUser from "../../../Common/Dto/User/User";
import "./TFA.css";

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

export default TwoFactorAuthSetting;