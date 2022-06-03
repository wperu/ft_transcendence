import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PongEndGame } from "../../components/PongEndGame/PongEndGame";
import { RoomState, usePongContext } from "../../components/PongGame/PongContext/ProvidePong";
import { PongGame } from "../../components/PongGame/PongGame";
import "./Pong.css"

const Pong = () => {
    const pongCtx = usePongContext();
    const [finished, setAsFinished] = useState<boolean>();

    useEffect(() => {
        if (pongCtx.room)
        {
            pongCtx.room.setAsFinished = setAsFinished;
        }
    }, [pongCtx.room])

    if (finished)
    {
        return (
            <div>
                <PongGame/>
                <PongEndGame/>
            </div>
        )
    }
    else
        return (<PongGame/>)

}
export { Pong };
