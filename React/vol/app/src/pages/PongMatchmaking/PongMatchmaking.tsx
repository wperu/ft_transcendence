import { useCallback, useEffect, useState } from "react";
import { usePongContext } from "../../components/PongGame/PongContext/ProvidePong";
import { Link } from "react-router-dom"
import BackToMainMenuButton from "../../components/FooterButton/BackToMainMenuButton";
import Spinner from "../../components/Spinner/Spinner";
import "./PongMatchmaking.css";
/**
 * isSearching Matchmaking status
 * @returns
 */
function PongMatchmaking()
{
	const [isSearching, setIsSearching] = useState<boolean>(false);
	const { searchRoom, stopSearchRoom, isAuth, socket, needReconect, reconnect } = usePongContext();

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
		return (() => stopSearchRoom());
	}, [socket])

	useEffect(() => {
		if (isSearching)
		{
		}
		else
		{

		}
	}, [isSearching])

	// <div>Auth : {(isAuth) ? "True" : "False"}</div>
	// <div>Searching : {(isSearching) ? "True" : "False"}</div>
	return (
		<div id="matchmaking_page">
			<div id="matchmaking_spinner" >
				{isSearching ? <Spinner /> : null}
			</div>
			<div id="matchmaking_button_section">
				<button className="matchmaking_button" onClick={changeSearchStatut}>
					{(!isSearching) ? "matchmaking" : "stop" }
				</button>
			</div>
			<div> {needReconect ? <button onClick={reconnect}>joinPong</button> : null} </div>
			<footer>
				<Link to="/" replace={false}> <BackToMainMenuButton /> </Link>
				<Link to="/matchmaking/custom" replace={false} >
					<button className="footer_button">custom game</button>
				</Link>
			</footer>
		</div>
	);
}

export { PongMatchmaking };
