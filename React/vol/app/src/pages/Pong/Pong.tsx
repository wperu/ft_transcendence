import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
                <div id="end-msgbox">
                    <h1>END GAME</h1>
                    <Link to="/" replace = {false}>
                        <button>Main menu</button>
                    </Link>
                </div>
            </div>
        )
    }
    else
        return (<PongGame/>)

}
export { Pong };
