import RequestInputValidationError from '@src/errors/requestInputValidation.error'
import ajv from '@src/libs/ajv'

/**
 * @param {{
 *   query: import('ajv').Schema
 *   params: import('ajv').Schema
 *   body: import('ajv').Schema
 * }} schema
 * @return {import('express').RequestHandler}
 */
export function requestValidationMiddleware ({ query = {}, params = {}, body = {} }) {
  const compiledQuerySchema = ajv.compile(query)
  const compiledParamsSchema = ajv.compile(params)
  const compiledBodySchema = ajv.compile(body)

  return (req, _, next) => {
    const errorPayload = {}

    if (compiledQuerySchema) {
      if (!compiledQuerySchema(req.query)) errorPayload.query = ajv.errorsText(compiledQuerySchema.errors, { separator: ' ||||| ' }).split(' ||||| ')
    }

    if (compiledParamsSchema) {
      if (!compiledParamsSchema(req.params)) errorPayload.params = ajv.errorsText(compiledParamsSchema.errors, { separator: ' ||||| ' }).split(' ||||| ')
    }

    if (compiledBodySchema) {
      if (!compiledBodySchema(req.body)) errorPayload.body = ajv.errorsText(compiledBodySchema.errors, { separator: ' ||||| ' }).split(' ||||| ')
    }

    (errorPayload.query || errorPayload.body || errorPayload.params) ? next(new RequestInputValidationError(errorPayload)) : next()
  }
}
