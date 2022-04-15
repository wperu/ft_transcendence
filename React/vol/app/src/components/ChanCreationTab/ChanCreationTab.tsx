import React from "react";
import { useChatContext } from "../Sidebar/ChatContext/ProvideChat";
import "./ChanCreationTab.css";
import { CreateRoom } from "../../Common/Dto/chat/room";

function ChanCreationTab()
{
	const chatCtx = useChatContext();
	function CreateChan(event: React.SyntheticEvent)
	{
		event.preventDefault();
		const target = event.target as typeof event.target & {
			channel_name: {value: string};
			channel_visibility: {value :string};
			password: {value: string};
			is_protected: {value: boolean};
		};
		if (target.channel_name.value.length === 0)
		{
			alert("The new channel needs a name");
		}
		else
		{
			
			var data: CreateRoom;
			if (target.is_protected)
			{		
				
				data =
				{
					room_name: target.channel_name.value,
					private_room: (target.channel_visibility.value === "private_chan"),
					password: target.password.value,
				};
			}
			else
			{
				data =
				{
					room_name: target.channel_name.value,
					private_room: (target.channel_visibility.value === "private_chan"),
				};
			}
			chatCtx.socket.emit("CREATE_ROOM", data);
			target.channel_name.value = '';
			target.channel_visibility.value = '';
			target.password.value = '';
			target.is_protected.value = false;
		}
	}

	return (
		<form id="create_chan" onSubmit={CreateChan}>
			<div id="visibility_options">
				<input type="radio" name="channel_visibility" id="private_chan"
					value="private_chan" />
				<label htmlFor="private_chan">Privé</label>
				<input type="radio" name="channel_visibility" id="public_chan"
					value="public_chan" defaultChecked />
				<label htmlFor="public_chan">Publique</label>
			</div>
			<input id="channel_name_input" type="text" name="channel_name"
				placeholder="Nom du channel" />
			<div id="password_options">
				<div>
					Protéger par mot de passe
					<input type="checkbox" id="protected" name="is_protected" />
				</div>
				<input type="text" name="password" placeholder="Mot de passe"/>
			</div>
			<footer id="create_chan_validation">
				<input id="create_chan_button" type="submit"
					value="Créer le channel"/>
			</footer>
		</form>
	);
}

export default ChanCreationTab;
