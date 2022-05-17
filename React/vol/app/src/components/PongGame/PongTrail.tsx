import { IPongContext } from "./PongContext/ProvidePong";
import { center_emitter, clear_particles, defaultParticleEmitter, draw_particles, Particle, ParticleSystem } from "./PongParticleSystem";
import { PongRenderingContext } from "./PongRenderer";

export function clear_trail(pong_ctx: IPongContext)
{
    clear_particles(pong_ctx.fx.trail.system);
}

export function plot_trail(pong_ctx: IPongContext, ctx: CanvasRenderingContext2D, x: number, y: number, render_ctx: PongRenderingContext)
{
    center_emitter(pong_ctx.fx.trail.system, x, y);
    draw_particles(ctx, render_ctx,pong_ctx.fx.trail.system);
}

export interface TrailFX
{
    system: ParticleSystem,
}
