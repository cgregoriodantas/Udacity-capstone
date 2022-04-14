export interface Job {
  jobId: string
  createdAt: string
  name: string
  desc: string
  done: boolean
  attachmentUrl?: string
}
