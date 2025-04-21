import { ddbDocClient } from "./aws";
import { QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

export async function queryTable(tableName: string, keyConditionExpression: string, expressionAttributeValues: any, filterExpression?: string) {
  const params = {
    TableName: tableName,
    KeyConditionExpression: keyConditionExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    FilterExpression: filterExpression,
  };

  try {
    const data = await ddbDocClient.send(new QueryCommand(params));
    return data.Items;
  } catch (err) {
    console.error("Error querying table:", err);
    throw err;
  }
}

export async function scanTable(tableName: string) {
  const params = {
    TableName: tableName,
  };

  try {
    const data = await ddbDocClient.send(new ScanCommand(params));
    return data.Items;
  } catch (err) {
    console.error("Error scanning table:", err);
    throw err;
  }
}

export async function scanTableWithFilter(tableName: string, filterExpression: string, expressionAttributeValues: any) {
  const params = {
    TableName: tableName,
    FilterExpression: filterExpression,
    ExpressionAttributeValues: expressionAttributeValues,
  };

  try {
    const data = await ddbDocClient.send(new ScanCommand(params));
    return data.Items;
  } catch (err) {
    console.error("Error scanning table:", err);
    throw err;
  }
}