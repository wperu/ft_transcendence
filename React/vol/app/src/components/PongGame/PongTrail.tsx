import { IPongContext } from "./PongContext/ProvidePong";
import { Particle } from "./PongParticleSystem";


function toHex(n: number)
{
    var str = Number(n).toString(16);
    return str.length == 1 ? "0" + str : str;
};

function plot_trail(pong_ctx: IPongContext, ctx: CanvasRenderingContext2D, x: number, y: number)
{
    /* Update */

   // FIRE MODE
    if (pong_ctx.room && Math.abs(pong_ctx.room.ball.vel_y) > 0.95)
    {
        if (Math.random() < 0.4)
        {
            pong_ctx.fx.trail.points.push({
                x: x,
                y: y,
                vel_x: Math.random() * 0.6 - 0.3,
                vel_y: Math.random() * 0.6 - 0.3,
                id: 1 // SMOKE PARTICLE
            })
        }
        else
        { 
            pong_ctx.fx.trail.points.push({
                x: x,
                y: y,
                vel_x: Math.random() * 1.2 - 0.6,
                vel_y: Math.random() * 1.2 - 0.6,
                id: 2 // FIRE PARTICLE
            })
        }
    }
    // NORMAL MODE
    else
    {
        pong_ctx.fx.trail.points.push({
            x: x,
            y: y,
            vel_x: 0,//Math.random() * 0.2 - 0.1,
            vel_y: 0,//Math.random() * 0.2 - 0.1,
            id: 0 // NORMAL PARTICLE
        })
    }

    if (pong_ctx.fx.trail.points.length > 40)
    {
        pong_ctx.fx.trail.points.shift();
    }

    /* Render */
    let i: number = 0;
    pong_ctx.fx.trail.points.forEach((p: Particle) => {
        p.x += p.vel_x;
        p.y += p.vel_y;
        let ratio = (i / pong_ctx.fx.trail.points.length);
        let size = 10 * ratio;

        switch (p.id)
        {
            /* NORMAL */
            case 0: 
                ctx.fillStyle = '#FFFFFF' + toHex(100.0 * ratio)
                break;
            /* SMOKE */
            case 1: 
                ctx.fillStyle = '#FFFFFF' + toHex(100.0 * ratio)
                size = 14 * ratio;
                break;
            /* FIRE */
            case 2: 
                ctx.fillStyle = '#F0A010'
                size = 4 * ratio;
                break;
        }
        ctx.beginPath();
        ctx.ellipse(p.x,
                    p.y, 
                    size, size,
                    Math.PI / 4, 0, 2 * Math.PI);
        ctx.fill();
        i++;
    });
}

export interface TrailFX
{
    points: Array<Particle>,
}


export { plot_trail }