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
	isDm: boolean;
}

function ChatUser(data: props)
{
	function Buttons()
	{
		if (data.currentUserLvl <= data.targetUserLvl || data.isDm)
		{
			return (
				<div className="chat_user_button_div">
					<DirectMessage name={data.targetUsername} refId={data.refId}/>
					<InviteUserButton  refId={data.refId}/>
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
						<InviteUserButton refId={data.refId}/>
						<AddFriendButton user_name={data.targetUsername}
							already_friend={false} refId={data.refId}/>
						<BlockUserButton user_name={data.targetUsername}
							already_blocked={data.isBlockedByCurrentUser} refId={data.refId}/>
						<MuteUserButton user_name={data.targetUsername} refId={data.refId} isMuted={data.isMuted} />
						<BanUserButton user_name={data.targetUsername} refId={data.refId}/>
					</div>
				);
			}
			else
			{
				return (
					<div className="chat_user_button_div">
						<DirectMessage name={data.targetUsername} refId={data.refId}/>
						<InviteUserButton refId={data.refId}/>
						<AddFriendButton user_name={data.targetUsername}
							already_friend={false} refId={data.refId}/>
						<PromoteUserButton user_name={data.targetUsername}
							already_admin={data.targetUserLvl !== ELevelInRoom.casual} refId={data.refId}/>
						<BlockUserButton user_name={data.targetUsername}
							already_blocked={data.isBlockedByCurrentUser} refId={data.refId}/>
						<MuteUserButton user_name={data.targetUsername} refId={data.refId} isMuted={data.isMuted}/>
						<BanUserButton user_name={data.targetUsername} refId={data.refId}/>
					</div>
				);
			}
		}
	}

	return (
		<div className="chat_user" >
			<div className="chat_user_username">{data.targetUsername + data.targetUserLvl}</div>
			<Buttons />
		</div>
	);
}

export default ChatUser;