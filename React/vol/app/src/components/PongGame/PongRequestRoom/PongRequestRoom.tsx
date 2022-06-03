import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useIsFirstRender from "../../../hooks/useIsFirstRender";
import { usePongContext } from "../PongContext/ProvidePong";


function PongRequestRoom() : JSX.Element
{	
	const { requestRoom, needReconect, isAuth }	= usePongContext();
	const navigate								= useNavigate()

	useEffect(() => {
		if (needReconect)
		{
				navigate(-1);
				console.log("need to reconnect !");
		}
	}, [needReconect])
	
	useEffect(() => {
		console.log('render');
		if (isAuth)
			requestRoom();
	}, [isAuth]);

	return <></>
}

export default PongRequestRoom;