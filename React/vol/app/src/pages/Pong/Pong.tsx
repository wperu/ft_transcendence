import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PongEndGame } from "../../components/PongEndGame/PongEndGame";
import { RoomState, usePongContext } from "../../components/PongGame/PongContext/ProvidePong";
import { PongGame } from "../../components/PongGame/PongGame";
import "./Pong.css"

const Pong = () => {
	const { id } = useParams<"id">();
    const { room, isAuth, socket } = usePongContext();
    const [finished, setAsFinished] = useState<boolean>(false);

    useEffect(() => {
        if (room)
        {
            room.setAsFinished = setAsFinished;
        }
    }, [room]);

	useEffect(() => {
		console.log("isAuth " + isAuth + " room :" + (room !== undefined));
		if (isAuth === true && !room)
		{
			console.log("Request to spectate")
			//todo try to join as spectator
			socket.emit("JOIN_ROOM", id);
		}
	}, [isAuth, room, socket, id])

    if (finished)
    {
        return (
            <div>
                <PongGame/>
                <PongEndGame/>
            </div>
        )
    }
    else if ( room )
        return (<PongGame/>)
	else
		return (<div>Loading...</div>)

}
export { Pong };
