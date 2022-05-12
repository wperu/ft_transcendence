import React, {useState, useEffect} from "react";
import JoinedChan from "../JoinedChan/JoinedChan";
import { useChatContext } from "../Sidebar/ChatContext/ProvideChat";
import ThisListIsEmpty from "../ThisListIsEmpty/ThisListIsEmpty";
import "./JoinedChansList.css";

interface	chanListProps
{
	which: string;
}

function Channels()
{
	const chatCtx = useChatContext();

	if (chatCtx.rooms.length === 0)
		return (<ThisListIsEmpty text="Tu n'as rejoins aucun channel" />);
	else
	{
		return (
			<div id="joined_chans_list">
				<ul>
				{chatCtx.rooms.map(({room_name, id, isDm}, index) => {
						if (!isDm)
							return (<li key={index}><JoinedChan id={id} name={room_name}/></li>);
						else
							return (null);
					})}
				</ul>
			</div>
		);
	}
}

function PrivateMessages()
{
	const chatCtx = useChatContext();

	if (chatCtx.rooms.length === 0)
		return (<ThisListIsEmpty text="Tu n'as aucune conversation privée" />);
	else
	{
		return (
			<div id="pms_list">
				<ul>
					{chatCtx.rooms.map(({room_name, id, isDm, owner}, index) => {
						if (isDm && chatCtx.blockList.find(b => (b.reference_id === owner)) === undefined)
							return (<li key={index}><JoinedChan id={id} name={room_name}/></li>);
						else
							return (null);
					})}
				</ul>
			</div>
		);
	}
}

function JoinedChansList()
{
	const [currentTab, setCurrentTab] = useState<string>("channels");

	function Content(props: chanListProps)
	{
		if (props.which === "channels")
			return (<Channels />);
		else
			return (<PrivateMessages />);
	}

	function handleChange(event: React.ChangeEvent<HTMLInputElement>)
	{
		setCurrentTab(event.target.value);
	}

	return (
		<div id="joined_chans_tab">
			<header id="channels_pms_buttons">
				<input className="channels_pms_tab_button" type="radio"
					name="channels_or_pms" id="channel_list"
					value="channels" onChange={handleChange} defaultChecked />
				<label htmlFor="channel_list">Channels</label>
				<input className="channels_pms_tab_button" type="radio"
					name="channels_or_pms" id="private_messages_list"
					value="pms" onChange={handleChange} />
				<label htmlFor="private_messages_list">Private messages</label>
			</header>
			<Content which={currentTab} />
		</div>
	);
}

export default JoinedChansList;
