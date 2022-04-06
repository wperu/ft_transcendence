import React, { useEffect, useState } from "react";
import { deflate } from "zlib";
import "./HistoryBar.css";

interface Props
{
	player1: string,
	score1: number,
	player2: string,
	score2: number,
	date?: Date, 
}


function HistoryBar(prop: Props)
{
	const [id, setId] = useState<string>("lose-bar");
	useEffect( () => {
		if (prop.score2 < prop.score1)
			setId("win-bar");
		else if (prop.score2 === prop.score1)
			setId("equal-bar");
	}, []);

	return <div className="Bar" id={id}>{prop.player1} {prop.score1} vs {prop.score2} {prop.player2}</div>;
}

export default HistoryBar;