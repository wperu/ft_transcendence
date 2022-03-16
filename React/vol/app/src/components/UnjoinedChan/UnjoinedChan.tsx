import React from "react";
import "./UnjoinedChan.css";

interface	chan_props
{
	name: string;
}

function UnjoinedChan(props: chan_props)
{
	return (
		<div className="unjoined_chan">
			<div className="chan_name">
				{props.name}
			</div>
			<input className="join_chan" id={"join_chan" + props.name} type="button"/>
			<label htmlFor={"join_chan" + props.name}>Join</label>
		</div>
	);
}
export default UnjoinedChan;
