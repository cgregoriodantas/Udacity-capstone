import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { createLogger } from '../../utils/logger'
import { getAllJobs } from '../../helpers/jobs'
import { getUserId, parseLimitParameter, parseNextKeyParameter, encodeNextKey } from '../utils';

const logger = createLogger('getJobs')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  logger.info('Processing event: ', event)

  let nextKey 
  let limit 

  try {
    
    nextKey = parseNextKeyParameter(event)
    limit = parseLimitParameter(event) || 20
  } catch (e) {
    logger.error('Failed to parse query parameters: ', e.message)
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Invalid parameters'
      })
    }
  }

  const userId = getUserId(event)
  const items = await getAllJobs(userId, nextKey, limit);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      items: items.jobItems,
     
      nextKey: encodeNextKey(items.lastEvaluatedKey)
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)

