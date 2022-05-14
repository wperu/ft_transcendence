import { IPongContext } from "./PongContext/ProvidePong";
import { center_emitter, defaultParticleEmitter, draw_particles, Particle, ParticleSystem } from "./PongParticleSystem";
import { PongRenderingContext } from "./PongRenderer";


function toHex(n: number)
{
    var str = Number(n % 255).toString(16);
    return str.length == 1 ? "0" + str : str;
};

function init_trail(pong_ctx: IPongContext)
{
    pong_ctx.fx.trail.system.emitters.push(defaultParticleEmitter);
}

function plot_trail(pong_ctx: IPongContext, ctx: CanvasRenderingContext2D, x: number, y: number, render_ctx: PongRenderingContext)
{
    center_emitter(pong_ctx.fx.trail.system, x, y);
    draw_particles(ctx, render_ctx,pong_ctx.fx.trail.system);
    /* Update */
    /*

    let max_particles = 40;

   // FIRE MODE
    if (pong_ctx.room && Math.abs(pong_ctx.room.ball.vel_y) < 0.95)
    {
        if (Math.random() < 0.9)
        {
            pong_ctx.fx.trail.points.push({
                x: x,
                y: y,
                vel_x: Math.random() * 1 - 0.5,
                vel_y: Math.random() * 1 - 0.5,
                id: 1 // SMOKE PARTICLE
            })
        }
        else
        { 
            pong_ctx.fx.trail.points.push({
                x: x,
                y: y,
                vel_x: Math.random() * 2 - 1,
                vel_y: Math.random() * 2 - 1,
                id: 2 // FIRE PARTICLE
            })
        }

        max_particles = 70;
    }
    // NORMAL MODE
   else
   {
        pong_ctx.fx.trail.points.push({
            x: x,
            y: y,
            vel_x: Math.random() * 0.2 - 0.1,
            vel_y: Math.random() * 0.2 - 0.1,
            id: 0 // NORMAL PARTICLE
        })
    }

    while (pong_ctx.fx.trail.points.length > max_particles)
    {
        pong_ctx.fx.trail.points.shift();
    }
*/
    /* Render */
    /*
    let i: number = 0;
    pong_ctx.fx.trail.points.forEach((p: Particle) => {
        p.x += p.vel_x;
        p.y += p.vel_y;
        let ratio = (i / pong_ctx.fx.trail.points.length);
        let size = 10 * ratio;

        switch (p.id)
        {*/
            /* NORMAL */
           /* case 0: 
                ctx.fillStyle = "#F0" + toHex(200.0 * ratio) + "00" + toHex(200.0 * ratio)
                size = 10;
                break;*/
            /* SMOKE */
           /* case 1: 
                ctx.fillStyle = '#FFFFFF' + toHex(100.0 * ratio)
                size = 20 * (1 - ratio);
                break;*/
            /* FIRE */
         /*   case 2: 
                ctx.fillStyle = '#F0A010'
                size = 6 * ratio;
                break;
        }
        ctx.beginPath();
        ctx.ellipse(p.x,
                    p.y, 
                    size, size,
                    Math.PI / 4, 0, 2 * Math.PI);
        ctx.fill();
        i++;
    });*/
}

export interface TrailFX
{
    system: ParticleSystem,
}


export { plot_trail }