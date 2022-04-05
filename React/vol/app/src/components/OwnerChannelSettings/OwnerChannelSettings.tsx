import { useChatContext } from "../Sidebar/ChatContext/ProvideChat";
import ChannelUserList from "../ChannelUserList/ChannelUserList";
import "./OwnerChannelSettings.css"

function OwnerChannelSettings ()
{
	const chatCtx = useChatContext();
	const style = { "--additional_settings_space": "30vh" } as React.CSSProperties;


	function passwordSubmit(event: React.SyntheticEvent)
	{
		event.preventDefault();
		const target = event.target as typeof event.target & {
			password: {value: string};
			password_repeat: {value :string};
		};
		if (target.password.value.length == 0)
			alert("You can't set an empty password");
		else if (target.password.value !== target.password_repeat.value)
			alert("Your entries must be identical");
		else
		{
			if (chatCtx.currentRoom)
				chatCtx.currentRoom.protected = true;
			console.log("password changed/added : \"" + target.password.value + '\"');
			target.password.value = "";
			target.password_repeat.value = "";
		}
	}

	function removePassword()
	{
		if (chatCtx.currentRoom !== undefined)
			chatCtx.currentRoom.protected = false;
		console.log("Password removed");
	}

	function PasswordSettings()
	{
		if (chatCtx.currentRoom?.protected == true)
		{
			return (
				<div id="password_channel_settings" onSubmit={passwordSubmit}>
					<input type="button" value="Retirer le mot de passe" onClick={removePassword}/>
					<form id="password_form">
						<input type="text" name="password" placeholder="Mot de passe" />
						<input type="text" name="password_repeat"
							placeholder="Confirmez le mot de passe" />
						<input type="submit" value="Changer le mot de passe" />
					</form>
				</div>
			);
		}
		else
		{
			return (
				<div id="no_password_channel_settings">
					<form id="password_form" onSubmit={passwordSubmit}>
						<input type="text" name="password" placeholder="Mot de passe" />
						<input type="text" name="password_repeat"
							placeholder="Confirmez le mot de passe" />
						<input type="submit" value="Mettre un mot de passe" />
					</form>
				</div>
			);
		}
	}

	return (
		<div id="channel_owner_settings" style={style}>
			<ChannelUserList />
			<PasswordSettings />
		</div>
	);
}

export default OwnerChannelSettings