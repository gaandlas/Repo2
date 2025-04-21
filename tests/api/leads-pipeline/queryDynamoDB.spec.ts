import { test, expect } from '@playwright/test';
import { scanTable, scanTableWithFilter } from '../../../lib/utils/dynamoHelper';
import { environment } from '../../../data/localFiles/localTestData';

const recordsTable = `${environment}-leads-records`; // First DynamoDB table name
const successTable = `${environment}-leads-pipeline-success`; // Second DynamoDB table name
const id = '03ac9ce8-d83e-11ef-b585-956f69bad238';
const filterExpression = 'id = :id';
const expressionAttributeValues = {
  ':id': id
};


test('Scan two DynamoDB tables and confirm items with a specific id exist and share the same id', async () => {
  try {
    const itemsRecordsTable = await scanTableWithFilter(recordsTable, filterExpression, expressionAttributeValues) || [];
    const itemsSuccessTable = await scanTableWithFilter(successTable, filterExpression, expressionAttributeValues) || [];

    const allItems = await scanTable(recordsTable) || [];

    console.log('Scan all items from records table:', allItems);

    console.log('Scan result items from records table:', itemsRecordsTable);
    console.log('Scan result items from success table:', itemsSuccessTable);

    expect(itemsRecordsTable).toBeDefined();
    expect(itemsSuccessTable).toBeDefined();
    expect(itemsRecordsTable.length).toBeGreaterThan(0);
    expect(itemsSuccessTable.length).toBeGreaterThan(0);

    const idsRecordsTable = itemsRecordsTable.map(item => item.id);
    const idsSuccessTable = itemsSuccessTable.map(item => item.id);

    expect(idsRecordsTable).toEqual(expect.arrayContaining(idsSuccessTable));
    expect(idsSuccessTable).toEqual(expect.arrayContaining(idsRecordsTable));
  } catch (error) {
    console.error('Error scanning DynamoDB tables:', error);
    throw error;
  }
});

test('Scan recordsTable for id and check affiliate key, then verify endpoint in successTable', async () => {
  try {
    const itemsRecordsTable = await scanTableWithFilter(recordsTable, filterExpression, expressionAttributeValues) || [];
    expect(itemsRecordsTable).toBeDefined();
    expect(itemsRecordsTable.length).toBeGreaterThan(0);

    const recordItem = itemsRecordsTable[0];
    const isAffiliate = recordItem.affiliate && (recordItem.affiliate === true || recordItem.affiliate === 'true' || recordItem.affiliate === 1);

    const itemsSuccessTable = await scanTableWithFilter(successTable, filterExpression, expressionAttributeValues) || [];
    expect(itemsSuccessTable).toBeDefined();
    expect(itemsSuccessTable.length).toBeGreaterThan(0);

    const successItem = itemsSuccessTable[0];
    if (isAffiliate) {
      expect(successItem.endpoint).toBe('Sparkroom');
    } else {
      expect(successItem.endpoint).not.toBe('Sparkroom');
    }
  } catch (error) {
    console.error('Error scanning DynamoDB tables:', error);
    throw error;
  }
});

test('Verify all items in recordsTable have corresponding items in successTable', async () => {
  try {
    const itemsRecordsTable = await scanTableWithFilter(recordsTable, filterExpression, expressionAttributeValues) || [];
    const itemsSuccessTable = await scanTableWithFilter(successTable, filterExpression, expressionAttributeValues) || [];

    console.log('Items from recordsTable:', itemsRecordsTable);
    console.log('Items from successTable:', itemsSuccessTable);

    expect(itemsRecordsTable).toBeDefined();
    expect(itemsRecordsTable.length).toBeGreaterThan(0);
    expect(itemsSuccessTable).toBeDefined();
    expect(itemsSuccessTable.length).toBeGreaterThan(0);

    for (const recordItem of itemsRecordsTable) {
      const successItem = itemsSuccessTable.find(item => item.id === recordItem.id);
      expect(successItem).toBeDefined();
    }
  } catch (error) {
    console.error('Error during test execution:', error);
    throw error;
  }
});

test('Verify all items in successTable have corresponding items in recordsTable', async () => {
  try {
    const itemsRecordsTable = await scanTableWithFilter(recordsTable, filterExpression, expressionAttributeValues) || [];
    const itemsSuccessTable = await scanTableWithFilter(successTable, filterExpression, expressionAttributeValues) || [];

    console.log('Items from recordsTable:', itemsRecordsTable);
    console.log('Items from successTable:', itemsSuccessTable);

    expect(itemsRecordsTable).toBeDefined();
    expect(itemsRecordsTable.length).toBeGreaterThan(0);
    expect(itemsSuccessTable).toBeDefined();
    expect(itemsSuccessTable.length).toBeGreaterThan(0);

    for (const successItem of itemsSuccessTable) {
      const recordItem = itemsRecordsTable.find(item => item.id === successItem.id);
      expect(recordItem).toBeDefined();
    }
  } catch (error) {
    console.error('Error during test execution:', error);
    throw error;
  }
});