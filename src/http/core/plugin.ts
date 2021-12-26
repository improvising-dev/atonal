import {
  FastifyPluginAsync,
  FastifyPluginCallback,
  FastifyRegisterOptions,
} from 'fastify'

export type PluginRegisterOptions<Options> = FastifyRegisterOptions<Options>
export type PluginOptions = Record<string, any>
export type Plugin<T extends PluginOptions = PluginOptions> =
  | FastifyPluginAsync<T>
  | FastifyPluginCallback<T>

export const usePlugin = <T extends PluginOptions = PluginOptions>(
  plugin: Plugin<T>,
) => {
  ;(plugin as any)[Symbol.for('skip-override')] = true
  return plugin
}
