import { useEffect, useState } from "react";
import { ECurrentTab, useChatContext, IRoom } from "../Sidebar/ChatContext/ProvideChat";
import "./JoinedChan.css";

interface	chan_props
{
	id: number
	name: string;
}

function JoinedChan(props: chan_props)
{
	const	chatCtx = useChatContext();
	const	[room, setRoom] = useState<IRoom>();
	let		labelClassName: string = "";

	useEffect(() =>
	{
		setRoom(chatCtx.findRoomById(props.id));
		console.log("a");
	}, [chatCtx.rooms, chatCtx, props.id, chatCtx.findRoomById]);

	if (chatCtx.currentRoom?.room_name === props.name)
		labelClassName = "selected_chan";

	function joinChan()
	{
		chatCtx.setCurrentRoomById(props.id);
		chatCtx.setCurrentTab(ECurrentTab["chat"]);
	}

	return (
		<div className="joined_chan">
			<input className="connect_chan"  id={"connect_chan" + props.name}
				type="button" onClick={joinChan}/>
			<label htmlFor={"connect_chan" + props.name}
			id={"connect_chan_label" + props.name}
			className={"channel_label " + labelClassName} >
				<div className="joined_chan_name">
					{props.name}
				</div>
				<div className={"joined_chan_notif_number" + (!room?.nb_notifs ? " no_notif" : "")}>
					{room?.nb_notifs.toString()}
				</div>
			</label>
		</div>
	);
}

export default JoinedChan;
