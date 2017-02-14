import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Bob from './components/Bob.jsx';
import UserLogin from './components/UserLogin.jsx';
import {Router,Route,IndexRoute,hashHistory} from 'react-router';
import Feedback from './components/Feedback.jsx';
import Header from './components/Header.jsx';

ReactDOM.render(
  <MuiThemeProvider>
  <div>
  													
    <Router history={hashHistory}>
    <Route path = '/' component={Header}>
      <IndexRoute component={UserLogin}/>
      <Route path='/bob' component={Bob}/>
      <Route path='/feedback' component={Feedback}/>
    </Route>
    </Router>
    </div>
    </MuiThemeProvider>,
  document.getElementById('root')
);