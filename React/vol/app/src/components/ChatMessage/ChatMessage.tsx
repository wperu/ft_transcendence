// import { useEffect } from "react";
// import { useChatContext } from "../Sidebar/ChatContext/ProvideChat";
import "./ChatMessage.css";

interface MessageProps
{
	time: string;
	src_name: string;
	content: string;
	refId: number;
}

//todo block user
function ChatMessage(props: MessageProps)
{
	/*const { blockList } = useChatContext();


	if (blockList.find(({reference_id}) => {  return (reference_id === props.refId)}))
	{
		return (
			<div className="message">
				<header>
					<div className="msg_src">{'blocked'}</div>
					<div className="msg_time">{props.time}</div>
				</header>
				<div className="msg_content">{'*********'}</div>
			</div>
		);
	}
	else */
		return (
			<div className="message">
				<header>
					<div className="msg_src">{props.src_name}</div>
					<div className="msg_time">{props.time}</div>
				</header>
				<div className="msg_content">{props.content}</div>
			</div>
		);
}

export default ChatMessage;
