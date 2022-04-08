import React from "react";
import { useChatContext } from "../Sidebar/ChatContext/ProvideChat";
import { JoinRoomDto } from "../../interface/chat/chatDto";

import "./UnjoinedChan.css";

interface	chan_props
{
	name: string;
}

function UnjoinedChan(props: chan_props)
{
	const chatCtx = useChatContext();

	function joinChan()
	{
		var data : JoinRoomDto = {room_name: props.name};
		chatCtx.socket.emit("JOIN_ROOM", data);
	}
	return (
		<div className="unjoined_chan">
			<div className="chan_name">
				{props.name}
			</div>
			<input className="join_chan" id={"join_chan" + props.name} type="button"
			onClick={joinChan} />
			<label htmlFor={"join_chan" + props.name}>Join</label>
		</div>
	);
}
export default UnjoinedChan;
