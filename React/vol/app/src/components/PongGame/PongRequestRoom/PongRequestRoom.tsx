import React, { useEffect, useState } from "react";
import useIsFirstRender from "../../../hooks/useIsFirstRender";
import { usePongContext } from "../PongContext/ProvidePong";


function PongRequestRoom() : JSX.Element
{	
	const { requestRoom } = usePongContext();
	//const isFirst = useIsFirstRender();


	useEffect(() => {
		console.log('render');
		requestRoom();
	}, [])

	return <></>
}

export default PongRequestRoom;