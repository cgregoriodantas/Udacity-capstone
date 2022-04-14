import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors} from 'middy/middlewares'

import { createLogger } from '../../utils/logger'
import { deleteJob } from '../../helpers/jobs'
import { getUserId } from '../utils'

const logger = createLogger('deleteJob')

export const handler = middy (async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)
  const userId = getUserId(event)
  const jobId = event.pathParameters.jobId

  await deleteJob(userId, jobId)

  return {
    statusCode: 200,
    body: ''
  }
})

handler.use(
  cors({
    credentials: true
  })
)