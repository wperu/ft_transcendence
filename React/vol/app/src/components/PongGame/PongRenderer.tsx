import { GameConfig } from "../../Common/Game/GameConfig";
import IUser from "../../Common/Dto/User/User";
import { IPongContext, IPongRoom, RoomState, usePongContext } from "./PongContext/ProvidePong";
import { getPongOpponent, getPongPlayer } from "./PongGame";
import { add_particles, clear_trail, plot_trail } from "./PongTrail";
import { useEffect } from "react";

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
    render_ctx.deltaTime = (render_ctx.frameTime - last_time) * 0.001;

    render_ctx.terrain_w = canvas.width;
    render_ctx.terrain_h = canvas.height;

    let ratio = 2;
    if (canvas.width > canvas.height * ratio)
    {
        render_ctx.terrain_w = canvas.height * ratio;
    }
    else
    {
        render_ctx.terrain_h = canvas.width / ratio;
    }

    render_ctx.terrain_h *= 0.8;
    render_ctx.terrain_w *= 0.8;
    render_ctx.terrain_x = (canvas.width - render_ctx.terrain_w) * 0.5;
    render_ctx.terrain_y = (canvas.height - render_ctx.terrain_h) * 0.5;

    return (render_ctx);
}

const useRender = (canvasRef: React.RefObject<HTMLCanvasElement>, user: IUser, last_frame: number = 0, last_time: number = performance.now()) => {
	
	const pong_ctx: IPongContext = usePongContext();
	
	useEffect(() => {
		let frameId : number;
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext('2d');

		const render = async (pong_ctx: IPongContext, ctx : CanvasRenderingContext2D | null, canvas: HTMLCanvasElement, user: IUser, last_frame: number = 0, last_time: number = performance.now()) =>
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
			
			if (pong_ctx.room.state !== RoomState.PAUSED && pong_ctx.room.state !== RoomState.FINISHED)
				update(pong_ctx, render_ctx.deltaTime, user);
		
			renderBackground(ctx, render_ctx, pong_ctx, canvas, user);
			renderBall(ctx, render_ctx, pong_ctx, user);
			renderPlayers(ctx, render_ctx, pong_ctx.room, user);
		
			if (pong_ctx.room.state === RoomState.PAUSED)
				renderPauseScreen(ctx, render_ctx);
		
			/* DEV - FPS counter */
			ctx.font = "10px Mono"
			ctx.fillStyle = '#FFFFFF'
			ctx.fillText("FPS: " + (1 / render_ctx.deltaTime), render_ctx.terrain_x, render_ctx.terrain_y - 50);
			ctx.stroke();
		
			ctx.fillText("delta: "  + render_ctx.deltaTime, render_ctx.terrain_x, render_ctx.terrain_y - 40);
			ctx.stroke();
		
			ctx.fillText("frameCount: " + render_ctx.frameCount, render_ctx.terrain_x, render_ctx.terrain_y - 30);
			ctx.stroke();
			/* **** */
			
			render_ctx.frameCount++;
			frameId = requestAnimationFrame(() => render(pong_ctx, ctx, canvas, user, render_ctx.frameCount, render_ctx.frameTime));
			
		}
		
		frameId = requestAnimationFrame(() => render(pong_ctx, ctx!, canvas!, user));
		return () => cancelAnimationFrame(frameId);
	}, [canvasRef, user, pong_ctx]);

	return undefined;
  };



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
    ctx.lineWidth = render_ctx.terrain_h * 0.01;
    ctx.moveTo(render_ctx.terrain_x + render_ctx.terrain_w * 0.5, render_ctx.terrain_y);
    ctx.lineTo(render_ctx.terrain_x + render_ctx.terrain_w * 0.5, render_ctx.terrain_y + render_ctx.terrain_h);
    ctx.stroke();
    ctx.restore();

    /* Terrain */
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 10;
    ctx.strokeRect(render_ctx.terrain_x, render_ctx.terrain_y, render_ctx.terrain_w, render_ctx.terrain_h);

    /* Player names & points */
    if (pong_ctx.room)
    {
        let player = getPongPlayer(pong_ctx, user);
        let opponent = getPongOpponent(pong_ctx, user);

        let pts_text_size = render_ctx.terrain_h * 0.3;
        let names_text_size = render_ctx.terrain_h * 0.07;

		let player_name = player !== undefined ? player.username : pong_ctx.room.player_1.username;
		let opponent_name = opponent !== undefined ? opponent.username : pong_ctx.room.player_2.username;
		
		let player_points = player !== undefined ? player.points : pong_ctx.room.player_1.points;
		let opponent_points = opponent !== undefined ? opponent.points : pong_ctx.room.player_2.points;

        //if (player !== undefined )
        //{        
            ctx.save();
            ctx.translate(render_ctx.terrain_x - 10, render_ctx.terrain_y + render_ctx.terrain_h);
            ctx.rotate(Math.PI + Math.PI * 0.5);
            ctx.fillStyle = "#FFFFFF";
            ctx.font = names_text_size.toString() + "px NonFiction"
            ctx.fillText(player_name.toUpperCase(), 0, 0);
            ctx.restore();

            ctx.save();
            ctx.textAlign = "center"
            ctx.fillStyle = "#404050";
            ctx.font = pts_text_size.toString() + "px NonFiction";
            ctx.fillText(player_points.toString(), render_ctx.terrain_x + render_ctx.terrain_w * 0.25, render_ctx.terrain_y + render_ctx.terrain_h * 0.5 + pts_text_size * 0.3);
            ctx.restore();
       // }

        //if (opponent !== undefined)
       // { 
            ctx.save();
            ctx.translate(render_ctx.terrain_x + render_ctx.terrain_w + 10, render_ctx.terrain_y);
            ctx.rotate(Math.PI * 0.5);
            ctx.fillStyle = "#FFFFFF";
            ctx.font = names_text_size.toString() + "px NonFiction"
            ctx.fillText(opponent_name.toUpperCase(), 0, 0);
            ctx.restore();

            ctx.save();
            ctx.textAlign = "center"
            ctx.fillStyle = "#404050";
            ctx.font = pts_text_size.toString() + "px NonFiction";
            ctx.fillText(opponent_points.toString(), render_ctx.terrain_x + render_ctx.terrain_w * 0.75, render_ctx.terrain_y + render_ctx.terrain_h * 0.5 + pts_text_size * 0.3);
            ctx.restore();
      //  }
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
    
	if (user.username === room.player_2.username)
	{
	   player_pos = room.player_2.position;
	   opponent_pos = room.player_1.position;  
	}
	else
    {
        player_pos = room.player_1.position;
        opponent_pos = room.player_2.position;
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

	if (user.username === pong_ctx.room.player_2.username)
    {
        ball_x = render_ctx.terrain_x + render_ctx.terrain_w - ((pong_ctx.room.ball.pos_x) * (render_ctx.terrain_w * 0.5));
        ball_y = render_ctx.terrain_y +  (pong_ctx.room.ball.pos_y) * render_ctx.terrain_h;
    }
    else
    {
        ball_x = render_ctx.terrain_x + (pong_ctx.room.ball.pos_x) * (render_ctx.terrain_w * 0.5);
        ball_y = render_ctx.terrain_y + (pong_ctx.room.ball.pos_y) * render_ctx.terrain_h;
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
    let ball_size = render_ctx.terrain_h * (pong_ctx.room.ball.size * 0.5);

	if (ball_size > GameConfig.BALL_SIZE * 0.5)
		ball_size = render_ctx.terrain_h * GameConfig.BALL_SIZE * 0.5;
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

function renderPauseScreen(ctx: CanvasRenderingContext2D, render_ctx: PongRenderingContext)
{
    ctx.fillStyle = '#1010169D'
    ctx.fillRect(0, 0, render_ctx.width, render_ctx.height);
    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'center'
    ctx.font = "30px Nonfiction";
    ctx.fillText("Player disconnected", render_ctx.width * 0.5, render_ctx.height * 0.5 - 100);
    ctx.fillText("Waiting for reconnection...", render_ctx.width * 0.5, render_ctx.height * 0.5 - 50);
    ctx.textAlign = 'start'
}

export { useRender }