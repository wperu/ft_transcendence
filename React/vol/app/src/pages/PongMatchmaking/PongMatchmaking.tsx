import { useCallback, useEffect, useState } from "react";
import { usePongContext } from "../../components/PongGame/PongContext/ProvidePong";

/**
 * isSearching Matchmaking status
 * @returns 
 */
function PongMatchmaking()
{
	const [isSearching, setIsSearching] = useState<boolean>(false);
	const { searchRoom, stopSearchRoom } = usePongContext();

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
			<h1><button onClick={changeSearchStatut}>{(!isSearching) ? "matchmaking" : "stop" }</button></h1>
		</div>
	);
}

export { PongMatchmaking };