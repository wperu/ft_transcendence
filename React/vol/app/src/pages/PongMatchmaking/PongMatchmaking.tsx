import { useCallback, useEffect, useState } from "react";
import { usePongContext } from "../../components/PongGame/PongContext/ProvidePong";

/**
 * isSearching Matchmaking status
 * @returns 
 */
function PongMatchmaking()
{
	const [isSearching, setIsSearching] = useState<boolean>(false);
	const { searchRoom, stopSearchRoom, isAuth, socket } = usePongContext();

	const changeSearchStatut = useCallback(() => {
		if (!isSearching)
		{
			searchRoom()
		}
		else
		{
			stopSearchRoom()
		}

	}, [searchRoom, stopSearchRoom, isSearching])


	useEffect(() => {
		socket.on("IS_SEARCHING_ROOM", (isSearching : boolean) => {
			setIsSearching(isSearching);
		})
	}, [socket])

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