import React from "react";
import { useNotifyContext } from "../NotifyContext/NotifyContext";
import "./MainMenuButton.css";



function MatchmakingButton ()
{
	const notify = useNotifyContext();

	function MatchmakingClick ()
	{
		notify.addNotice("error", "mymessagetoyou", 3000);
		//alert("Partie rapide/Matchmaking");
	}

	return <button className="main_menu_button" onClick={MatchmakingClick}>Partie rapide</button>;
}

export default MatchmakingButton;
