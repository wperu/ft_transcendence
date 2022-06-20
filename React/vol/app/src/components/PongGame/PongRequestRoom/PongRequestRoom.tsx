import React, { useEffect } from "react";
import {  useNavigate } from "react-router-dom";
import { usePongContext } from "../PongContext/ProvidePong";


function PongRequestRoom() : JSX.Element
{	
	const { requestRoom, needReconect, isAuth }	= usePongContext();
	const navigate								= useNavigate()

	useEffect(() => {
		if (needReconect)
		{
				navigate("/matchmaking");
				// console.log("need to reconnect !");
		}
	}, [needReconect, navigate])
	
	useEffect(() => {
		// console.log('render');
		if (isAuth)
			requestRoom();
	}, [isAuth, requestRoom]);

	return <></>
}

export default PongRequestRoom;