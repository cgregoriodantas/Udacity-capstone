import * as React from 'react'
import { Form, Button } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { History } from 'history'
import { getUploadUrl, uploadFile,patchJob,getJob } from '../api/jobs-api'

export enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface EditJobProps {
  match: {
    params: {
      jobId: string
    }
  },
  auth: Auth,
  history: History
}

interface EditJobState {
  name: string
  desc: string
  done: any
  file: any
  newfile: any
  uploadState: UploadState
}

export class EditJob extends React.PureComponent<
  EditJobProps,
  EditJobState
> {
  state: EditJobState = {
    name: '',
    desc: '',
    done: false,
    file: undefined,
    newfile: undefined,
    uploadState: UploadState.NoUpload
  }


  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    
    if (!files) return    
    
    if(files.length <= 0 ||  files[0].type.indexOf('image') == -1){
      
      alert('The file type must be an image')
      return
    }

    this.setState({
      newfile: files[0]
    })
  }

  handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const _name = event.target.value
    if (!_name) return

    this.setState({
      name: _name
    })
  }
  
  handleDescChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const _desc = event.target.value
    if (!_desc) return

    this.setState({
      desc: _desc
    })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      
     await patchJob(this.props.auth.getIdToken(), this.props.match.params.jobId, {
        name: this.state.name,
        desc: this.state.desc,
        done: this.state.done,
      })

      if(this.state.newfile)
      {
        this.setUploadState(UploadState.FetchingPresignedUrl)
        const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), this.props.match.params.jobId)
  
        this.setUploadState(UploadState.UploadingFile)
        await uploadFile(uploadUrl, this.state.newfile)       
      }     

      alert('Post was updated!')
      
      
      this.props.history.push('/')
    } catch (e) {
      if (e instanceof Error) {
        alert(`Could not upload a file: ${e.message}`)
      }
      
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  async componentDidMount() {
    try {
        
      const jobs = await getJob(this.props.auth.getIdToken(),this.props.match.params.jobId)
    
       this.setState({
        name: jobs.name,
        desc: jobs.desc,
        file: jobs.attachmentUrl,
        done: jobs.done
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
        
        <Form onSubmit={this.handleSubmit}>
        <Form.Field>
            <label>File</label>
            
            <img src={this.state.file} width={100} height={100} />
              
          </Form.Field>
        <Form.Field>
            <label>Name</label>
            <input
              type="text"
              placeholder="Enter Name..."
              value={this.state.name}
              onChange={this.handleTitleChange}
            />
          </Form.Field>
          <Form.Field>
            <label>Introduction</label>
            <input
              type="text"
              placeholder="Enter Description..."
              value={this.state.desc}
              onChange={this.handleDescChange}
            />
          </Form.Field>
          <Form.Field>
              <label>File</label>
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
}
