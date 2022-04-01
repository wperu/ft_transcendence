import {ELevelInRoom} from "../Sidebar/ChatContext/ProvideChat"
import {InviteUserButton, BanUserButton, MuteUserButton, BlockUserButton} from "../UserBarButtons/UserBarButtons"
import "./ChatUser.css"

interface	props
{
	currentUserLvl: ELevelInRoom;
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
					<BlockUserButton />
				</div>
			);
		}
		else
		{
			return (
				<div className="chat_user_button_div">
					<InviteUserButton />
					<BlockUserButton />
					<MuteUserButton />
					<BanUserButton />
				</div>
			);
		}
	}

	return (
		<div className="chat_user" >
			Random user
			<Buttons />
		</div>
	);
}

export default ChatUser;