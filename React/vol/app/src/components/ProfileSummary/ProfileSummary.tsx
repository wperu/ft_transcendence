import "./ProfileSummary.css";
import defaultLogo from "../../ressources/images/user-icon-0.png";
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

	return (
		<aside id="profile">
			<img id="profile_summary_img" src={defaultLogo} alt="truc" />
			<div id="infos">
				<p> {'> '} {getUserName()}</p>
				<p> {'> '} Level</p>
			</div>
		</aside>
	);
}

export default ProfileSummary;