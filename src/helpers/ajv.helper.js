import { JsonSchema7Strategy, JsonSchemaManager } from '@alt3/sequelize-to-json-schemas'
import ajv from '@src/libs/ajv'

/**
 * @param {[typeof import('sequelize').Model]} models
 * @returns {void}
*/
export function addModelsSchemaToAjv (models) {
  const schemaManager = new JsonSchemaManager()
  const strategy = new JsonSchema7Strategy()

  models.forEach(model => {
    const jsonSchema = schemaManager.generate(model, strategy, { ...model.jsonSchemaOptions, associations: true })
    delete jsonSchema.$schema
    jsonSchema.$id = `#/definitions/${model.name}`
    ajv.addSchema(jsonSchema)
  })
}
