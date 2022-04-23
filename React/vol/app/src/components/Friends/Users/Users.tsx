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

//fix add refID
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
				<DirectMessage name={props.name} refId={0}/>
				<AddFriendButton user_name={props.name}
							already_friend={true} refId={0}/>
				<BlockUserButton user_name={props.name}
					already_blocked={false} refId={0}/>
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
					already_blocked={true} refId={0}/>
			</div>
		</div>
	);
}