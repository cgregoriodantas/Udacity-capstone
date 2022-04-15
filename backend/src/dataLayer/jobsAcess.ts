import * as AWS from 'aws-sdk'
import { DocumentClient, Key } from 'aws-sdk/clients/dynamodb'
import { JobUpdate } from '../models/JobUpdate';
import { JobItem, PageableJobItems } from '../models/JobItem'

export class JobsAccess {

    constructor(
      private readonly docClient: DocumentClient = createDynamoDBClient(),
      private readonly jobTable = process.env.JOBS_TABLE,
      private readonly userIdIndex = process.env.JOBS_CREATED_AT_INDEX) {
    }

    async getJob(userId: string, jobId: string): Promise<JobItem> {
      const result = await this.docClient
        .get({
          TableName: this.jobTable,
          Key: { userId, jobId }
        })
        .promise()      
      return result.Item as JobItem
    }

    async getJobQuery(userId: string, jobId: string ): Promise<JobItem> {
  
      const result = await this.docClient.query({
        TableName: this.jobTable,
        IndexName: this.userIdIndex,
        KeyConditionExpression: 'userId = :userId',
        FilterExpression: 'jobId = :jobId',
        ExpressionAttributeValues: {
          ':userId': userId,
          ':jobId': jobId
        },
        ScanIndexForward: false
      }).promise()

    const items = result.Items as JobItem[]
    return items[0]
  }
  
    async getAllJobs(userId: string, nextKey: Key, limit: number): Promise<PageableJobItems> {
      console.log('Getting all jobs of a user')
  
      const result = await this.docClient.query({
        TableName: this.jobTable,
        IndexName: this.userIdIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false,
        Limit: limit,
        ExclusiveStartKey: nextKey
      }).promise()
  
      const items = result.Items as JobItem[]
      return { jobItems: items, lastEvaluatedKey: result.LastEvaluatedKey }
    }
  
    async createJob(newJob: JobItem): Promise<JobItem> {
      await this.docClient.put({
        TableName: this.jobTable,
        Item: newJob
      }).promise()
  
      return newJob
    }
  
    async deleteJob(userId: string, jobId: string): Promise<void> {
      await this.docClient.delete({
        TableName: this.jobTable,
        Key: { userId, jobId }
      }).promise()
    }
  
    async updateJob(userId: string, jobId: string, updatedJob: JobUpdate): Promise<void> {
      await this.docClient.update({
        TableName: this.jobTable,
        Key: { userId, jobId },
        UpdateExpression: "set #name = :n,  #desc=:d, modifiedAt=:m, done=:do",
        ExpressionAttributeValues: {
          ":n": updatedJob.name,
          ":d": updatedJob.desc,
          ":m": updatedJob.modifiedAt,
          ":do": updatedJob.done
        },
        ExpressionAttributeNames: { '#name': 'name', '#desc':'desc' },
        ReturnValues: "NONE"
      }).promise()
    }
  
  
    async updateAttachment(userId: string, jobId: string): Promise<void> {
      await this.docClient.update({
        TableName: this.jobTable,
        Key: { userId, jobId },
        UpdateExpression: "set attachmentUrl=:a",
        ExpressionAttributeValues: {
          ":a": jobId
        },
        ReturnValues: "NONE"
      }).promise()
    }
  
  }
  
  function createDynamoDBClient() {
    return new AWS.DynamoDB.DocumentClient()
  }
  