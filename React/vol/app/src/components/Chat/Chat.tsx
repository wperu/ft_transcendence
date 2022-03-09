import React, {KeyboardEvent} from "react";
import ChatMessage from "../ChatMessage/ChatMessage";
import "./Chat.css";

function Chat()
{
	function pressedSend(event: KeyboardEvent<HTMLInputElement>)
	{
		if (event.key === "Enter")
		{
			console.log("sending: " + event.currentTarget.value);
			event.currentTarget.value = '';
		}
	};

	return (
		<div id="chat">
			<div id="messages_list">
				<ChatMessage />
				<ChatMessage />
				<ChatMessage />
				<ChatMessage />
				<ChatMessage />
				<ChatMessage />
				<ChatMessage />
				<ChatMessage />
			</div>
			<footer id="msg_footer">
				<input type="text" id="message_input" placeholder="placeholder" onKeyPress={pressedSend}/>
				{/*<label htmlFor="send_button">Envoyer</label>*/}
			</footer>
		</div>
	);
}

export default Chat;
