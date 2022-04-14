import {ELevelInRoom} from "../Sidebar/ChatContext/ProvideChat"
import {InviteUserButton, BanUserButton, MuteUserButton, BlockUserButton, PromoteUserButton} from "../UserBarButtons/UserBarButtons"
import "./ChatUser.css"

interface	props
{
	currentUserLvl: ELevelInRoom;
	targetUsername: string;
	targetUserLvl: ELevelInRoom;
	isBlockedByCurrentUser: boolean;
}

function ChatUser(data: props)
{
	function Buttons()
	{
		if (data.currentUserLvl <= data.targetUserLvl)
		{
			return (
				<div className="chat_user_button_div">
					<InviteUserButton />
					<BlockUserButton user_name={data.targetUsername}
						already_blocked={data.isBlockedByCurrentUser} />
				</div>
			);
		}
		else
		{
			if (data.currentUserLvl === ELevelInRoom.admin)
			{
				return (
					<div className="chat_user_button_div">
						<InviteUserButton />
						<BlockUserButton user_name={data.targetUsername}
							already_blocked={data.isBlockedByCurrentUser} />
						<MuteUserButton user_name={data.targetUsername} />
						<BanUserButton user_name={data.targetUsername} />
					</div>
				);
			}
			else
			{
				return (
					<div className="chat_user_button_div">
						<InviteUserButton />
						<PromoteUserButton user_name={data.targetUsername}
							already_admin={data.targetUserLvl === ELevelInRoom.admin} />
						<BlockUserButton user_name={data.targetUsername}
							already_blocked={data.isBlockedByCurrentUser} />
						<MuteUserButton user_name={data.targetUsername} />
						<BanUserButton user_name={data.targetUsername} />
					</div>
				);
			}
		}
	}

	return (
		<div className="chat_user" >
			<div className="chat_user_username">{data.targetUsername}</div>
			<Buttons />
		</div>
	);
}

export default ChatUser;