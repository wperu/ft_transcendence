import React from "react";
import "./ChanCreationTab.css";

function ChanCreationTab()
{
	function CreateChanClick ()
	{
		alert("Channel creation button pressed");
	}

	return (
		<div id="create_chan">
			<div id="visibility_options">
				<input type="radio" name="channel_visibility" id="private_chan"
					value="private_chan" />
				<label htmlFor="private_chan">Privé</label>
				<input type="radio" name="channel_visibility" id="public_chan"
					value="public_chan" defaultChecked />
				<label htmlFor="public_chan">Publique</label>
			</div>
			<input id="channel_name_input" type="text" maxLength={20}
				placeholder="Nom du channel" />
			<div id="password_options">
				<div>
					Protéger par mot de passe
					<input type="checkbox" id="protected" />
				</div>
				<input type="password" minLength={1} maxLength={30} placeholder="Mot de passe"/>
			</div>
			<footer id="create_chan_validation">
				<input id="create_chan_button" type="button"
					value="Créer le channel" onClick={CreateChanClick} />
			</footer>
		</div>
	);
}

export default ChanCreationTab;
