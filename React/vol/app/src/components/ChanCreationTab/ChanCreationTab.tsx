import React, { useState } from "react";
import { useChatContext } from "../Sidebar/ChatContext/ProvideChat";
import { useNotifyContext, ELevel } from "../NotifyContext/NotifyContext";
import "./ChanCreationTab.css";
import { CreateRoomDTO } from "../../Common/Dto/chat/room";

function ChanCreationTab()
{
	const chatCtx = useChatContext();
	const notify = useNotifyContext();

	const	[is_protected, setProtected] = useState<boolean>(false);

	function checkPasswordBox()
	{
		setProtected(true);
	}

	function changePasswordBox()
	{
		setProtected(!is_protected);
	}

	function createChan(event: React.SyntheticEvent)
	{
		event.preventDefault();
		const target = event.target as typeof event.target & {
			channel_name: {value: string};
			channel_visibility: {value :string};
			password: {value: string};
			password_confirmation: {value: string};
		};
		console.log(is_protected);
		if (target.channel_name.value.length === 0)
		{
			notify.addNotice(ELevel.error, "The new channel needs a name", 3000);
		}
		else
		{
			var data: CreateRoomDTO;
			if (is_protected === true)
			{
				if (target.password.value.length === 0)
					notify.addNotice(ELevel.error, "You can't set an empty password", 3000);
				else if (target.password.value !== target.password_confirmation.value)
					notify.addNotice(ELevel.error, "The passwords must be the same", 3000);
				else
				{
					data =
					{
						room_name:		target.channel_name.value,
						private_room:	(target.channel_visibility.value === "private_chan"),
						password:		target.password.value,
						isDm:			false,
					};
					chatCtx.socket.emit("CREATE_ROOM", data);
					target.channel_name.value = '';
					target.channel_visibility.value = '';
					target.password.value = '';
					target.password_confirmation.value = '';
					setProtected(false);
				}
			}
			else
			{
				data =
				{
					room_name: target.channel_name.value,
					private_room: (target.channel_visibility.value === "private_chan"),
					isDm: false,
				};
				chatCtx.socket.emit("CREATE_ROOM", data);
				target.channel_name.value = '';
				target.channel_visibility.value = '';
				target.password.value = '';
				target.password_confirmation.value = '';
				setProtected(false);
			}
		}
	}

	return (
		<form id="create_chan" onSubmit={createChan}>
			<div id="visibility_options">
				<input type="radio" name="channel_visibility" id="private_chan"
					value="private_chan" />
				<label htmlFor="private_chan">Private</label>
				<input type="radio" name="channel_visibility" id="public_chan"
					value="public_chan" defaultChecked />
				<label htmlFor="public_chan">Public</label>
			</div>
			<input id="channel_name_input" type="text" name="channel_name"
				placeholder="Channel name" />
			<div id="password_options">
				<div>
					Protect with a password
					<input type="checkbox" id="protected" checked={is_protected}
						onChange={changePasswordBox} name="is_protected" />
				</div>
				<input type="text" name="password" placeholder="Password"
					onChange={checkPasswordBox}/>
				<input type="text" name="password_confirmation"
					placeholder="Confirm password"/>
			</div>
			<footer id="create_chan_validation">
				<input id="create_chan_button" type="submit"
					value="Create the channel"/>
			</footer>
		</form>
	);
}

export default ChanCreationTab;
