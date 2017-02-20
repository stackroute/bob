import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Paper from 'material-ui/Paper';
import Chip from 'material-ui/Chip';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import NavigateNext from 'material-ui/svg-icons/image/navigate-next';
import NavigateBefore from 'material-ui/svg-icons/image/navigate-before';
import SwipeableViews from 'react-swipeable-views';
import {Link,hashHistory} from 'react-router';
import request from 'superagent';
import {Grid, Row, Col} from 'react-flexbox-grid/lib/index';
import AutoComplete from 'material-ui/AutoComplete';
import cookie from 'react-cookie';
import io from 'socket.io-client';
var base64 = require('base-64');
var utf8 = require('utf8');

const styles = {
  chip: {
    marginBottom: 4,
  }
  }

export default class ProjectDetails extends Component {

   constructor(props) {

       super(props);
       this.state={
           projectName:"",
           projectError:"",
           socket:io('http://bob.blr.stackroute.in'),
           projectsList:[],
           searchText:"",
           usersList:[],
           addUsers:[],
           slideIndex:0
       }

       this.handleProjectChange=this.handleProjectChange.bind(this);
       this.handleClick=this.handleClick.bind(this);
       this.handleUpdateInput=this.handleUpdateInput.bind(this);
       this.handleNewRequest=this.handleNewRequest.bind(this);
       this.handleRequestDelete=this.handleRequestDelete.bind(this);
       this.handleSlideChange=this.handleSlideChange.bind(this);
       this.handleSlideChangeBackward=this.handleSlideChangeBackward.bind(this);
   }

   componentDidMount() {
    this.state.socket.emit("getProjectName");
    let that=this;
    this.state.socket.on("takeProjectList",function(projectsList,usersList){
      console.log(usersList);
      that.setState({projectsList:projectsList,usersList:usersList})
    })
   }

handleUpdateInput(searchText){
    this.setState({
      searchText: searchText,
    });
  };

  handleNewRequest(){
    var a=this.state.usersList;
    var b=a.indexOf(this.state.searchText);
    a.splice(b,1);
    this.state.addUsers.push(this.state.searchText);
    this.setState({
      searchText: '',
      usersList:a
    });
  };

   handleProjectChange(e){
       this.setState({projectName:e.target.value,projectError:""})
   }

   handleRequestDelete(name){
    var a=this.state.addUsers;
    var b=a.indexOf(name);
    a.splice(b,1);
    console.log(a,b,"a and b");
    this.setState({addUsers:a});
    this.state.usersList.push(name);
   }

   handleClick(){
       cookie.save('projectName',this.state.projectName);
       var a=cookie.load("Token");
         var b=base64.decode(a.split('.')[1]);
         var userName=utf8.decode(b);
         this.state.addUsers.push(userName);
       this.state.socket.emit("addNewUser",userName,this.state.projectName,this.state.addUsers)
   }

   handleSlideChange(){
     if(this.state.projectName=="")
       {
           if(this.state.projectName=="")
           this.setState({projectError:"Please Enter a Project Name"});
       }
       else{
    var a=this.state.slideIndex;
    this.setState({slideIndex:a+1});
  }
   }

   handleSlideChangeBackward(){
    var a=this.state.slideIndex;
    this.setState({slideIndex:a-1})
   }
   render() {

       return (

           <div style={{height:"100%"}}>
             <center style={{height:"100%"}}>
                  <Grid  style={{height:'100%', width:"60%"}}>
                  <Row style={{ height:'100%',overflow:'hidden',width:"100%"}}>
                  <Col xs={12} sm={12} md={12} lg={12} style={{height:'100%'}}>
            <Paper zDepth={3} style={{width:"100%",height:"100%",marginTop:"30px"}}>

            <SwipeableViews index={this.state.slideIndex}>
            <div>
              <h3>Create Your own Team in Bob</h3>
               <TextField hintText="Team Name" style={{marginTop:"20px",marginBottom:"20px"}} floatingLabelText="Team Name" value={this.state.projectName} onChange={this.handleProjectChange} errorText={this.state.projectError}/><br />
              <FloatingActionButton mini={true} onTouchTap={this.handleSlideChange} style={{marginBottom:"20px"}}>
                <NavigateNext />
               </FloatingActionButton>
            </div>
            <div>
            <h3>Add Members</h3>
               <AutoComplete style={{marginTop:"20px",marginBottom:"20px"}} hintText="Members" searchText={this.state.searchText}  maxSearchResults={5} onUpdateInput={this.handleUpdateInput} onNewRequest={this.handleNewRequest} dataSource={this.state.usersList} filter={(searchText, key) => (key.indexOf(searchText) !== -1)} openOnFocus={true} /><br/>
               <div>
               {this.state.addUsers.map((item,i)=>{
                 return(<Chip key={i} onRequestDelete={this.handleRequestDelete.bind(this,item)} style={styles.chip}>{item}</Chip>)
               })}
               </div>
                <FloatingActionButton mini={true} onTouchTap={this.handleSlideChangeBackward} style={{marginBottom:"20px"}}>
                <NavigateBefore />
               </FloatingActionButton><br/>
               <Link to={'bob'}><RaisedButton label="Create"  primary={true} style={{marginTop:"20px"}} onClick={this.handleClick}/></Link>
           </div>
           </SwipeableViews>
           </Paper>
          </Col>
        </Row>
      </Grid>

           </center>



           </div>

       );

   }

}
