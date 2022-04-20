import React from "react";
import { useNotifyContext, ELevel } from "../NotifyContext/NotifyContext";
import "./MainMenuButton.css";



function MatchmakingButton ()
{
	const notify = useNotifyContext();

	function MatchmakingClick ()
	{
		notify.addNotice(ELevel.info, "mymessagetoyou", 3000);
		
		notify.addNotice(ELevel.error, "mymessagetoyou", 3000);
		
	}

	return <button className="main_menu_button" onClick={MatchmakingClick}>Partie rapide</button>;
}

export default MatchmakingButton;
