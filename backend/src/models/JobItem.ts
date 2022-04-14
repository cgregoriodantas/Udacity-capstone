import { Key } from "aws-sdk/clients/dynamodb";

export interface JobItem {
  userId: string
  jobId: string
  createdAt: string
  name: string
  desc: string
  done: boolean
  attachmentUrl?: string
}

export interface PageableJobItems {
  jobItems: JobItem[]
  lastEvaluatedKey: Key
}