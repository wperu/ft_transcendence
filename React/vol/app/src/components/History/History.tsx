import { randomBytes, randomInt } from "crypto";
import React, { useState } from "react";
import HistoryBar from "../HistoryBar/HistoryBar";
import "./History.css";


function History()
{
	const [games, setGames] = useState([1, 2, 4, 12, 2, 4, 4, 2, 10, 10 ,4, 10, 24, 10, 12]);

	return	<ul id="History">
				{games.map((game) => {return(<li key={game}><HistoryBar player1="gg" score1={game} player2="ff" score2={4}/></li>)})}
			</ul>;
}

export default History;