import "./Users.css";
import { BlockUserButton, InviteUserButton, AddFriendButton, DirectMessage }
	from "../../UserBarButtons/UserBarButtons";
import defaultLogo from "../../../ressources/images/user-icon-0.png";


interface	user_props
{
	name: string;
	online: boolean;
}

interface	blocked_user_props
{
	name: string;
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
				<img className="friends_user_profile_pic" src={defaultLogo} alt="truc" />
				<div className="friends_user_username">{props.name}</div>
			</div>
			<div className="chat_user_button_div">
				<InviteUserButton />
				<DirectMessage name={props.name} />
				<AddFriendButton user_name={props.name}
							already_friend={true} />
				<BlockUserButton user_name={props.name}
					already_blocked={false} />
			</div>
		</div>
	);
}

export function BlockedUser(props: blocked_user_props)
{
	return (
		<div className="friends_tab_user">
			<div className="friends_user_infos">
				<img className="friends_user_profile_pic" src={defaultLogo} alt="truc" />
				<div className="friends_user_username blocked_username">{props.name}</div>
			</div>
			<div className="chat_user_button_div">
				<BlockUserButton user_name={props.name}
					already_blocked={true} />
			</div>
		</div>
	);
}