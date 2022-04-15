import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateJobRequest } from '../../requests/CreateJobRequest'
import { getUserId } from '../utils';
import { createJob } from '../../businessLogic/jobs'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createJob')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)

  const userId = getUserId(event)
  const newJob: CreateJobRequest = JSON.parse(event.body)
  const newItem = await createJob(newJob, userId)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item: newItem
    })
  }
})


handler.use(
  cors({
    credentials: true
  })
)
