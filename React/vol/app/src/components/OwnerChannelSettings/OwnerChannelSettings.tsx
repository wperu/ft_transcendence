import { useChatContext, ERoomVisibility } from "../Sidebar/ChatContext/ProvideChat";
import ChannelUserList from "../ChannelUserList/ChannelUserList";
import "./OwnerChannelSettings.css"

function OwnerChannelSettings ()
{
	const chatCtx = useChatContext();

	const style = { "--additional_settings_space": "30vh" } as React.CSSProperties;

	function PasswordSettings()
	{
		if (chatCtx.currentRoom?.visibility === ERoomVisibility.protected)
		{
			return (
				<div className="channel_password_settings">
					<div>
						Changer de mot de passe
					</div>
					<div>
						Retirer le mot de passe
					</div>
				</div>
			);
		}
		else
		{
			return (
				<div className="channel_password_settings">
					Ajouter un mot de passe
				</div>
			);
		}
	}

	return (
		<div style={style}>
			<ChannelUserList />
			<PasswordSettings />
		</div>
	);
}

export default OwnerChannelSettings