import React, { useState, useEffect } from "react";
import UnjoinedChan from "../UnjoinedChan/UnjoinedChan";
import { useChatContext } from "../Sidebar/ChatContext/ProvideChat";
import "./UnjoinedChansTab.css";
import useInterval from "../../hooks/useInterval";
import { JoinRoomDto, RoomListDTO } from "../../Common/Dto/chat/room";
import ThisListIsEmpty from "../ThisListIsEmpty/ThisListIsEmpty";

function UnjoinedChansTab()
{
	const chatCtx = useChatContext();

	const [roomList, setRoomList] = useState<Array<RoomListDTO>>([]);

	useEffect(() => {
		chatCtx.socket.on("ROOM_LIST", (data: Array<RoomListDTO>) => {
			setRoomList(data);
		});

		chatCtx.socket.emit("ROOM_LIST");

		return function cleanup() {
			if (chatCtx.socket !== undefined)
			{
				chatCtx.socket.off("ROOM_LIST");
			}
		};
	}, [chatCtx.socket])

	function refreshList()
	{
		chatCtx.socket.emit("ROOM_LIST");
	}

	useInterval(refreshList, 2000);

	function joinChan(event: React.SyntheticEvent)
	{
		event.preventDefault();

		const target = event.target as typeof event.target & {
			name: {value: string};
			password: {value: string};
		};

		if (target.name.value.length !== 0)
		{
			var data: JoinRoomDto;
			if (target.password.value.length > 0)
			{
				console.log("protected by pass: " + target.password.value);
				data =
				{
					roomName: target.name.value,
					password: target.password.value
				};
			}
			else
			{
				data = { roomName: target.name.value, password: null! };
			}
			chatCtx.socket.emit("JOIN_ROOM", data);
			target.name.value = '';
			target.password.value = '';
		}
	}

	return (
		<div id="join_chans_tab">
			<div id="join_chan_by_name">
				<div className="title">
					Join a channel
				</div>
				<form  onSubmit={joinChan}>
					<div id="join_chan_by_name_inputs">
						<input className="join_chan_input" type="text"
							name="name" placeholder="Channel name"/>
						<input className="join_chan_input" type="password"
							name="password" placeholder="Password (if necessary)"/>
					</div>
					<input id="join_chan_button" type="submit" value="Join"/>
				</form>
			</div>
			<div id="globlal_chans_list">
				<div className="title">
					Global channels list
				</div>
				{roomList.length !== 0 ? roomList.map(( element, index ) => (
					<li key={index}>
						<UnjoinedChan name={element.name} id={element.id}
							is_protected={element.has_password} />
					</li>
				))
				: <ThisListIsEmpty text="There is no public channel yet" />}
			</div>
		</div>
	);
}

export default UnjoinedChansTab;
