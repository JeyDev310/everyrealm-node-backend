import _ from 'lodash'
import slackNotificationHelper from '@src/utils/notifications';
import { logger } from '@src/utils/logger'

/**
 * @class ServiceBase
 * @classdesc Service Base class for creating services for business logic
 * and perform some task and log them properly
 * @hideconstructor
 */
export default class ServiceBase {
  #_args = {}
  #_context = {}
  #_errors = {}
  #_success = false
  #_result = null

  constructor() {
    this.#_args = arguments[0]
    this.#_context = arguments[1]
    this.#_errors = {}
    this.#_success = false
    this.#_result = null
    this.#validateServiceInputs()
  }

  /** @type {App.Context} */
  get context() {
    return this.#_context
  }

  /** @type {object} */
  get args() {
    return this.#_args
  }

  /** @type {any} */
  get result() {
    return this.#_result
  }

  /** @type {Array} */
  get errors() {
    return this.#_errors
  }

  /** @type {boolean} */
  get success() {
    return this.#_success
  }

  /** @readonly */
  get log() {
    return {
      info: (logTitle, argHash = {}) => {
        argHash.klass = this.constructor
        logger.info(logTitle, argHash)
      },
      debug: (logTitle, argHash = {}) => {
        argHash.klass = this.constructor
        logger.debug(logTitle, argHash)
      },
      error: (logTitle, argHash = {}) => {
        argHash.klass = this.constructor
        logger.error(logTitle, argHash)
      }
    }
  }

  /**
   *
   *
   * @param {string} attribute
   * @param {*} errorMessage
   * @return {undefined}
   */
  addError(attribute, errorMessage) {
    // check if attribute is in pascal case
    if (attribute !== _.startCase(_.camelCase(attribute)).replace(/ /g, '')) throw new Error(`${attribute} should be pascal cased in addError()`)
    const errors = this.#_errors[this.constructor.name] ||= {}
    if (!errors[attribute]) {
      _.extend(errors, { [attribute]: `${_.startCase(attribute)} ${errorMessage}` })
    } else {
      errors[attribute] = errors[attribute] instanceof Array ? errors[attribute] : [errors[attribute]]
      errors[attribute].push(`${_.startCase(attribute)} ${errorMessage}`)
    }
    logger.debug('Custom Validation Failed', { klass: this.constructor, message: errorMessage, context: { attribute }, userCtx: this.context, fault: this.errors })
  }
  async #tryExecuting() {
    if (Object.keys(this.errors).length) return;

    try {
      this.#_result = await this.run();
      this.#_success = !Object.keys(this.errors).length;
    } catch (error) {
      logger.error('Service Exception', { klass: this.constructor.name, message: error.message, context: this.args, exception: error });

      slackNotificationHelper.sendError(
        `API Family: ${process.env.API_FAMILY} - Container: ${process.env.SERVICE_NAME} - Version: ${process.env.API_VERSION} - Service: ${this.constructor.name} - Error: ${error.message}`,
        { class: this.constructor.name, message: error.message, exception: error }
      );

      throw error;
    }
  }


  /**
   *
   *
   * @instance
   * @param {any[]} errors
   */
  mergeErrors(errors) {
    _.defaults(this.#_errors, errors)
  }

  async #validateServiceInputs() {
    const schema = this.constraints
    if (schema) {
      const valid = schema(this.#_args)
      if (!valid) {
        const validationErrors = schema.errors
        const errors = validationErrors.map(error => error.message)
        _.extend(this.errors, { [this.constructor.name]: { validationErrors: errors } })
        logger.debug('Service input Validation Failed', { klass: this.constructor, message: 'Validation Failed', context: this.args, userCtx: this.context, fault: this.errors })
        slackNotificationHelper.sendError(
          `API Family: ${process.env.API_FAMILY} - Container: ${process.env.SERVICE_NAME} - Version: ${process.env.API_VERSION} - Service: ${this.constructor.name} - Input Validation Failed: ${errors.join(', ')}`,
          { class: this.constructor.name, message: 'Validation Failed', context: this.args, fault: this.errors }
        );
      }
    }
  }

  // STATIC METHODS
  /**
   * Throw errors while validation inputs
   */
  static async run() {
    const args = arguments
    const instance = new this(...args)
    await instance.#tryExecuting()
    if (_.size(instance.errors)) throw instance.errors
    return instance.result
  }

  /**
   * Collect errors while validation inputs with a success response, decorate them later
   */
  static async execute() {
    const args = arguments
    const instance = new this(...args)
    await instance.#tryExecuting()
    return instance
  }
}
