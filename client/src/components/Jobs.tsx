import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import ReactDOM from 'react-dom';
import {
  Button,
  Checkbox,
  Grid,
  Icon,
  Image,
  Loader,
  Form,
  Container
} from 'semantic-ui-react'

import { createJob, deleteJob, getJobs, patchJob, getUploadUrl,uploadFile } from '../api/jobs-api'
import Auth from '../auth/Auth'
import { Job } from '../types/Job'
import {UploadState} from '../components/EditJob'


interface JobsState {
  jobs: Job[]
  newJobName: string
  newJobDesc: string
  newJobImage: any
  loadingJobs: boolean  
  uploadState: UploadState
}

interface JobProps {
  auth: Auth
  history: History
}

export class Jobs extends React.PureComponent<JobProps, JobsState> {
  
    
  state: JobsState = {
    jobs: [],
    newJobName: '',
    newJobDesc: '',
    newJobImage: undefined,
    loadingJobs: true,
    uploadState: UploadState.NoUpload
  }



  onJobButtonClick = (jobId: string) => {
    this.props.history.push(`/jobs/${jobId}/edit/`)
  }

  onJobCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    try {
            
      const newJob = await createJob(this.props.auth.getIdToken(), {
        name: this.state.newJobName,
        desc: this.state.newJobDesc,
        done: false
      })

      if(newJob)
      {
        this.setUploadState(UploadState.FetchingPresignedUrl)
        const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), newJob.jobId)
       
        this.setUploadState(UploadState.UploadingFile)
        await uploadFile(uploadUrl, this.state.newJobImage)
      }
           
      const jobs = await getJobs(this.props.auth.getIdToken())
      this.setState({      
       jobs: [...jobs],
        newJobName: '',
        newJobDesc: '',
        newJobImage: '',
        uploadState: UploadState.NoUpload
      })
      
      alert('Registre was uploaded!')   
      

    } catch(e) {
      if (e instanceof Error) {
        alert(`Registre creation failed: ${e.message}`)
      }    
     
    }

  }

  onJobDelete = async (jobId: string) => {
    try {
      await deleteJob(this.props.auth.getIdToken(), jobId)
      this.setState({
        jobs: this.state.jobs.filter(job => job.jobId !== jobId)
      })
    } catch(e) {
      if (e instanceof Error) {
        alert(`Registre deletion failed: ${e.message}`)
      }
      
    }
  }

  onJobCheck = async (pos: number) => {
    try {
      const job = this.state.jobs[pos]
      await patchJob(this.props.auth.getIdToken(), job.jobId, {
        name: job.name,
        desc: job.desc,
        done: !job.done
      })     
      this.setState({
        jobs: update(this.state.jobs, {         
          [pos]: { done: { $set: !job.done } }
        })        
      })          
    } catch(e) {
      if (e instanceof Error) {
        alert(`Registre check failed ${e.message}`)
      }     
    }
  }

  async componentDidMount() {
    try {
      const jobs = await getJobs(this.props.auth.getIdToken())
     
      this.setState({
        jobs,
        loadingJobs: false
      })
    } catch (e) {
      if (e instanceof Error) {
        alert(`Failed to fetch Registre: ${e.message}`)
      }         
    }
  }

  render() {
    return (
      <div>        
        {this.renderCreateJobInput()}
        <br/>
        {this.renderJobs()}
      </div>
    )
  }

  renderCreateJobInput() {
    
    return (
      <div>
      <br/>
      <Container textAlign="center">
       <h1>Tell us your name and a little bit about yourself.</h1>
       <h2>Don't forget to submit your photo</h2>
       </Container>     
       <hr/>
       <br/>
        <Form onSubmit={this.handleSubmit}>
          <Form.Field >
              <label>Name:</label>
              <input 
                type="text"
                placeholder="Enter your name..."
                onChange={this.handleNameChange}               
              />
          </Form.Field>
            <Form.Field>
              <label>Introduction:</label>
              <input
                type="text"
                placeholder="Enter your Introduction..."
                onChange={this.handleDescChange}
              />
            </Form.Field>
            <Form.Field>
              <label>File:</label>
              <input
                type="file"
                accept="image/*"
                name="filePath"
                placeholder="Image to upload"
                onChange={this.handleFileChange}
              />
            </Form.Field>
            <br/>
            {this.renderButton()}

        </Form>
      </div>
    )
  }

  handleSubmit = (event:React.FormEvent<HTMLFormElement>) =>{   

    this.onJobCreate(event);

    let name = (event.currentTarget.elements[0] as HTMLInputElement);
    let desc = (event.currentTarget.elements[1] as HTMLInputElement);
    let file = (event.currentTarget.elements[2] as HTMLInputElement);

    name.value = '';
    desc.value = '';

    if (!file) return

    file.value = '';

  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
   
    this.setState({ newJobName: event.target.value })
  }

  handleDescChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    
    this.setState({ newJobDesc: event.target.value })
   
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    
    if (!files) return    
    
    if(files.length <= 0 ||  files[0].type.indexOf('image') == -1){
      
      alert('The file type must be an image')
      return
    }

    this.setState({
      newJobImage: files[0]
    })
  }

   
  renderButton() {
    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>} 
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          color="blue"
          content='Save'
          icon='save'
          type="submit"          
        /> 

      </div>
    )
  }

 
  renderJobs() {
    if (this.state.loadingJobs) {
      return this.renderLoading()
    }

    return this.renderJobsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Jobs
        </Loader>
      </Grid.Row>
    )
  }

  renderJobsList() {
    return (
      <Grid celled >
        {this.state.jobs.map((job, pos) => {
          return (            
            <Grid.Row color="blue" key={job.jobId}>              
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onJobCheck(pos)}
                  checked={job.done}
                />
              </Grid.Column>
              <Grid.Column width={3}>
                {job.attachmentUrl && (
                  <Image src={job.attachmentUrl} size="mini" />
                )}
              </Grid.Column>
              <Grid.Column width={6} verticalAlign="middle">
                {job.name}
              </Grid.Column>
              <Grid.Column width={3} verticalAlign="middle">
                {job.createdAt}
              </Grid.Column>
              <Grid.Column width={1} verticalAlign="middle">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onJobButtonClick(job.jobId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} verticalAlign="middle">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onJobDelete(job.jobId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }

  setUploadState(uploadState: UploadState)
  {
    this.setState({
      uploadState
    })
  } 
 
}

