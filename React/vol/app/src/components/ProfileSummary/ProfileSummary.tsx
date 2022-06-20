import "./ProfileSummary.css";
import IUser from "../../Common/Dto/User/User";
import { useAuth } from "../../auth/useAuth";
import { IProfileDTO } from "../../Common/Dto/User/ProfileDTO";
import { useEffect, useState } from "react";
import axios from "axios";
import calculateLevel from "../calculateLevel";

function ProfileSummary() {

	const user : IUser | null = useAuth().user;
	const [profile, setProfile] = useState<IProfileDTO | null>(null);

	useEffect(() => {
		if (user)
		{
			if (profile === null)
			{
				let url = process.env.REACT_APP_API_USER + '/profile/' + user.reference_id;
				const headers = {
					authorization: user.accessCode,
				}
				axios.get(url, {headers})
				.then(resp => {
					 const data : IProfileDTO = resp.data;
					setProfile(data);
				})
				.catch(error => {
					// console.log(error);
				});
			}
		}
	}, [user, profile])

	function getUserName() : string
	{
		if (user === null)
			return ("default");
		return (user.username);
	}
	function getRefID() : number
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
				src={process.env.REACT_APP_API_USER + '/' + getRefID() + '/avatar?'+ getAntiCache()}/>
			<div id="infos">
				<p> {'> '} {getUserName()}</p>
				<p> {'> '} Level {calculateLevel(profile?profile.xp:0)}</p>
			</div>
		</aside>
	);
}

export default ProfileSummary;
