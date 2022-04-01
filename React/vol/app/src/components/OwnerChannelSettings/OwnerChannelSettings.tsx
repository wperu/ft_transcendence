import { RcvMessageDto } from "../../interface/chat/chatDto";
import { useChatContext } from "../Sidebar/ChatContext/ProvideChat";
import ChannelUserList from "../ChannelUserList/ChannelUserList";

function OwnerChannelSettings ()
{
	// const chatCtx = useChatContext();

	return (
		<div>
			<ChannelUserList />
		</div>
	);
}

export default OwnerChannelSettings