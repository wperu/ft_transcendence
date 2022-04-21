import { useState } from "react";
import { PongGame } from "../../components/PongGame/PongGame";
import { PongMatchmaking } from "../../components/PongMatchmaking/PongMatchmaking";


function Pong()
{
    const [inGame, setInGame] = useState<boolean>(false);

    // 

    if (!inGame)
    {
        return (
            <div>
                <PongMatchmaking/>
            </div>
        );
    }
    else
    {
        return (
            <div>
                <PongGame/>
            </div>
        );
    }
}

export { Pong };