import { useState } from "react";
import { ProvidePong, usePongContext } from "../../components/PongGame/PongContext/ProvidePong";
import { PongGame } from "../../components/PongGame/PongGame";
import { PongMatchmaking } from "../../components/PongMatchmaking/PongMatchmaking";


function Pong()
{
    const [inGame, setInGame] = useState<boolean>(false);
    const pongCtx = usePongContext();

    if (!inGame)
    {
        return (
            <ProvidePong>
                <div>
                    <PongMatchmaking/>
                </div>
            </ProvidePong>
        );
    }
    else
    {
        return (
            <ProvidePong>
                <div>
                    <PongGame/>
                </div>
            </ProvidePong>
        );
    }
}

export { Pong };