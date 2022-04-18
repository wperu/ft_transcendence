import "./Users.css";
import { BlockUserButton, InviteUserButton }
	from "../../UserBarButtons/UserBarButtons";
import defaultLogo from "../../../ressources/images/user-icon-0.png";


interface	user_props
{
	name: string;
	online: boolean;
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
				<img className="friend_profile_pic" src={defaultLogo} alt="truc" />
				<div className="friend_username">{props.name}</div>
			</div>
			<div className="chat_user_button_div">
				<InviteUserButton />
				<BlockUserButton user_name={props.name}
					already_blocked={false} />
			</div>
		</div>
	);
}