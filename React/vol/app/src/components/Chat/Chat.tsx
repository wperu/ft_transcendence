import React, {KeyboardEvent, useState, useEffect} from "react";
import ChatMessage from "../ChatMessage/ChatMessage";
import { useChatContext } from "../Sidebar/ChatContext/ProvideChat";
import "./Chat.css";



interface IState
{
	data : Array<JSX.Element>;
}

function Chat()
{
	const [messages, setMessages] = useState<JSX.Element[]>([]);
	let msg_list_ref = React.createRef<HTMLDivElement>();
	
	function pressedSend(event: KeyboardEvent<HTMLInputElement>)
	{
		if (event.key === "Enter" && event.currentTarget.value.length > 0)
		{
			const new_msg =  <ChatMessage src_name="toi" content={event.currentTarget.value} time="12/34/56 à 12h34" />;
			let new_msg_list :JSX.Element[] = [...messages, new_msg];
			setMessages(new_msg_list);
			
			console.log("added: ", event.currentTarget.value);
			console.log(messages.length);
			event.currentTarget.value = '';
		}
		
	};

	useEffect( () => 
	{
		if (msg_list_ref.current)
		{
			console.log("scrolling");
			msg_list_ref.current.scrollTop = msg_list_ref.current.scrollHeight;
		}
	} );
	
	return (
		<div id="chat">
			<header id="chat_quick_options">
				<input type="button"
					name="chat_quick_leave" id="chat_quick_leave"
					value="Quitter" />
				<input type="button"
					name="chat_quick_invite" id="chat_quick_invite"
					value="Inviter à jouer" />
			</header>
			<div id="messages_list" ref={msg_list_ref}>
				{messages}
			</div>
			<footer id="msg_footer">
				<input type="text" id="message_input" placeholder={"send"} onKeyPress={pressedSend}/>
				
			</footer>
		</div>
	);
}

export default Chat;
