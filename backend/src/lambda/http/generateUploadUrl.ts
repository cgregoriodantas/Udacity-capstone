import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors} from 'middy/middlewares'

import { createLogger } from '../../utils/logger'
import { createAttachmentPresignedUrl } from '../../businessLogic/jobs'
import { getUserId } from '../utils'

const logger = createLogger('generateUploadUrl')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)
  const userId = getUserId(event)
  const jobId = event.pathParameters.jobId

  try {
    const url = await createAttachmentPresignedUrl(userId, jobId)
    return {
      statusCode: 200,
      body: JSON.stringify({
        "uploadUrl": url
      })
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

