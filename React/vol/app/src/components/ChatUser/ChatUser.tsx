import {ELevelInRoom} from "../Sidebar/ChatContext/ProvideChat"
import {InviteUserButton, BanUserButton, MuteUserButton, BlockUserButton,
	PromoteUserButton, AddFriendButton, DirectMessage} from "../UserBarButtons/UserBarButtons"
import "./ChatUser.css"

interface	props
{
	currentUserLvl: ELevelInRoom;
	targetUsername: string;
	refId: number;
	targetUserLvl: ELevelInRoom;
	isBlockedByCurrentUser: boolean;
	isMuted: boolean;
}

function ChatUser(data: props)
{
	//console.log(data.currentUserLvl + " " + data.targetUserLvl);
	function Buttons()
	{
		if (data.currentUserLvl <= data.targetUserLvl)
		{
			return (
				<div className="chat_user_button_div">
					<DirectMessage name={data.targetUsername} refId={data.refId}/>
					<InviteUserButton />
					<AddFriendButton user_name={data.targetUsername}
							already_friend={false} refId={data.refId}/>
					<BlockUserButton user_name={data.targetUsername}
						already_blocked={data.isBlockedByCurrentUser} refId={data.refId}/>
				</div>
			);
		}
		else
		{
			if (data.currentUserLvl === ELevelInRoom.admin)
			{
				return (
					<div className="chat_user_button_div">
						<DirectMessage name={data.targetUsername} refId={data.refId}/>
						<InviteUserButton />
						<AddFriendButton user_name={data.targetUsername}
							already_friend={false} refId={data.refId}/>
						<BlockUserButton user_name={data.targetUsername}
							already_blocked={data.isBlockedByCurrentUser} refId={data.refId}/>
						<MuteUserButton user_name={data.targetUsername} refId={data.refId} />
						<BanUserButton user_name={data.targetUsername} refId={data.refId}/>
					</div>
				);
			}
			else
			{
				return (
					<div className="chat_user_button_div">
						<DirectMessage name={data.targetUsername} refId={data.refId}/>
						<InviteUserButton />
						<AddFriendButton user_name={data.targetUsername}
							already_friend={false} refId={data.refId}/>
						<PromoteUserButton user_name={data.targetUsername}
							already_admin={data.currentUserLvl !== ELevelInRoom.casual} refId={data.refId}/>
						<BlockUserButton user_name={data.targetUsername}
							already_blocked={data.isBlockedByCurrentUser} refId={data.refId}/>
						<MuteUserButton user_name={data.targetUsername} refId={data.refId}/>
						<BanUserButton user_name={data.targetUsername} refId={data.refId}/>
					</div>
				);
			}
		}
	}

	if (data.isMuted)
		return (null);
	else
	{
		return (
			<div className="chat_user" >
				<div className="chat_user_username">{data.targetUsername + data.targetUserLvl + data.currentUserLvl}</div>
				<Buttons />
			</div>
		);
	}
}

export default ChatUser;