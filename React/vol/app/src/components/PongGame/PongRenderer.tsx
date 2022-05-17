import { GameConfig } from "../../Common/Game/GameConfig";
import IUser from "../../interface/User";
import { IPongContext, IPongRoom, RoomState } from "./PongContext/ProvidePong";
import { getPongOpponent, getPongPlayer } from "./PongGame";
import { clear_particles } from "./PongParticleSystem";
import { add_particles, clear_trail, plot_trail } from "./PongTrail";

/*** UPDATE ***/

function update(pong_ctx: IPongContext, deltaTime: number, user: IUser)
{
    let room = pong_ctx.room;
    if (!room)
        return ;

    if (room.state === RoomState.PLAYING)
    {
        updatePlayer(room, user, deltaTime);

        /* update ball position */
        room.ball.pos_x += room.ball.vel_x * deltaTime;
        room.ball.pos_y += room.ball.vel_y * deltaTime;
    }    
}


function updatePlayer(room: IPongRoom, user: IUser, deltaTime: number)
{
    /* move player */
    if (user.username === room.player_1.username)
    {
        if (room.player_1.key !== 0)
            room.player_1.velocity = room.player_1.key * GameConfig.PLAYER_SPEED
        else 
            room.player_1.velocity *= GameConfig.PLAYER_FRICTION; 
    
        if (room.player_2.key === 0)
            room.player_2.velocity *= GameConfig.PLAYER_FRICTION;
    }
    else if (user.username === room.player_2.username)
    {
        if (room.player_2.key !== 0)
            room.player_2.velocity = room.player_2.key * GameConfig.PLAYER_SPEED
        else 
            room.player_2.velocity *= GameConfig.PLAYER_FRICTION;
        
        if (room.player_1.key === 0)
            room.player_1.velocity *= GameConfig.PLAYER_FRICTION;
    }

    /* update positions */
    room.player_1.position += room.player_1.velocity * deltaTime;
    room.player_2.position += room.player_2.velocity * deltaTime;

    /* perform collisions check */
    // 1
    if (room.player_1.position < GameConfig.TERRAIN_PADDING_Y)
    {
        room.player_1.velocity = 0;
        room.player_1.position = GameConfig.TERRAIN_PADDING_Y;
    }

    if (room.player_1.position > 1 - GameConfig.TERRAIN_PADDING_Y)
    {
        room.player_1.velocity = 0;
        room.player_1.position = 1 - GameConfig.TERRAIN_PADDING_Y;
    }

    // 2
    if (room.player_2.position < GameConfig.TERRAIN_PADDING_Y)
    {
        room.player_2.velocity = 0;
        room.player_2.position = GameConfig.TERRAIN_PADDING_Y;
    }

    if (room.player_2.position > 1 - GameConfig.TERRAIN_PADDING_Y)
    {
        room.player_2.velocity = 0;
        room.player_2.position = 1 - GameConfig.TERRAIN_PADDING_Y;
    }
}


/*** RENDER ***/


export interface PongRenderingContext
{
    terrain_x: number,
    terrain_y: number,
    terrain_h: number,
    terrain_w: number,
    width: number,
    height: number,
    deltaTime: number,
    frameTime: number,
    frameCount: number;
}


function getRenderingContext(ctx : CanvasRenderingContext2D | null, canvas: HTMLCanvasElement, last_frame: number, last_time: number = performance.now()) : PongRenderingContext
{
    let render_ctx: PongRenderingContext = {
        terrain_x: 0,
        terrain_y: 0,
        terrain_h: 0,
        terrain_w: 0,
        width: canvas.width,
        height: canvas.height,
        deltaTime: 0,
        frameTime: performance.now(),
        frameCount: ++last_frame,
    };
    /* timed update  */
    render_ctx.deltaTime = (render_ctx.frameTime - last_time) / 1000.0;

    render_ctx.terrain_w = canvas.width;
    render_ctx.terrain_h = canvas.height;

    /* Terrain */
    if (canvas.height * 0.3 < canvas.width)
    {
        render_ctx.terrain_h = canvas.width * 0.6;
    }
    else
    {
        render_ctx.terrain_w = canvas.height * 0.3;
    }

    render_ctx.terrain_h *= 0.8;
    render_ctx.terrain_w *= 0.8;
    render_ctx.terrain_x = (canvas.width - render_ctx.terrain_w) * 0.5;
    render_ctx.terrain_y = (canvas.height - render_ctx.terrain_h) * 0.5;

    return (render_ctx);
}


