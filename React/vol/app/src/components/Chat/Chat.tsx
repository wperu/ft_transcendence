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
				<ChatMessage src_name="a" content="Lorem ipsum chepakoi" time="12/34/56 à 12h34" />
				<ChatMessage src_name="someone" content="Lorem ipsum chepakoi" time="12/34/56 à 12h34" />
				<ChatMessage src_name="someone" content="Lorem ipsum chepakoi" time="12/34/56 à 12h34" />
				<ChatMessage src_name="someone" content="Lorem ipsum chepakoidgrnjkgdf hbfhdjsakbfhjeav ewdghsafjjmavdj fdakjfehafjkeragf erkfdgsafhdagsfkadjjg fhd sajkfdajk" time="12/34/56 à 12h34" />
				<ChatMessage src_name="z" content="Lorem ipsum chepakoi" time="12/34/56 à 12h34" />
			</div>
			<footer id="msg_footer">
				<input type="text" id="message_input" placeholder="placeholder" onKeyPress={pressedSend}/>
				{/*<label htmlFor="send_button">Envoyer</label>*/}
			</footer>
		</div>
	);
}

export default Chat;
