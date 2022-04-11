import {ELevelInRoom} from "../Sidebar/ChatContext/ProvideChat"
import {InviteUserButton, BanUserButton, MuteUserButton, BlockUserButton, PromoteUserButton} from "../UserBarButtons/UserBarButtons"
import "./ChatUser.css"

interface	props
{
	currentUserLvl: ELevelInRoom;
	username: string;
}

function ChatUser (data: props)
{
	function Buttons()
	{
		if (data.currentUserLvl === ELevelInRoom.casual)
		{
			return (
				<div className="chat_user_button_div">
					<InviteUserButton />
					<BlockUserButton user_name={data.username}/>
				</div>
			);
		}
		else if (data.currentUserLvl === ELevelInRoom.admin)
		{
			return (
				<div className="chat_user_button_div">
					<InviteUserButton />
					<BlockUserButton user_name={data.username}/>
					<MuteUserButton user_name={data.username}/>
					<BanUserButton user_name={data.username}/>
				</div>
			);
		}
		else
		{
			return (
				<div className="chat_user_button_div">
					<InviteUserButton />
					<PromoteUserButton user_name={data.username}/>
					<BlockUserButton user_name={data.username}/>
					<MuteUserButton user_name={data.username}/>
					<BanUserButton user_name={data.username}/>
				</div>
			);
		}
	}

	return (
		<div className="chat_user" >
			<div className="chat_user_username">{data.username}</div>
			<Buttons />
		</div>
	);
}

export default ChatUser;