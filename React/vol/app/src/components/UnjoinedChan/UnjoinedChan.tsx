import React from "react";
import { useChatContext } from "../Sidebar/ChatContext/ProvideChat";
import "./UnjoinedChan.css";
import { JoinRoomDto } from "../../Common/Dto/chat/room";

interface	chan_props
{
	id: number,
	name: string;
	is_protected: boolean;
}

function UnjoinedChan(props: chan_props)
{
	const chatCtx = useChatContext();

	function password_classes(is_protected: boolean)
	{
		if (is_protected)
			return ("");
		return ("invisible");
	}

	function joinChan(event: React.SyntheticEvent)
	{
		event.preventDefault()
		const target = event.target as typeof event.target & {
			password: {value: string};
		};
		var data : JoinRoomDto;
		if (props.is_protected === false) 
			data = {id: props.id, password: null!};
		else
			data = {id: props.id, password: target.password.value};
		chatCtx.socket.emit("JOIN_ROOM", data);
		target.password.value = "";
	}

	return (
		<div className="unjoined_chan">
			<div className="chan_name">
				{props.name}
			</div>
			<form className="unjoined_chan_input" onSubmit={joinChan}>
				<input className={password_classes(props.is_protected)}
					type="password" name="password" placeholder="Mot de passe"/>
				<input className="join_chan" id={"join_chan" + props.name}
					type="submit" />
				<label htmlFor={"join_chan" + props.name}>Join</label>
			</form>
		</div>
	);
}
export default UnjoinedChan;
