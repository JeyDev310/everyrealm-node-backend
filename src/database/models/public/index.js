import { Address } from './address'
import { AdminRole } from './adminRole'
import { AdminUser } from './adminUser'
import { Banner } from './banner'
import { Country } from './country'
import { Currency } from './currency'
import { Document } from './document'
import { DocumentLabel } from './documentLabel'
import { EmailTemplate } from './emailTemplate'
import { FavoriteGame } from './favoriteGame'
import { Language } from './language'
import { Ledger } from './ledger'
import { Page } from './page'
import { Permission } from './permission'
import { Review } from './review'
import { Setting } from './setting'
import { Tag } from './tag'
import { Transaction } from './transaction'
import { User } from './user'
import { UserComment } from './userComment'
import { UserLimit } from './userLimit'
import { UserTag } from './userTag'
import { Wallet } from './wallet'
import { Withdrawal } from './withdrawal'

/** @type {[typeof import('sequelize').Model]} */
export const models = [
  Tag,
  Page,
  User,
  Review,
  Wallet,
  Ledger,
  Banner,
  Address,
  UserTag,
  Country,
  Setting,
  Currency,
  Document,
  Language,
  AdminUser,
  AdminRole,
  UserLimit,
  Withdrawal,
  Permission,
  Transaction,
  UserComment,
  FavoriteGame,
  DocumentLabel,
  EmailTemplate
]
