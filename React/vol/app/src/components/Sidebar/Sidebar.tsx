import React, {useState, useEffect} from "react";
import "./Sidebar.css";
import Chat from "../Chat/Chat";
import Channels from "../Channels/Channels";
import Friends from "../Friends/Friends";
import { useChatContext, ECurrentTab } from "../Sidebar/ChatContext/ProvideChat";
import { Socket } from "socket.io-client";

interface prop
{
	currentTab: ECurrentTab;
}

function Content(props: prop)
{
	if (props.currentTab === ECurrentTab.chat)
		return (<Chat />);
	else if (props.currentTab === ECurrentTab.friends)
		return (<Friends />);
	else
		return (<Channels />);
}

function Sidebar()
{
	const chatCtx = useChatContext();

	function handleChange(event: React.ChangeEvent<HTMLInputElement>)
	{
		let tmp: ECurrentTab = ECurrentTab[event.target.value as keyof typeof ECurrentTab];

		if (tmp === ECurrentTab.chat && chatCtx.currentRoom === undefined)
			return; //Todo add notification no chan join

		chatCtx.setCurrentTab(tmp);
	};

	useEffect(() =>
	{
		if(chatCtx.currentRoom === undefined && chatCtx.currentTab === ECurrentTab.chat)
			chatCtx.setCurrentTab(ECurrentTab.channels);
	}, [chatCtx.currentRoom])

	if (chatCtx.isConnected)
		return (
			<div id="sidebar">
				<input id="toggle" type="checkbox" />
				<label htmlFor="toggle"></label>
				<div id="actual_bar">
					<header>
						<input className="tab_button" type="radio"
							checked={chatCtx.currentTab == ECurrentTab.friends}
							name="tab" id="friends" value={ECurrentTab.friends}
							onChange={handleChange} />
						<label htmlFor="friends"> Friends</label>
						<input className="tab_button" type="radio"
							checked={chatCtx.currentTab == ECurrentTab.channels}
							name="tab" id="channels" value={ECurrentTab.channels}
							onChange={handleChange}/>
						<label htmlFor="channels">Channels</label>
						<input className="tab_button" type="radio"
							checked={chatCtx.currentTab == ECurrentTab.chat}
							name="tab" id="chats" value={ECurrentTab.chat}
							onChange={handleChange} />
						<label htmlFor="chats">Chat</label>
					</header>
					<Content currentTab={chatCtx.currentTab} />
				</div>
			</div>
		);
	else
		return (
			<div id="sidebar">
				<input id="toggle" type="checkbox" />
				<label htmlFor="toggle"></label>
				<div id="actual_bar">
					<header>
							Loading..
					</header>
					<Content currentTab={chatCtx.currentTab} />
				</div>
			</div>
		)
}



export default Sidebar;
