

// FIX PARTICLE SYSTEM                                                       

import { PongRenderingContext } from "./PongRenderer";


export interface Particle
{
    x: number,
    y: number,
    vel_x: number,
    vel_y: number,
    age: number,
}


export interface color
{
    r: number,
    g: number,
    b: number,
    a: number,
}


export interface ParticleEmitter
{
    particles: Array<Particle>,
    speed: number,
    start_size: number,
    spread_amount: number,
    end_size: number,
    start_color: color,
    end_color: color,
    lifetime: number,
    center_x: number,
    center_y: number,
    max_particles: number,
    emission_amount: number,
}


export const defaultParticleEmitter: ParticleEmitter = {
    particles: [],
    speed: 0,
    start_size: 10,
    spread_amount: 0,
    end_size: 9,
    start_color: { r: 27, g: 147, b: 198, a: 100 },
    end_color:  { r: 27, g: 198, b: 160, a: 0 },
    lifetime: 0.6,
    center_x: 0,
    center_y: 0,
    max_particles: 50,
    emission_amount: 1
}


export interface ParticleSystem
{
    emitters: Array<ParticleEmitter>,
}





function to_hex(n: number) : string
{
    var str = Number(~~n % 256).toString(16);
    return str.length == 1 ? "0" + str : str;
};

function to_hex_color(color: color) : string
{
    return ("#" + to_hex(color.r) + to_hex(color.g) + to_hex(color.b) + to_hex(color.a));
}

function lerp_color(color1: color, color2: color, t: number) : color
{
    return {
        r: color1.r + ((color2.r - color1.r) * t),
        g: color1.g + ((color2.g - color1.g) * t),
        b: color1.b + ((color2.b - color1.b) * t),
        a: color1.a + ((color2.a - color1.a) * t),
    } as color;
}

async function update_emitter(emitter: ParticleEmitter, render_ctx: PongRenderingContext)
{
    emitter.particles.forEach((particle) => {
        particle.age += render_ctx.deltaTime;
        particle.x += particle.vel_x;
        particle.y += particle.vel_y;
    });
}








export function add_emitter(system: ParticleSystem, emitter: ParticleEmitter)
{
    system.emitters.push(emitter);
}


export function center_emitter(system: ParticleSystem, x: number, y: number)
{
    system.emitters.forEach((emitter) => {
        emitter.center_x = x;
        emitter.center_y = y;
    })
}

export function clear_particles(system: ParticleSystem)
{
    system.emitters.forEach((emitter) => {
        emitter.particles = [];
    })
}

export async function summon_particles(system: ParticleSystem, render_ctx: PongRenderingContext)
{
    system.emitters.forEach((emitter) => {
        if (emitter.particles.length < emitter.max_particles)
        {
            if (render_ctx.frameCount % emitter.emission_amount <= 2)
            {
                emitter.particles.push({
                    x: emitter.center_x + Math.random() * emitter.spread_amount - emitter.spread_amount * 0.5,
                    y: emitter.center_y + Math.random() * emitter.spread_amount - emitter.spread_amount * 0.5,
                    vel_x: (Math.random() * emitter.speed) - (emitter.speed * 0.5),
                    vel_y: (Math.random() * emitter.speed) - (emitter.speed * 0.5),
                    age: 0,
                } as Particle)
            }
        }
    })
}

export async function draw_particles(ctx: CanvasRenderingContext2D, render_ctx: PongRenderingContext, system: ParticleSystem)
{
    ctx.save();
    system.emitters.forEach((emitter) => {
        update_emitter(emitter, render_ctx);
        emitter.particles.forEach((particle) => {
            var particle_stage = (particle.age / emitter.lifetime);
            if (particle_stage >= 1)
                emitter.particles.shift();//splice(emitter.particles.indexOf(particle), 1);

            var particle_size = ((1 - particle_stage) * emitter.start_size) + (particle_stage * emitter.end_size);
            var particle_color = lerp_color(emitter.start_color, emitter.end_color, particle_stage);

            if (particle_size > 0)
            {
                ctx.fillStyle = to_hex_color(particle_color)
                ctx.beginPath();
                ctx.ellipse(particle.x,
                            particle.y, 
                            particle_size, particle_size,
                            Math.PI / 4, 0, 2 * Math.PI);
                ctx.fill();
            }
            //else
            //    emitter.particles.splice(emitter.particles.indexOf(particle), 1);
        });
    });
    ctx.restore();
}


//  |10|     x|   20|
//  |--|------|-----|
//  | 0|   0.5|    1|

// => 0.5 * 10 + (1 - 0.5) * 20