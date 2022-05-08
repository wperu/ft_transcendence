import React, {useState, useEffect} from "react";
import JoinedChan from "../JoinedChan/JoinedChan";
import { useChatContext } from "../Sidebar/ChatContext/ProvideChat";
import ThisListIsEmpty from "../ThisListIsEmpty/ThisListIsEmpty";
import "./JoinedChansList.css";



function Joined_chans_list()
{
	const chatCtx = useChatContext();
	const [socket, setSocket] = useState(chatCtx.socket);

	function Content()
	{
		if (chatCtx.rooms.length === 0)
			return (<ThisListIsEmpty text="Tu n'as rejoins aucun channel" />);
		else
			return (
				<div id="joined_chans_list">
					<ul>
						{chatCtx.rooms.map(({room_name, id}, index) => <li key={index}><JoinedChan id={id} name={room_name}/></li>)}
					</ul>
				</div>
			);
	}
	return (
		<Content />
	);
}

export default Joined_chans_list;
