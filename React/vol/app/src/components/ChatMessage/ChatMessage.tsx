// import React from "react";
import "./ChatMessage.css";

function ChatMessage()
{
	return (
		<div class="message">
			<header>
				<div class="msg_src">Ta sœur</div>
				<div class="msg_time">12/34/56 à 12h78</div>
			</header>
			<div class="msg_content">Lorem Ipsum</div>
		</div>
	);
}

export default ChatMessage;
