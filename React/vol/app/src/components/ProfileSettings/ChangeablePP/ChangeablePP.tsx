import axios from "axios";
import IUser from "../../../Common/Dto/User/User";
import FormData from "form-data";
import EditLogo from "../../../ressources/images/draw.png";
import "./ChangeablePP.css"
import { useState } from "react";

interface infoProp
{
	user: IUser;
}

function ChangeablePP (props :infoProp)
{
	const	[update, setUpdate] = useState<boolean>(false);

	function submitPP(e: React.ChangeEvent<HTMLInputElement>)
	{
		if (e.target.files === null || props.user === null)
			return ;
		// setFile(e.target.files[0]);
		const formData = new FormData();
		formData.append("avatar", e.target.files[0]);
		const url = process.env.REACT_APP_API_USER + '/' + props.user.id + '/avatar';
		axios.post(url, formData, {})
		.catch(res => {
			console.log(res);
		})
		.then(res => {
			props.user.avatar_last_update = Date.now() % 10000;
			setUpdate(!update);
		});
	}

	function getAntiCache() : number
	{
		if (props.user === null)
			return (Date.now() % 1000);
		if(props.user.avatar_last_update === undefined)
			props.user.avatar_last_update = Date.now() % 10000;
		return (props.user.avatar_last_update);
	}

	return (
		<label id="pp_label">
			<img src={process.env.REACT_APP_API_USER + '/' + props.user.id + '/avatar?'+ getAntiCache()}
				alt="PP" id="profile_pic"/>
			<img src={EditLogo} alt="edit" className="edit_logo"
				id="profile_pic_edit_logo" />
			<input id="new_pp_input" type="file" name="img"
				accept=".png, .jpg, .jpeg, .webp, .gif" onChange={submitPP}/>
		</label>
	);
}

export default ChangeablePP;
