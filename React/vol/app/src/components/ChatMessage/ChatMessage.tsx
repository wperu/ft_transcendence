// import React from "react";
import "./ChatMessage.css";

interface MessageProps
{
	time: string;
	src_name: string;
	content: string;
}

function ChatMessage(props: MessageProps)
{
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
