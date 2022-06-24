import { Link } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { GameConfig } from "../../Common/Game/GameConfig";
import { IPongUser, usePongContext } from "../PongGame/PongContext/ProvidePong";
import { getPongOpponent, getPongPlayer } from "../PongGame/PongGame";
import './PongEndGame.css'

const PlayerScore = (props: { player: IPongUser} ) => {
    return (
        <aside className="player-score">
            <h3>{props.player.points}</h3>
            <h4>{props.player.username}</h4>
        </aside> 
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
            if (user.username !== player.username && user.username !== opponent.username)
            {
                if (player.points > opponent.points)
                    message = `${player.username} wins !`;
                else
                    message = `${opponent.username} wins !`;
            }

            else if (pongCtx.room?.withdrawal === true)
                message = "You won by withdrawal";
            else if (player.points < GameConfig.DEFAULT_MAX_SCORE)
                message = 'You suck...';

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