import React, { Component } from 'react'
import { Route, Router, Switch } from 'react-router-dom'
import { Button, Grid, Menu, Segment } from 'semantic-ui-react'

import Auth from './auth/Auth'
import { EditJob } from './components/EditJob'
import { LogIn } from './components/LogIn'
import { NotFound } from './components/NotFound'
import { Jobs } from './components/Jobs'

export interface AppProps {}

export interface AppProps {
  auth: Auth
  history: any
}

export interface AppState {}

export default class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props)

    this.handleLogin = this.handleLogin.bind(this)
    this.handleLogout = this.handleLogout.bind(this)
  }

  handleLogin() {
    this.props.auth.login()
  }

  handleLogout() {
    this.props.auth.logout()
  }

  render() {
    return (
      <div>
        <Segment style={{ padding: '8em 0em' }} vertical>
          <Grid container stackable verticalAlign="middle">         
            <Grid.Row>
              <Grid.Column width={16}>
                <Router history={this.props.history}>
                  {this.generateMenu()}

                  {this.generateCurrentPage()}
                </Router>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      </div>
    )
  }

  generateMenu() {
    if (this.props.auth.isAuthenticated()) {
    return (
      <Menu>
        <Menu.Item name="home">          
          <Button onClick={() => this.home()}
            color='blue'
            content='Home'
            icon='home'
            size="medium"
          />         
        </Menu.Item>

        <Menu.Menu position="right">{this.logInLogOutButton()}</Menu.Menu>
      </Menu>
    )
    }
  }

  logInLogOutButton() {
    if (this.props.auth.isAuthenticated()) {
      return (
        <Menu.Item name="logout" onClick={this.handleLogout}>
           <Button onClick={() => this.handleLogout()}
            color='red'
            content='Log out'
            icon='sign-out'
            size="medium"
          />         
        </Menu.Item>
      )
    } 
    else {
      return (
        <Menu.Item name="login" onClick={this.handleLogin}>
          Log In
        </Menu.Item>
      )
    }
  }

  home() {
    this.props.history.push('/')
  }

  generateCurrentPage() {
    if (!this.props.auth.isAuthenticated()) {
      return <LogIn auth={this.props.auth} />
    }

    return (
      <Switch>
        <Route
          path="/"
          exact
          render={props => {
            return <Jobs {...props} auth={this.props.auth} />
          }}
        />

        <Route
          path="/jobs/:jobId/edit"
          exact
          render={props => {
            return <EditJob {...props} auth={this.props.auth} />
          }}
        />

        <Route component={NotFound} />
      </Switch>
    )
  }
}
