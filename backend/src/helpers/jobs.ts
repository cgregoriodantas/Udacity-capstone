import { JobsAccess } from './jobsAcess'
import { AttachmentUtils } from './attachmentUtils';
import { JobItem, PageableJobItems } from '../models/JobItem'
import { CreateJobRequest } from '../requests/CreateJobRequest'
import { UpdateJobRequest } from '../requests/UpdateJobRequest'
import { createLogger } from '../utils/logger'
import { Key } from 'aws-sdk/clients/dynamodb'
import * as uuid from 'uuid'

const jobAccess = new JobsAccess()
const attachmentUtils = new AttachmentUtils()

const logger = createLogger('jobs')

export async function getAllJobs(userId: string, nextKey: Key, limit: number): Promise<PageableJobItems> {
    const items = await jobAccess.getAllJobs(userId, nextKey, limit)

    for (let item of items.jobItems) {
        if (!!item['attachmentUrl'])
            item['attachmentUrl'] = attachmentUtils.getDownloadUrl(item['attachmentUrl'])
    }

    return items
}

export async function getJobQuery(userId: string, jobId: string): Promise<JobItem> {
    
    const job = await jobAccess.getJobQuery(userId, jobId)

    if (!!job['attachmentUrl'])
        job['attachmentUrl'] = attachmentUtils.getDownloadUrl(job['attachmentUrl'])
    

    return job
}

export async function createJob(
    createJobequest: CreateJobRequest,
    userId: string
): Promise<JobItem> {
    const jobId = uuid.v4()

    return await jobAccess.createJob({
        userId,
        jobId,
        createdAt: new Date().toISOString().substring(0,10),
        ...createJobequest
    } as JobItem)
}

export async function deleteJob(userId: string, jobId: string): Promise<void> {
    
    logger.info('delete S3 object', jobId)
    await attachmentUtils.deleteAttachment(jobId)
    
    logger.info('delete job item', userId, jobId)
    await jobAccess.deleteJob(userId, jobId)
}

export async function updateJob(userId: string, jobId: string, updatedJob: UpdateJobRequest): Promise<void> {
    const validJob = await jobAccess.getJob(userId, jobId)

    if (!validJob) {
        throw new Error('404')
    }
    
    logger.info('Updating job: ', userId, updatedJob)
    updatedJob.modifiedAt = new Date().toISOString().substring(0,10)
    return await jobAccess.updateJob(userId, jobId, updatedJob)
}


export async function createAttachmentPresignedUrl(userId:string, jobId: string): Promise<string> {
    const validJob = await jobAccess.getJob(userId, jobId)

    if (!validJob) {
        throw new Error('404')
    }

    const url = attachmentUtils.getUploadUrl(jobId)
    await jobAccess.updateAttachment(userId, jobId)
    return url
}