async function render(pong_ctx: IPongContext, ctx : CanvasRenderingContext2D | null, canvas: HTMLCanvasElement, user: IUser, last_frame: number = 0, last_time: number = performance.now())
{ 
    /* Background */
    ctx = canvas.getContext('2d');
    if (!ctx)
        return (console.log("null cnv"));
    if (pong_ctx === null || pong_ctx.room === null)
    {
        console.log("ctx is null");
        return ;
    }

    let render_ctx: PongRenderingContext = getRenderingContext(ctx, canvas, last_frame, last_time);
    update(pong_ctx, render_ctx.deltaTime, user);

    renderBackground(ctx, render_ctx, pong_ctx, canvas, user);

    renderBall(ctx, render_ctx, pong_ctx, user);

    renderPlayers(ctx, render_ctx, pong_ctx.room, user);

    /* DEV - FPS counter */
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText("FPS: " + (1 / render_ctx.deltaTime), render_ctx.terrain_x, render_ctx.terrain_y - 50);
    ctx.stroke();

    ctx.fillText("delta: "  + render_ctx.deltaTime, render_ctx.terrain_x, render_ctx.terrain_y - 40);
    ctx.stroke();

    ctx.fillText("frameCount: " + render_ctx.frameCount, render_ctx.terrain_x, render_ctx.terrain_y - 30);
    ctx.stroke();
    /* **** */
    
    render_ctx.frameCount++;
    requestAnimationFrame(() => render(pong_ctx, ctx, canvas, user, render_ctx.frameCount, render_ctx.frameTime));
}



function renderBackground(ctx : CanvasRenderingContext2D, render_ctx: PongRenderingContext, pong_ctx: IPongContext, canvas: HTMLCanvasElement, user: IUser)
{
    // TODO review clearing pattern     
    ctx.beginPath();    // clear existing drawing paths
    ctx.save();         // store the current transformation matrix
    // Use the identity matrix while clearing the canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();        // restore the transform
    ctx.fillStyle = '#101016'
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    /* Center line */
    ctx.save();
    ctx.strokeStyle = '#353540'
    ctx.beginPath();
    ctx.lineWidth = 5;
    ctx.moveTo(render_ctx.terrain_x + render_ctx.terrain_w * 0.5, render_ctx.terrain_y);
    ctx.lineTo(render_ctx.terrain_x + render_ctx.terrain_w * 0.5, render_ctx.terrain_y + render_ctx.terrain_h);
    ctx.stroke();
    ctx.restore();

    /* Terrain */
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 10;
    ctx.strokeRect(render_ctx.terrain_x, render_ctx.terrain_y, render_ctx.terrain_w, render_ctx.terrain_h);

    /* Player names */
    if (pong_ctx.room)
    {
        let player = getPongPlayer(pong_ctx, user);
        let opponent = getPongOpponent(pong_ctx, user);

        if (player !== undefined)
        {        
            ctx.save();
            ctx.translate(render_ctx.terrain_x - 10, render_ctx.terrain_y + render_ctx.terrain_h);
            ctx.rotate(Math.PI + Math.PI * 0.5);
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "20px NonFiction"
            ctx.fillText(player.username.toUpperCase(), 0, 0);
            ctx.restore();
        }

        if (opponent !== undefined)
        { 
            ctx.save();
            ctx.translate(render_ctx.terrain_x + render_ctx.terrain_w + 10, render_ctx.terrain_y);
            ctx.rotate(Math.PI * 0.5);
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "20px NonFiction"
            ctx.fillText(opponent.username.toUpperCase(), 0, 0);
            ctx.restore();
        }
    }
}



