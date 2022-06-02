import { useCallback, useEffect, useState } from "react";
import { usePongContext } from "../../components/PongGame/PongContext/ProvidePong";

/**
 * isSearching Matchmaking status
 * @returns 
 */
function PongMatchmaking()
{
	const [isSearching, setIsSearching] = useState<boolean>(false);
	const { searchRoom, stopSearchRoom, isAuth } = usePongContext();

	const changeSearchStatut = useCallback(() => {
		if (!isSearching)
		{
			setIsSearching(true);
			searchRoom()
		}
		else
		{
			stopSearchRoom()
			setIsSearching(false);
		}

	}, [searchRoom, stopSearchRoom, isSearching])

	useEffect(() => {
		if (isSearching)
		{

		}
		else
		{

		}
	}, [isSearching])

	return (
		<div>
			<h1><button onClick={changeSearchStatut}>{(!isSearching) ? "matchmaking" : "stop" }</button></h1><br/>
			<div>Auth : {(isAuth) ? "True" : "False"}</div><br/>
			<div>Searching : {(isSearching) ? "True" : "False"}</div><br/>
		</div>
	);
}

export { PongMatchmaking };