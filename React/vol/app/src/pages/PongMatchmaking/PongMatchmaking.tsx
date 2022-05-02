import { useState } from "react";
import { ProvidePong, usePongContext } from "../../components/PongGame/PongContext/ProvidePong";


function PongMatchmaking()
{
    return (
        <ProvidePong>
            <div>
                <h1>waiting for another player...</h1>
            </div>
        </ProvidePong>
    );
}

export { PongMatchmaking };