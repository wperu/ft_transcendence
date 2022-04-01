import ChatUser from "../ChatUser/ChatUser";
import { useChatContext, ELevelInRoom } from "../Sidebar/ChatContext/ProvideChat";

function ChannelUserList ()
{
	const chatCtx = useChatContext();
	let user_lvl : ELevelInRoom = ELevelInRoom.casual;

	if (chatCtx.currentRoom)
		user_lvl = chatCtx.currentRoom.user_level;
	return (
		<div id="channel_users_list">
			<ChatUser currentUserLvl={user_lvl}/>
			<ChatUser currentUserLvl={user_lvl}/>
			<ChatUser currentUserLvl={user_lvl}/>
			<ChatUser currentUserLvl={user_lvl}/>
			<ChatUser currentUserLvl={user_lvl}/>
			<ChatUser currentUserLvl={user_lvl}/>
			<ChatUser currentUserLvl={user_lvl}/>
			<ChatUser currentUserLvl={user_lvl}/>
			<ChatUser currentUserLvl={user_lvl}/>
			<ChatUser currentUserLvl={user_lvl}/>
			<ChatUser currentUserLvl={user_lvl}/>
		</div>
	);
}

export default ChannelUserList