import React, { Component } from 'react';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import {Grid, Row, Col} from 'react-flexbox-grid/lib/index';

export default class Login extends Component {
	render() {
		return (
			 
              <center style={{height:"100%"}}>
              <Paper style={{height:"400px",width:"400px",marginTop:"20px"}}>
              <Grid  style={{height:'100%', width:"60%"}}>
               <Row style={{ height:'100%',overflow:'hidden',width:"100%"}}>
             <Col xs={12} sm={12} md={12} lg={12} style={{height:'100%'}}>
             <h2>Let's Chat  -Bob</h2>
				<RaisedButton label="Login with GITHUB" style={{marginTop:"100px"}} href="https://github.com/login/oauth/authorize?client_id=1b4daad08bbe4298d833" primary={true} />
			</Col>
			</Row>
			</Grid>
			</Paper>
			</center>
		);
	}
}
