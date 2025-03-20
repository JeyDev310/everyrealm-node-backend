import _ from 'lodash'

function isTrustedError (error) {
  return error?.isOperational || false
}

function getLocalizedError (error, i18n) {
  const localizedError = {
    name: i18n(error.name),
    description: i18n(error.description),
    errorCode: error.errorCode,
    fields: error.fields
  }

  return localizedError
}

function extractErrorAttributes (errors) {
  return _.flatMap(_.values(errors), serviceErrors =>
    _.keys(serviceErrors)
  )
}

export {
  extractErrorAttributes, getLocalizedError, isTrustedError
}
