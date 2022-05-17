import { IPongContext } from "./PongContext/ProvidePong";
import { center_emitter, clear_particles, defaultParticleEmitter, draw_particles, Particle, ParticleSystem, summon_particles } from "./PongParticleSystem";
import { PongRenderingContext } from "./PongRenderer";

export function clear_trail(pong_ctx: IPongContext)
{
    clear_particles(pong_ctx.fx.trail.system);
}

export function add_particles(pong_ctx: IPongContext, x: number, y: number, render_ctx: PongRenderingContext)
{
    center_emitter(pong_ctx.fx.trail.system, x, y);
    summon_particles(pong_ctx.fx.trail.system, render_ctx);
}

export function plot_trail(pong_ctx: IPongContext, ctx: CanvasRenderingContext2D, render_ctx: PongRenderingContext)
{
    draw_particles(ctx, render_ctx,pong_ctx.fx.trail.system);
}

export interface TrailFX
{
    system: ParticleSystem,
}

