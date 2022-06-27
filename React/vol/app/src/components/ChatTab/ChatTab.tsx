import React, {KeyboardEvent, useState, useEffect, useCallback, memo, Fragment, useMemo } from "react";
import ChatMessage from "../ChatMessage/ChatMessage";
import { chatContext, ECurrentTab } from "../Sidebar/ChatContext/ProvideChat";
import { RcvMessageDto, SendMessageDTO, UserDataDto } from "../../Common/Dto/chat/room";
import "./ChatTab.css";


interface Prop
{
	socket:  any,
	currentRoom:  any,
	setCurrentTab:  any,
	invitePlayer:  any,
	blockList:  UserDataDto[],
}

const ChatTab = memo(() => 
{
	return (
		<React.Fragment> 
			<chatContext.Consumer>
				{value => (<ChatTabConsumer socket={value.socket} currentRoom={value.currentRoom} setCurrentTab={value.setCurrentTab} invitePlayer={value.invitePlayer} blockList={value.blockList}></ChatTabConsumer>)}
				 
			</chatContext.Consumer>
			<chatContext.Consumer>
				{value => (<SendMessageBar socket={value.socket} id={value.currentRoom?.id} desc={"message"}></SendMessageBar>)}
				 
			</chatContext.Consumer>
		</ React.Fragment> 
	)
});

const ChatTabConsumer = memo((prop : Prop) =>  
{
	const [messages, setMessages] = useState<RcvMessageDto[]>([]);
	const [updated, setUpdated] = useState<Boolean>(false);

	let msg_list_ref = React.createRef<HTMLDivElement>();

	const pressedQuit = useCallback(() => {
		if (prop.currentRoom !== undefined)
		{
			let dto = {
				id:		prop.currentRoom.id,
				name:	prop.currentRoom.room_name,
			}
			prop.socket.emit("LEAVE_ROOM", dto);
			setMessages([]);
			prop.setCurrentTab(ECurrentTab.channels);
		}
	}, [prop.currentRoom, prop.setCurrentTab, prop.socket])

	const sendInvite = useCallback(() => 
	{
		if (prop.currentRoom !== undefined)
		{
			prop.invitePlayer(undefined, prop.currentRoom.id);
		}
	}, [prop.invitePlayer, prop.currentRoom])

	useEffect(() =>
	{
		if (prop.currentRoom !== undefined
			&& prop.currentRoom.room_message.length !== messages.length)
		{
			setMessages([...prop.currentRoom.room_message]);
			setUpdated(true);
		}
	}, [prop.currentRoom, messages.length]);

	useEffect( () =>
	{
		if (msg_list_ref.current && updated === true)
		{
			msg_list_ref.current.scrollTop = msg_list_ref.current.scrollHeight;
			setUpdated(false);
		}
	}, [updated, msg_list_ref, prop.currentRoom]);

	return (
		<div id="ChatTab">
			<header id="chat_quick_options">
				<input type="button"
					name="chat_quick_leave" id="chat_quick_leave"
					value="Leave" onClick={pressedQuit} />
				<input type="button"
					name="chat_quick_invite" id="chat_quick_invite"
					value="Invite to play" onClick={sendInvite} />
			</header>
			<div id="messages_list" ref={msg_list_ref}>
				<ul>
				{
					messages.map(({message, sender, send_date, refId} , index) => {
						if (prop.blockList.find(b => (b.reference_id === refId)) === undefined)
							return <li key={index}><ChatMessage src_name={sender} content={message} time={send_date} refId={refId} /></li>
						return (null);
						})}
				</ul>
			</div>
				
			
		</div>
	);
})

interface ISendMsg 
{ id: number | undefined, socket: any, desc : string }

const areEqual = (prev: ISendMsg, next: ISendMsg) => {
	console.log(prev.id === next.id, prev.socket === next.socket);
	return (prev.id === next.id && prev.socket === next.socket);
}

const SendMessageBar = React.memo((prop : ISendMsg) => 
{

	console.log('reload');
	const [msg, setMsg] = useState<string>('');

	const pressedSend = useCallback((event: KeyboardEvent<HTMLInputElement>) =>	{
		if( event.key === "Enter" && event.currentTarget.value.length > 0 && prop.id)
		{
			let data : SendMessageDTO =
			{
				message: msg,
				room_id: prop.id,
			};
			prop.socket.emit('SEND_MESSAGE', data);
			setMsg('');
		}
	}, [prop.socket, prop.id, msg]);


	return (
		<footer id="msg_footer">
				<input type="text" id="message_input" value={msg} onChange={(text) => { setMsg(text.currentTarget.value) }} onKeyPress={pressedSend} maxLength={300}
					placeholder={prop.desc}/>
		</footer>
	)
}, areEqual)

export default ChatTab;
