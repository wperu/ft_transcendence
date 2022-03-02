import React from "react";
import "./MainMenuButton.css";

function MatchmakingClick ()
{
	alert("Partie rapide/Matchmaking");
}

function MatchmakingButton ()
{
	return <button onClick={MatchmakingClick}>Partie rapide</button>;
}

export default MatchmakingButton;
