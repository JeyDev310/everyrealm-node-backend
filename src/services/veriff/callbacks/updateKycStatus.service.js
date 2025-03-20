import { APIError } from '@src/errors/api.error'
import { createSignature } from '@src/helpers/veriff.encryption.helper'
import ajv from '@src/libs/ajv'
import { VeriffAxios } from '@src/libs/axios/veriff.axios'
import ServiceBase from '@src/libs/serviceBase'
import { ADDITIONAL_VERIFICATION_LEVELS, VERIFF_STATUS } from '@src/utils/constants/app.constants'
import { DOCUMENT_STATUS_TYPES } from '@src/utils/constants/public.constants.utils'
import { CUSTOMER_IO_TRANSACTION_ID } from "@src/utils/constants/app.constants";
import { sendMail } from '@src/libs/customerio/customerio'
import { logger } from "@src/utils/logger";

const constraints = ajv.compile({ type: 'object' })

export class UpdateKycStatusService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {

    const userModel = this.context.sequelize.models.user
    const documentModel = this.context.sequelize.models.document
    const transaction = this.context.sequelizeTransaction


    const { ...payload } = this.args

    let newDocumentsList, query
    const veriffId = payload?.verification?.id || payload?.id || payload?.sessionId

    try {
      const userDetails = await userModel.findOne({
        where: { veriffApplicantId: veriffId },
        attributes: ['id', 'veriffApplicantId', 'email', 'username', 'firstName', 'lastName', 'moreDetails']
      })
      if (payload?.action === 'submitted') {
        const data = await VeriffAxios.getVeriffDocuments(veriffId)
        newDocumentsList = data?.images
      }

      if (newDocumentsList && userDetails?.veriffApplicantId) {
        const uniqueDocs = {}
        const documentLabel = await this.context.sequelize.models.documentLabel.findOne({ attributes: ['id', 'name'], where: { name: 'Veriff' } })

        for (const document of newDocumentsList) {
          const keyValue = document.name
          if (!uniqueDocs[keyValue]) {
            uniqueDocs[keyValue] = true
            await documentModel.create({
              userId: userDetails.id,
              documentName: document.name.toUpperCase(),
              url: document.url,
              signature: createSignature({ payload: document.id }),
              documentLabelId: documentLabel.id,
              veriffApplicantId: veriffId
            })
          }
        }
        query = { veriffApplicantId: veriffId, veriffStatus: DOCUMENT_STATUS_TYPES.REQUESTED }
      }

      if (veriffId && payload.status) {
        let veriffStatus
        if (userDetails?.veriffApplicantId) {
          veriffStatus = payload.data?.verification?.decision || payload?.verification?.status
        }
        query = { veriffStatus: veriffStatus }
        if (veriffStatus === VERIFF_STATUS.APPROVED) {
          await documentModel.update({
            status: DOCUMENT_STATUS_TYPES.APPROVED
          }, {
            where: { userId: userDetails?.id, veriffApplicantId: veriffId },
            transaction
          })

          userDetails.veriffStatus = VERIFF_STATUS.APPROVED
          userDetails.moreDetails = {
            ...userDetails.moreDetails,
            additionalVerification: ADDITIONAL_VERIFICATION_LEVELS.NOT_REQUIRED
          }
          await userDetails.save({ transaction })


          const mailPayload = {
            email: userDetails.email,
            userName: userDetails.username,
            customerIoTransactionId: CUSTOMER_IO_TRANSACTION_ID.KYC_L2_VERIFICATION_ID,
            userId: userDetails.id
          }

          await sendMail(mailPayload)

        } else if (veriffStatus === VERIFF_STATUS.DECLINED ) {
          await documentModel.update({
            status: DOCUMENT_STATUS_TYPES.REJECTED,
            comment: payload?.verification?.reason
          }, {
            where: { userId: userDetails.id, veriffApplicantId: veriffId },
            transaction
          })
          await userModel.update({
            veriffStatus: VERIFF_STATUS.DECLINED
          }, {
            where: { id: userDetails?.id },
            transaction
          })

          const MailPayload = {
            email : userDetails.email,
            userName : userDetails.username,
            customerIoTransactionId :CUSTOMER_IO_TRANSACTION_ID.KYC_L2_VERIFICATION_RESUBMISSION,
            userId: userDetails.id
          }

          await sendMail(MailPayload)
        }
      }

      if (query) {
        await userModel.update({
          ...query,
          moreDetails: {
            ...userDetails?.moreDetails,
            veriffReason: payload?.verification?.reason
          }
        }, {
          where: { id: userDetails.id },
          transaction
        })
      }
      return { success: true }
    } catch (error) {
      logger.error('Veriff Error' ,  { message: error.message, stack: error.stack })
      throw new APIError(error)
    }
  }
}
