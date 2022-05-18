import axios from "axios";
import IUser from "../../../interface/User";
import "./ChangeableUsername.css";

interface userProps
{
	user: IUser;
}

function ChangeableUsername(props: userProps)
{
	function getUserName() : string
	{
		if (props.user === null)
			return ("default");
		return (props.user.username);
	}

	function updateUsername() : void
	{
	
		const url = process.env.REACT_APP_API_USER + '/' + props.user.reference_id +  '/' + 'username';
		const headers = {
			//'authorization'	: user.access_token_42,
			//'grant-type': 'authorization-code',
			//'authorization-code': accessCode
			'content-type'	: process.env.REACT_APP_AVATAR_TYPE || '',
		}

		axios.put(url, )
	}

	return (
		<form id="current_profile_username">
			<input type="text" maxLength={20} id="profile_username_input"
				placeholder={getUserName()}  />
			<input type="submit" id="new_username_submit" value="Changer" />
		</form>
	);
}

export default ChangeableUsername;