import { Route } from '../src/main'
import { ParamsQueryRouteSchema, TestRouteSchema } from './routeSchemas'

export const TestRoute = Route(TestRouteSchema, {
  async get(data) {
    await new Promise(resolve => setTimeout(resolve, 1000))

    return {
      body: {
        message: 'Hello World!',
      },
    }
  },

  async post(data) {
    return {
      status: 201,
      body: {
        message: data.body.message,
      },
    }
  },

  async patch(data) {
    throw new Error('Ooops, uncaught error')
  },
})

export const ParamsQueryRoute = Route(ParamsQueryRouteSchema, {
  async get(data) {
    return {
      body: {
        name: data.params.name,
        q: data.query.q,
      },
    }
  },

  async delete(data) {
    return {
      body: {
        name: data.params.name,
      },
    }
  },
})
