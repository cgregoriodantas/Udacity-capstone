# Udacity Jobs Serverless capstone project

## Project Components
- Restful API (Lambda Functions, API Gateway and DynamoDb)
- Client (React)

## How to run the application
### Deploy Backend
To deploy an application run the following commands:

```bash
cd backend
npm install
serverless deploy --verbose
````
### Update frontend configuration
```js
const apiId = 'd3kjdgb9ca'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {

  domain: 'dev-g04pcx0t.us.auth0.com',            
  clientId: 'HwEan1NrotMhvXNzIl67HBjYzCbpUerF',          
  callbackUrl: 'http://localhost:3000/callback'
}
```
### Frontend
```bash
cd client
npm install
npm run start
```

## Current Deplyment details
API Endpoint
```
https://d3kjdgb9ca.execute-api.us-east-1.amazonaws.com/dev/jobs
```