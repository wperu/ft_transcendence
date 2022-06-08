import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PongEndGame } from "../../components/PongEndGame/PongEndGame";
import { RoomState, usePongContext } from "../../components/PongGame/PongContext/ProvidePong";
import { PongGame } from "../../components/PongGame/PongGame";
import "./Pong.css"

const Pong = () => {
	const { id } = useParams<"id">();
    const { room, isAuth, socket } = usePongContext();
    const [finished, setAsFinished] = useState<boolean>(false);
	const navigate					= useNavigate();

    useEffect(() => {
        if (room)
        {
            room.setAsFinished = setAsFinished;
        }
    }, [room]);

	useEffect(() => {
		if (isAuth === true && !room)
		{
			socket.emit("JOIN_ROOM", id);
		}
	}, [isAuth, room, socket, id])

	useEffect(() => {
		if (isAuth)
		{
			socket.on("NO_ROOM", () => {
				navigate("/matchmaking", { replace: true })
			})
		}

		return () => {
			if(isAuth)
				socket.off("NO_ROOM");
		}
	}, [socket, navigate, isAuth])

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
