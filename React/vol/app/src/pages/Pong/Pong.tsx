import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PongEndGame } from "../../components/PongEndGame/PongEndGame";
import { RoomState, usePongContext } from "../../components/PongGame/PongContext/ProvidePong";
import { PongGame } from "../../components/PongGame/PongGame";
import "./Pong.css"

const Pong = () => {
	const { id } = useParams<"id">();
    const { room, isAuth } = usePongContext();
    const [finished, setAsFinished] = useState<boolean>(false);

    useEffect(() => {
        if (room)
        {
            room.setAsFinished = setAsFinished;
        }
    }, [room]);

	useEffect(() => {
		if (isAuth === true)
		{
			//todo try to join as spectator
		}
	}, [isAuth])



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