function renderPlayers(ctx : CanvasRenderingContext2D, render_ctx: PongRenderingContext, room: IPongRoom, user: IUser)
{
    let player_1_x, player_1_y, player_1_sz_x, player_1_sz_y;
    let player_2_x, player_2_y, player_2_sz_x, player_2_sz_y;
    
    player_1_sz_y = render_ctx.terrain_h * 0.25;
    player_1_sz_x = render_ctx.terrain_w * 0.02;
    player_2_sz_y = render_ctx.terrain_h * 0.25;
    player_2_sz_x = render_ctx.terrain_w * 0.02;


    let terrain_padding = render_ctx.terrain_w * 0.03;

    let player_pos = 0;
    let opponent_pos = 0;


    /* Player 1-2 in the context ARE NOT the same as player_1 and player_2 in front-end
       player_1 is always the current player, and player_2 is the opponent */    
    if (user.username === room.player_1.username)
    {
        player_pos = room.player_1.position;
        opponent_pos = room.player_2.position;
    }
    else if (user.username === room.player_2.username)
    {
        player_pos = room.player_2.position;
        opponent_pos = room.player_1.position;  
    }

    player_1_x = render_ctx.terrain_x + terrain_padding;
    player_1_y = render_ctx.terrain_y + (player_pos) * render_ctx.terrain_h - player_1_sz_y * 0.5;

    player_2_x = render_ctx.terrain_x + render_ctx.terrain_w - terrain_padding - player_2_sz_x;
    player_2_y = render_ctx.terrain_y + (opponent_pos) * render_ctx.terrain_h - player_2_sz_y * 0.5;


    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(player_1_x, player_1_y, player_1_sz_x, player_1_sz_y);
    ctx.fillRect(player_2_x, player_2_y, player_2_sz_x, player_2_sz_y);
}



function renderBall(ctx : CanvasRenderingContext2D, render_ctx: PongRenderingContext, pong_ctx: IPongContext, user: IUser)
{
    let ball_x = 0, ball_y = 0;

    if (!pong_ctx.room)
        return ;

    if (user.username === pong_ctx.room.player_1.username)
    {
        ball_x = render_ctx.terrain_x + (pong_ctx.room.ball.pos_x) * (render_ctx.terrain_w * 0.5);
        ball_y = render_ctx.terrain_y + (pong_ctx.room.ball.pos_y) * render_ctx.terrain_h;
    }
    else if (user.username === pong_ctx.room.player_2.username)
    {
        ball_x = render_ctx.terrain_x + render_ctx.terrain_w - ((pong_ctx.room.ball.pos_x) * (render_ctx.terrain_w * 0.5));
        ball_y = render_ctx.terrain_y +  (pong_ctx.room.ball.pos_y) * render_ctx.terrain_h;
    }

    if (pong_ctx.room.state === RoomState.LOADING && pong_ctx.room.ball.size < GameConfig.BALL_SIZE)
    {
        clear_trail(pong_ctx);
        pong_ctx.room.ball.size += render_ctx.deltaTime * 0.4;
    }
    else
    {
        if (pong_ctx.room.state !== RoomState.ENDED)
            add_particles(pong_ctx, ball_x, ball_y, render_ctx);
        plot_trail(pong_ctx, ctx, render_ctx);
    }

    /* Ball */
    let ball_size = render_ctx.terrain_h * (pong_ctx.room.ball.size * 0.1);
    if (pong_ctx.room.state === RoomState.ENDED)
        ball_size = 0;
    ctx.fillStyle = '#FFFFFF'
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(ball_x,
                ball_y, 
                ball_size,
                ball_size,
                Math.PI / 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
}



export { render }