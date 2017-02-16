import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Bob from './components/Bob.jsx';
import ProjectDetails from './components/ProjectDetails.jsx';
import {Router,Route,IndexRoute,hashHistory} from 'react-router';
import Feedback from './components/Feedback.jsx';
import Header from './components/Header.jsx';
import Login from './components/Login.jsx';
import cookie from "react-cookie";

function checkAuth(nextState,replace){
  //console.log(cookie.load("Token"));
  if(cookie.load("Token")==undefined) {
    replace({
      pathname: '/'
    })
}
}

ReactDOM.render(
  <MuiThemeProvider>
  <div>
  													
    <Router history={hashHistory}>
    <Route path = '/' component={Header}>
      <IndexRoute component={Login}/>
      <Route path='/project' component={ProjectDetails} onEnter={checkAuth}/>
      <Route path='/bob' component={Bob} onEnter={checkAuth}/>
      <Route path='/feedback' component={Feedback}/>
    </Route>
    </Router>
    </div>
    </MuiThemeProvider>,
  document.getElementById('root')
);