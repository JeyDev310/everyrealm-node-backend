import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import ajvKeywords from 'ajv-keywords'
import ajvMergePatch from 'ajv-merge-patch'

const ajv = new Ajv({ allErrors: true, removeAdditional: 'all', allowUnionTypes: true, coerceTypes: true, useDefaults: true, strict: 'log' })

addFormats(ajv)
ajvKeywords(ajv)
ajvMergePatch(ajv)

export default ajv
