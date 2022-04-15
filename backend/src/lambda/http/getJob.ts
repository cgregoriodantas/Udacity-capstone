import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { createLogger } from '../../utils/logger'
import { getJobQuery } from '../../businessLogic/jobs'
import { getUserId } from '../utils';

const logger = createLogger('getJob')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)
  
  const userId = getUserId(event)  
  const jobId = event.pathParameters.jobId  
  const job = await getJobQuery(userId, jobId);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      items: job
    })
  }
})

handler.use(
  cors({
    origin: '*',
    credentials: true
  })
)

