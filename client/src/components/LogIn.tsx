import * as React from 'react'
import Auth from '../auth/Auth'
import { Button, Container } from 'semantic-ui-react'

interface LogInProps {
  auth: Auth
}

interface LogInState { }

export class LogIn extends React.PureComponent<LogInProps, LogInState> {
  onLogin = () => {
    this.props.auth.login()
  }

  render() {
    return (
      <Container textAlign='center'>

        <h1 style={{ fontSize:60}}>Welcome to our page !</h1>
        <h2 style={{ fontSize:40}}>Log in and register</h2>
        <br/>
        <br/>
        <Button onClick={this.onLogin}
          color='blue'
          content='Log in'
          icon='users'
          size="huge"

        />

      </Container>
    )
  }
}
