import * as fetchPonyfill from 'fetch-ponyfill'
import * as qs from 'qs'
import type { RouteSchema } from './RouteSchema'
import type {
  MethodSchemas,
  MethodFetch,
  MethodFetchs,
  FetchRouteOptions,
} from './types'

const { fetch, Headers } = fetchPonyfill()

/**
 * Creates and executes an HTTP request based on the given route schema.
 *
 * #### Example
 *
 * ```ts
 * let response = await fetchRoute(TestRouteSchema).get({
 *   query: {
 *     name: 'Simon'
 *   }
 * })
 *
 * if (response.status === 200) {
 *   console.log(response.body.message)
 * }
 * ```
 *
 * @param schema - The route schema of the route to request.
 * @param options - Additional fetching options.
 */
export function fetchRoute<M extends MethodSchemas>(
  schema: RouteSchema<M>,
  options: FetchRouteOptions = {}
): MethodFetchs<M> {
  let result = {} as Record<string, MethodFetch>

  async function request(
    method: string,
    data: Parameters<MethodFetch>[0] = {}
  ) {
    let renderedPath = (options.pathPrefix ?? '') + schema.path

    for (let name in data.params ?? {}) {
      let value = (data.params?.[name] as string) ?? ''

      if (!/^\w+$/.test(name)) {
        throw new Error('Param values may only contain alphanumeric characters')
      }

      let regex = new RegExp(`:${name}\\??`, 'g')
      renderedPath = renderedPath.replace(regex, encodeURIComponent(value))
    }

    if (data.query != null) {
      renderedPath += '?' + qs.stringify(data.query)
    }

    let requestContentType = data.contentType ?? 'application/json'
    let headers = new Headers(data.req?.headers)
    headers.set('content-type', requestContentType)

    let rawResponse = await fetch(renderedPath, {
      method: method.toUpperCase(),
      body:
        data.req?.body != null || data.body == null
          ? null
          : requestContentType === 'application/json'
          ? JSON.stringify(data.body)
          : requestContentType === 'application/x-www-form-urlencoded'
          ? qs.stringify(data.body)
          : requestContentType === 'text/plain'
          ? data.body.toString()
          : null,
      ...data.req,
      headers,
    })

    let responseContentType = rawResponse.headers
      .get('content-type')
      ?.split(';')?.[0]

    let body =
      responseContentType === 'application/json'
        ? await rawResponse.json()
        : responseContentType === 'application/x-www-form-urlencoded'
        ? qs.parse(await rawResponse.text())
        : responseContentType === 'text/plain'
        ? await rawResponse.text()
        : undefined

    return {
      res: rawResponse,
      contentType: responseContentType,
      status: rawResponse.status,
      body,
    }
  }

  for (let method in schema.methods) {
    if (schema.methods[method] == null) continue

    result[method] = async (data = {}) => {
      return request(method, data)
    }
  }

  return result as any
}
