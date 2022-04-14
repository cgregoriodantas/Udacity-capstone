import { apiEndpoint } from '../config'
import { Job } from '../types/Job';
import { CreateJobRequest } from '../types/CreateJobRequest';
import Axios from 'axios'
import { UpdateJobRequest } from '../types/UpdateJobRequest';

export async function getJobs(idToken: string): Promise<Job[]> {
 
  const response = await Axios.get(`${apiEndpoint}/jobs`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
 
  return response.data.items
}

export async function getJob(idToken: string, jobId: string): Promise<Job> {
  
  const response = await Axios.get(`${apiEndpoint}/jobs/${jobId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  
  return response.data.items
}

export async function createJob(
  idToken: string,
  newJob: CreateJobRequest
): Promise<Job> {
  const response = await Axios.post(`${apiEndpoint}/jobs`,  JSON.stringify(newJob), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchJob(
  idToken: string,
  jobId: string,
  updatedJob: UpdateJobRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/jobs/${jobId}`, JSON.stringify(updatedJob), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteJob(
  idToken: string,
  jobId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/jobs/${jobId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  jobId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/jobs/${jobId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
