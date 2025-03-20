import { DataTypes } from 'sequelize'
import { ModelBase } from '../modelBase'

export class DocumentLabel extends ModelBase {
  static model = 'documentLabel'

  static table = 'document_labels'

  static options = {
    name: {
      singular: 'documentLabel',
      plural: 'documentLabels'
    }
  }

  static attributes = {
    id: {
      allowNull: false,
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    required: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }

  static associate (models) {
    DocumentLabel.hasMany(models.document, { foreignKey: 'documentLabelId', onDelete: 'cascade' })
    super.associate()
  }
}
