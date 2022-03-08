import React from "react";
import "./Chat.css";

function Chat() {
	return (
		<div id="chat">
			<div id="messages_list">
				les messages
			</div>
			<footer id="msg_footer">
				<input type="text" id="message_input" placeholder="placeholder" />
				{/*<label htmlFor="send_button">Envoyer</label>*/}
			</footer>
		</div>
	);
}

export default Chat;
