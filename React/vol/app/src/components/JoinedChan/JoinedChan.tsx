import React from "react";
import "./JoinedChan.css";

interface	chan_props
{
	name: string;
}

function JoinedChan(props: chan_props)
{
	return (
		<div className="joined_chan">
			<input className="connect_chan" id={"connect_chan" + props.name} type="button"/>
			<label htmlFor={"connect_chan" + props.name}>
				{props.name}
				{/*<input className="leave_chan" id={"leave_chan" + props.name} type="button"/>
				<label htmlFor={"leave_chan" + props.name}>Leave</label>*/}
			</label>
		</div>
	);
}

export default JoinedChan;
