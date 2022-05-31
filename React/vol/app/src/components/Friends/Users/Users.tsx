import "./Users.css";
import { BlockUserButton, InviteUserButton, AddFriendButton, DirectMessage }
	from "../../UserBarButtons/UserBarButtons";
import { Link } from "react-router-dom";


interface	user_props
{
	name: string;
	ref_id: number;
	online: boolean;
}

interface	blocked_user_props
{
	name: string;
	ref_id: number;
}

export function Friend(props: user_props)
{

	function get_opacity()
	{
		if (props.online)
			return ("friends_tab_user");
		return ("friends_tab_user offline");
	}
	return (
		<div className={get_opacity()}>
			<div className="friends_user_infos">
				<img className="friends_user_profile_pic"
					src={process.env.REACT_APP_API_USER + '/' + props.ref_id + '/avatar'} alt="42" />
				<div className="friends_user_username">
					<Link to={"/profile/" + props.ref_id}  replace={false} >{props.name}</Link>
				</div>
			</div>
			<div className="chat_user_button_div">
				<InviteUserButton refId={props.ref_id}/>
				<DirectMessage name={props.name} refId={props.ref_id}/>
				<AddFriendButton user_name={props.name}
							already_friend={true} refId={props.ref_id}/>
				<BlockUserButton user_name={props.name}
					already_blocked={false} refId={props.ref_id}/>
			</div>
		</div>
	);
}

export function BlockedUser(props: blocked_user_props)
{
	return (
		<div className="friends_tab_user">
			<div className="friends_user_infos">
				<img className="friends_user_profile_pic" src="" alt="truc" />
				<div className="friends_user_username blocked_username">
					<Link to={"/profile/" + props.ref_id} replace={false}> {props.name}</Link>
				</div>
			</div>
			<div className="chat_user_button_div">
				<BlockUserButton user_name={props.name}
					already_blocked={true} refId={props.ref_id}/>
			</div>
		</div>
	);
}
