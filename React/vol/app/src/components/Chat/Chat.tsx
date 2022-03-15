import React, {KeyboardEvent, useEffect, useState} from "react";
import { io, Socket } from "socket.io-client";
import ChatMessage from "../ChatMessage/ChatMessage";
import "./Chat.css";

interface ServerToClientEvents
{
	message: (data: string) => void;
}
  
interface ClientToServerEvents
{
	hello: () => void;
	message: (data: string) => void;
}

interface IState
{
	data : Array<JSX.Element>;
}

function Chat()
{
	//const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents>>();
	const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents>>();
	const [msgLst, setMsgLst] = useState<Array<JSX.Element>>([]);
	

	function addMsg(content : any) : void
	{
		const newChat = <ChatMessage src_name="a" content={content} time="12/34/56 à 12h34" />;
		let newMsglst : Array<JSX.Element> = [...msgLst];
		newMsglst.push(newChat);
		setMsgLst(newMsglst);
	};

	useEffect(() => {
		if (socket === undefined)
			setSocket(io("http://localhost/", { path: "/api/socket.io/", transports: ['websocket'] }));

		if (socket !== undefined)
		{
			console.log("Connection status : " + socket.connected);
			
			// client-side
			socket.on("connect", () => {
				console.log("[CHAT] " + socket.id); // x8WIv7-mJelg7on_ALbx
			});

			socket.on("disconnect", () => {
				console.log(socket.id); // undefined
			});

			socket.on('message', (data : any) => {
				console.log("[CHAT] rcv: " + data); // x8WIv7-mJelg7on_ALbx
				addMsg(data);
			});
		}

		//return function cleanup() { if (socket !== undefined) socket.disconnect() };
	});

	function pressedSend(event: KeyboardEvent<HTMLInputElement>)
	{
		if (event.key === "Enter")
		{
			console.log("[CHAT] sending: " + event.currentTarget.value);
			if (socket !== undefined)
				socket.emit('message', event.currentTarget.value);
			console.log("msg : " + msgLst.length);
			event.currentTarget.value = '';
			
		}
		
	};
	
	return (
		<div id="chat">
			<div id="messages_list" >
			{msgLst.map((el, i) => <div key={i}>{el}</div>)}
			</div>
			<footer id="msg_footer">
				<input type="text" id="message_input" placeholder="placeholder" onKeyPress={pressedSend}/>
				{/*<label htmlFor="send_button">Envoyer</label>*/}
			</footer>
		</div>
	);
}

export default Chat;
