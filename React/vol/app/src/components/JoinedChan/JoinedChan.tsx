import React from "react";
import { ECurrentTab, useChatContext } from "../Sidebar/ChatContext/ProvideChat";
import "./JoinedChan.css";

interface	chan_props
{
	name: string;
}

function JoinedChan(props: chan_props)
{
	const	chatCtx = useChatContext();
	let		labelClassName: string = "";

	if (chatCtx.currentRoom?.room_name === props.name)
		labelClassName = "selected_chan";

	function joinChan()
	{
		chatCtx.setCurrentRoomByName(props.name);
		chatCtx.setCurrentTab(ECurrentTab["chat"]);
	}
	
	return (
		<div className="joined_chan">
			<input className="connect_chan"  id={"connect_chan" + props.name}
				type="button" onClick={joinChan}/>
			<label htmlFor={"connect_chan" + props.name} id={"connect_chan_label" + props.name} className={labelClassName}>
				{props.name}
				{/*<input className="leave_chan" id={"leave_chan" + props.name} type="button"/>
				<label htmlFor={"leave_chan" + props.name}>Leave</label>*/}
			</label>
		</div>
	);
}

export default JoinedChan;
