import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { updateJob } from '../../helpers/jobs'
import { UpdateJobRequest } from '../../requests/UpdateJobRequest'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('updateJob')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)
  const userId = getUserId(event)
  const jobId = event.pathParameters.jobId
  const updatedJob: UpdateJobRequest = JSON.parse(event.body)

  try {
    await updateJob(userId, jobId, updatedJob)

    return {
      statusCode: 201,
      body: ''
    }
  } catch (error) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error
      })
    }
  }
})

handler.use(
  cors({
    credentials: true
  })
)
