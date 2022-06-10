import { Link } from "react-router-dom";
import { JsxElement } from "typescript";
import { useAuth } from "../../auth/useAuth";
import { GameConfig } from "../../Common/Game/GameConfig";
import { IPongContext, IPongUser, usePongContext } from "../PongGame/PongContext/ProvidePong";
import { getPongOpponent, getPongPlayer } from "../PongGame/PongGame";
import './PongEndGame.css'

const PlayerScore = (props: { player: IPongUser} ) => {
    return (
       // <div>
            <aside className="player-score">
                <h3>{props.player.points}</h3>
                <h4>{props.player.username}</h4>
            </aside> 
        //</div> 
    );
}

const PongEndGame = () => {
    const pongCtx = usePongContext();
    const user = useAuth().user;
    
    let message = 'You won !';

    if (user)
    {
        const player = getPongPlayer(pongCtx, user)
        const opponent = getPongOpponent(pongCtx, user);

        if (player && opponent)
        { 
            if (player.points < GameConfig.DEFAULT_MAX_SCORE)
                message = 'You suck...'

            return (
                <div id="end-msgbox">
                    <h1>{message}</h1>
    
                    <nav id="end-infos">
                        <PlayerScore player = {player}/>
                        <PlayerScore player = {opponent}/>
                    </nav>

                    <Link to="/" replace = {false}>
                        <button id='menu-button'>Main menu</button>
                    </Link>
                </div>
            )
        }
    }
    return (<div></div>)
}

export { PongEndGame };