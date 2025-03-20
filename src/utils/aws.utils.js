import {
  DynamoDBClient,
  GetItemCommand,
  QueryCommand,
  UpdateItemCommand
} from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'
import { DYNAMO_TABLE } from '@src/utils/constants/dynamo.constants.utils'

const ddb = new DynamoDBClient({})

async function dynamoCreate (pk, sk, values) {
  let updateExpression = 'SET '
  const expressionAttributeNames = {}
  const expressionAttributeValues = {}
  values.forEach((element) => {
    if (element.value !== null && element.value !== undefined) {
      updateExpression += `#${element.key} = :${element.key}, `
      expressionAttributeNames[`#${element.key}`] = element.key
      let value = ''
      if (Array.isArray(element.value)) {
        value = { L: marshall(element.value) }
      } else if (typeof element.value === 'object') {
        value = { M: marshall(element.value) }
      } else {
        value = marshall(element.value)
      }
      expressionAttributeValues[`:${element.key}`] = value
    }
  })
  updateExpression = updateExpression.slice(0, -2)
  const params = {
    TableName: DYNAMO_TABLE,
    Key: { PK: { S: pk }, SK: { S: sk } },
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW'
  }
  
  try {
    const response = await ddb.send(new UpdateItemCommand(params));
    return response;
  } catch (error) {
    console.error('Error updating DynamoDB item:', error);
    return null;
  }
}

async function dynamoGetWithPkSk (pk, sk) {
  const params = {
    TableName: DYNAMO_TABLE,
    Key: {
      PK: { S: pk },
      SK: { S: sk }
    }
  };
  try {
    const response = await ddb.send(new GetItemCommand(params));
    return response.Item ? unmarshall(response.Item) : undefined;
  } catch (error) {
    console.error('Error querying DynamoDB:', error);
    return undefined;
  }
}

async function dynamoGetWithPk(pk) {
  const params = {
    TableName: DYNAMO_TABLE,
    KeyConditionExpression: '#pk = :pk',
    ExpressionAttributeNames: {
      '#pk': 'PK',
    },
    ExpressionAttributeValues: {
      ':pk': { S: pk }
    }
  };

  try {
    const response = await ddb.send(new QueryCommand(params));
    return response.Items ? response.Items.map(item => unmarshall(item)) : [];
  } catch (error) {
    console.error('Error querying DynamoDB:', error);
    return [];
  }
}

function dynamoGetQueryWithPk (pk, skStart) {
  const params = {
    TableName: DYNAMO_TABLE,
    KeyConditionExpression: 'PK = :pk',
    ExpressionAttributeValues: { ':pk': { S: pk }, ':sk': { S: skStart } }
  }
  const response = ddb.send(new QueryCommand(params))
  const result = []
  for (const item of response.Items) result.push(unmarshall(item))
  return result
}

async function dynamoGetQueryWithPkSkStart(pk, skStart) {
  const params = {
    TableName: DYNAMO_TABLE,
    KeyConditionExpression: '#pk = :pk AND begins_with(#sk, :sk)',
    ExpressionAttributeNames: {
      '#pk': 'PK',
      '#sk': 'SK',
    },
    ExpressionAttributeValues: { ':pk': { S: pk }, ':sk': { S: skStart } }
  };

  try {
    const response = await ddb.send(new QueryCommand(params));
    return response.Items ? response.Items.map(item => unmarshall(item)) : [];
  } catch (error) {
    console.error('Error querying DynamoDB:', error);
    return [];
  }
}

function dynamoGetQueryWithIndex (index, indexPK) {
  const params = {
    TableName: DYNAMO_TABLE,
    KeyConditionExpression: '#indexPK = :indexpk',
    ExpressionAttributeNames: { '#indexPK': index },
    ExpressionAttributeValues: { ':indexpk': { S: indexPK } }
  }
  const response = ddb.send(new QueryCommand(params))
  const result = []
  for (const item of response.Items) result.push(unmarshall(item))
  return result
}

function dynamoUpdateWithPkSk (pk, sk, values) {
  let UpdateExpression = 'SET '
  const ExpressionAttributeNames = {}
  const ExpressionAttributeValues = {}
  values.forEach((element) => {
    if (element.value !== null && element.value !== undefined) {
      UpdateExpression += `#${element.key} = :${element.key}, `
      ExpressionAttributeNames[`#${element.key}`] = element.key
      let value = ''
      if (Array.isArray(element.value)) {
        value = { L: marshall(element.value) }
      } else if (typeof element.value === 'object') {
        value = { M: marshall(element.value) }
      } else {
        value = marshall(element.value)
      }
      ExpressionAttributeValues[`:${element.key}`] = value
    }
  })
  UpdateExpression = UpdateExpression.slice(0, -2)
  const params = {
    TableName: DYNAMO_TABLE,
    Key: { PK: { S: pk }, SK: { S: sk } },
    UpdateExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues,
    ReturnValues: 'ALL_NEW'
  }
  const response = ddb.send(new UpdateItemCommand(params))
  return unmarshall(response.Attributes)
}

export {
  dynamoCreate, dynamoGetWithPkSk, dynamoGetWithPk, dynamoGetQueryWithPk, dynamoGetQueryWithPkSkStart,
  dynamoGetQueryWithIndex, dynamoUpdateWithPkSk
}
