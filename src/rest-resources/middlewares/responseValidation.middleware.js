import ajv from '@src/libs/ajv'
import { StatusCodes } from 'http-status-codes'
import { mapValues } from 'lodash'

/**
 * A Socket Context Data type
 * @typedef {Object} ResponseSchema
 * @property {import('ajv').Schema} default
 */

/**
 * This middleware is to validate the response of a request, accespts and object containing response object
 * @param {{
 *   response: ResponseSchema
 * }}
 * @return {import('express').RequestHandler}
 * @example
 * // you can define response schema
 * // as per the statusCode and for the
 * // rest status code you can define default schema
 * // and you can define global
 * // schema for 2xx or 3xx it will
 * // match all the status code started with 2 or 3
 * responseValidationMiddleware({
 *  response: {
 *    default: {
 *      type: 'string'
 *    },
 *    200: {
 *      type: 'string'
 *    },
 *    '2xx': {
 *      type: 'string'
 *    }
 *  }
 * })
 */
export function responseValidationMiddleware ({ response = {} }) {
  const compiledResponseSchema = mapValues(response, schema => ajv.compile(schema))

  return (req, res) => {
    res.payload = { data: null, errors: [], ...res.payload }
    res.payload = JSON.parse(JSON.stringify(res.payload))

    const statusCode = res.statusCode || req?.context?.statusCode || StatusCodes.OK
    const compiledSchema = compiledResponseSchema[statusCode] || compiledResponseSchema[`${statusCode.toString()[0]}xx`] || compiledResponseSchema.default

    if (compiledSchema) compiledSchema(res.payload)
    res.status(statusCode).json(res.payload)
  }
}
