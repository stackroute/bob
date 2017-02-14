import React, { Component } from 'react';

import TextField from 'material-ui/TextField';

import RaisedButton from 'material-ui/RaisedButton';

import Paper from 'material-ui/Paper';

//import io from 'socket.io-client';

import {Link,hashHistory} from 'react-router';

import request from 'superagent';

import {Grid, Row, Col} from 'react-flexbox-grid/lib/index';

import cookie from 'react-cookie';

export default class UserLogin extends Component {

   constructor(props) {

       super(props);

       this.state={

           userName:"",

           projectName:"",

           socket: null,

           nameError:"",

           projectError:""

       }

       this.handleUserNameChange=this.handleUserNameChange.bind(this);

       this.handleProjectChange=this.handleProjectChange.bind(this);

       this.handleClick=this.handleClick.bind(this);

   }

   componentDidMount() {

   //  this.setState({socket: io('http://localhost:8000')});

   }

   handleUserNameChange(e){

       this.setState({userName:e.target.value,nameError:""})

   }

   handleProjectChange(e){

       this.setState({projectName:e.target.value,projectError:""})

   }

   handleClick(){

       cookie.save('userId',this.state.userName);
       cookie.save('projectName',this.state.projectName);
       console.log(this.state,"posting request");

       if(this.state.userName==""||this.state.projectName=="")

       {

           if(this.state.userName=="")

           this.setState({nameError:"Please Enter a User Name"});

           if(this.state.projectName=="")

           this.setState({projectError:"Please Enter a Project Name"});

       }

       else{

       request

         .post('http://172.23.238.193:8000/UserLogin')

         .send({ UserName: this.state.userName, projectName: this.state.projectName })

         .end((err,res)=>{
          console.log("this is result.text : ",res.text);
	  
           console.log(res,"this is response",err);

           hashHistory.push('/bob');

       });

       }

   }

   render() {

       return (

           <div style={{height:"100%"}}>



             <center style={{height:"100%"}}>
                  <Grid  style={{height:'100%', width:"60%"}}>
                  <Row style={{ height:'100%',overflow:'hidden',width:"100%"}}>
                  <Col xs={12} sm={12} md={12} lg={12} style={{height:'100%'}}>
            <Paper zDepth={3} style={{width:"100%",height:"100%",marginTop:"30px"}}>

           <h2>Log In</h2>

               <form onSubmit={this.handleClick}>

               <TextField hintText="UserName" style={{marginTop:"50px"}} floatingLabelText="UserName" value={this.state.userName} onChange={this.handleUserNameChange} errorText={this.state.nameError}/><br />

               <TextField hintText="Project" floatingLabelText="Project" value={this.state.projectName} onChange={this.handleProjectChange} errorText={this.state.projectError}/><br />

               <RaisedButton label="Login"  style={{marginTop:"50px"}} labelStyle={{color:"white"}} buttonStyle={{background:"#3F51B5 "}} onClick={this.handleClick}/>

               </form>

           </Paper>
          </Col>
        </Row>
      </Grid>

           </center>



           </div>

       );

   }

}
