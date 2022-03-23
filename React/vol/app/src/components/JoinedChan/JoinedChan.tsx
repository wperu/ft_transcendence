import React from "react";
import { useChatContext } from "../Sidebar/ChatContext/ProvideChat";
import "./JoinedChan.css";

interface	chan_props
{
	name: string;
}

function JoinedChan(props: chan_props)
{
	const chatCtx = useChatContext();

	function joinChan()
	{
		chatCtx.setCurrentRoom(props.name);
	}

	return (
		<div className="joined_chan">
			<input className="connect_chan" id={"connect_chan" + props.name} 
				type="button" onClick={joinChan}/>
			<label htmlFor={"connect_chan" + props.name} >
				{props.name}
				{/*<input className="leave_chan" id={"leave_chan" + props.name} type="button"/>
				<label htmlFor={"leave_chan" + props.name}>Leave</label>*/}
			</label>
		</div>
	);
}

export default JoinedChan;
