import "./ProfileSummary.css";

import IUser from "../../Common/Dto/User/User";
import { useAuth } from "../../auth/useAuth";

function ProfileSummary() {

	const user : IUser | null = useAuth().user;

	function getUserName() : string
	{
		if (user === null)
			return ("default");
		return (user.username);
	}
	function getID() : number
	{
		if (user === null)
			return (0);
		return (user.reference_id);
	}
	function getAntiCache() : number
	{
		if (user === null)
			return (Date.now() % 1000);
		if(user.avatar_last_update === undefined)
			user.avatar_last_update = Date.now() % 10000;
		return (user.avatar_last_update);
	}

	return (
		<aside id="profile">
			<img id="profile_summary_img" alt="truc"
				src={process.env.REACT_APP_API_USER + '/' + getID() + '/avatar?'+ getAntiCache()}/>
			<div id="infos">
				<p> {'> '} {getUserName()}</p>
				<p> {'> '} Level</p>
			</div>
		</aside>
	);
}

export default ProfileSummary;
