import fastify, { FastifyInstance, FastifyServerOptions } from 'fastify'
import fastifyCookie, { FastifyCookieOptions } from 'fastify-cookie'
import fastifyCors, { FastifyCorsOptions } from 'fastify-cors'
import addFormats from './validation/add-formats'

declare module 'fastify' {
  interface RequestState {}
  interface FastifyRequest {
    state: RequestState
  }
}

export type CorsOptions = FastifyCorsOptions | boolean
export type CookieOptions = FastifyCookieOptions | boolean

export interface AtonalConfig extends Omit<FastifyServerOptions, 'ajv'> {
  cors?: CorsOptions
  cookie?: CookieOptions
}

export interface Atonal {
  fast: FastifyInstance
  listen: FastifyInstance['listen']
  use: FastifyInstance['register']
  decorateRequest: FastifyInstance['decorateRequest']
  decorateResponse: FastifyInstance['decorateReply']
  addHook: FastifyInstance['addHook']
  addSchema: FastifyInstance['addSchema']
}

export const useAtonal = ({
  cors = false,
  cookie = false,
  ...opts
}: AtonalConfig = {}) => {
  // Create a fastify instance
  const fast = fastify({
    logger: false,
    caseSensitive: true,
    ignoreTrailingSlash: true,
    ajv: {
      plugins: [addFormats],
    },
    ...opts,
  })

  // Enable cors or not
  if (cors) {
    fast.register(fastifyCors, cors === true ? {} : cors)
  }

  // Enable cookie or not
  if (cookie) {
    fast.register(fastifyCookie, cookie === true ? {} : cookie)
  }

  // Decorate request for state
  fast.decorateRequest('state', null)

  // Implement onRequest hook
  fast.addHook('onRequest', (req, _, next) => {
    // Patch for DELETE method
    if (req.method === 'DELETE' || req.method == 'delete') {
      if (req.headers['content-type']) {
        delete req.headers['content-type']
      }
    }

    // Set initial request state
    req.state = {}

    next()
  })

  const atonal: Atonal = {
    fast,
    listen: fast.listen.bind(fast),
    use: fast.register.bind(fast),
    decorateRequest: fast.decorateRequest.bind(fast),
    decorateResponse: fast.decorateReply.bind(fast),
    addHook: fast.addHook.bind(fast),
    addSchema: fast.addSchema.bind(fast),
  }

  return atonal
}