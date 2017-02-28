import {Grid, Row, Col} from 'react-flexbox-grid/lib/index';
import {Link,hashHistory} from 'react-router';
import AutoComplete from 'material-ui/AutoComplete';
import Chip from 'material-ui/Chip';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import NavigateBefore from 'material-ui/svg-icons/image/navigate-before';
import NavigateNext from 'material-ui/svg-icons/image/navigate-next';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import SwipeableViews from 'react-swipeable-views';

import request from 'superagent';
import cookie from 'react-cookie';


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
           joinError:"",
           projectsList:[],
           searchText:"",
           usersList:[],
           addUsers:[],
           slideIndex:0,
           projectName1:"",
           nonUserProjects:[],
           create:true,
           addMemberError:"",
       }

       this.handleProjectChange=this.handleProjectChange.bind(this);
       this.handleProjectChange1=this.handleProjectChange1.bind(this);
       this.handleClick=this.handleClick.bind(this);
       this.handleUpdateInput=this.handleUpdateInput.bind(this);
       this.handleNewRequest=this.handleNewRequest.bind(this);
       this.handleRequestDelete=this.handleRequestDelete.bind(this);
       this.handleSlideChange=this.handleSlideChange.bind(this);
       this.handleSlideChangeBackward=this.handleSlideChangeBackward.bind(this);
       this.handleJoin=this.handleJoin.bind(this);
   }

   componentDidMount() {
    var a=cookie.load("Token");
         var b=base64.decode(a.split('.')[1]);
         var userName=utf8.decode(b);
    this.context.socket.emit("getProjectName",userName);
    let that=this;
    this.context.socket.on("takeProjectList",function(projectsList,usersList){
     console.log(usersList);
     console.log("asking channels of ",userName);
       request.get('http://bob.blr.stackroute.in/user/'+userName+'/channels')
        .end((err,res)=>{

          if(JSON.parse(res.text).result){
                      res = JSON.parse(res.text);
                      console.log("from get channels of users",res.data);
                      res.data = res.data.map((item)=>{  //get all the projectName of user.
                        return item.split('#')[0];
                      });

                      let data = projectsList.filter((item)=>{  //compute nonUserProjects
                        return !res.data.includes(item);
                      });
                      console.log("these are non up ",data);
                      
                      let index = usersList.indexOf(userName); //remove user from userslist.
                      if(index > -1)
                        usersList.splice(index,1);
          
                      that.setState({nonUserProjects:data,projectsList:projectsList,usersList:usersList});
                    }
          else{
                      that.setState({nonUserProjects:projectsList,projectsList:projectsList,usersList:usersList});

          }

        });
    })
    
   }

handleUpdateInput(searchText){
    if(this.state.usersList.includes(searchText))
    this.setState({
      searchText: searchText,
    });
  };

  handleNewRequest(){
    var a=this.state.usersList;
    var b=a.indexOf(this.state.searchText);
    if(b>-1){

      a.splice(b,1);
      this.state.addUsers.push(this.state.searchText);
      this.setState({
        searchText: '',
        usersList:a,
        addMemberError:"",
      });
    }
    else{
      this.setState({
        addMemberError:"Member does not Exist!",
        searchText:''
      });
    }

    
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
         var avatar=a.split("#")[1];
         console.log("Avatar",a);
         this.state.addUsers.push(userName);
       this.context.socket.emit("addNewUser",userName,this.state.projectName,this.state.addUsers,avatar);
       window.setTimeout(()=>{hashHistory.push('/bob');},3000);
   }

   handleSlideChange(){
    console.log(this.state.projectsList,"qqqqq");
     if(this.state.projectName=="")
       {
           if(this.state.projectName=="")
           this.setState({projectError:"Please Enter a Team Name"});
       }
     else if(this.state.projectsList.indexOf(this.state.projectName)!=-1){
      this.setState({projectError:"Team already Exists.Try a new name"});
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

   handleProjectChange1(e){
    //console.log(e);
    this.setState({projectName1:e});
   }

    handleJoin(){
      if(this.state.projectName1==""){
          this.setState({joinError:"Team Name cannot be empty"})
      }
      else{
    var a=cookie.load("Token");
         var b=base64.decode(a.split('.')[1]);
         var userName=utf8.decode(b);
         var avatar=a.split("#")[1];

         //this.context.socket.emit("JoinTeam",userName,this.state.projectName1,avatar);
         request
          .post('http://bob.blr.stackroute.in/user/'+userName+"/project")
          .send({userName:userName,projectName:this.state.projectName1,avatar:avatar})
          .end((err,res)=>{
            if(JSON.parse(res.text).result)
                    hashHistory.push("/bob");
            else
              {
                console.log("error is ",JSON.parse(res.text).status);
                this.setState({joinError:JSON.parse(res.text).status});
              }



          });
       }
    // console.log(this.state.projectName1);
    // let that=this;
    // request.patch("http://bob.blr.stackroute.in/channels/"+this.state.projectName1+"/user/"+userName).end(function(err,reply){
    //   if(JSON.parse(reply.text).result==true){
    //     that.setState({request:JSON.parse(reply.text).status});
    //   }
    //   else{

    //     that.setState({request:JSON.parse(reply.text).status});
    //   }
      
    // })
   }
   render() {
    console.log("this is curretn project ,",this.state);
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
            <br/><br/>

               <h3>Join A Project</h3>
            <AutoComplete style={{marginTop:"20px",marginBottom:"20px"}} errorText={this.state.joinError} hintText="Teams" searchText={this.state.projectName1}  maxSearchResults={4} onUpdateInput={this.handleProjectChange1} dataSource={this.state.nonUserProjects} filter={(searchText, key) => (key.indexOf(searchText) !== -1)} openOnFocus={true} /><br/>
            <RaisedButton label="Join" primary={true} onClick={this.handleJoin}/>
            <br/><br/>
            </div>
            <div>
            <h3>Add Members</h3>
               <AutoComplete style={{marginTop:"20px",marginBottom:"20px"}}
                hintText="Members" searchText={this.state.searchText}  maxSearchResults={5}
                 onUpdateInput={this.handleUpdateInput} onNewRequest={this.handleNewRequest}
                  dataSource={this.state.usersList} filter={(searchText, key) => (key.indexOf(searchText) !== -1)}
                  openOnFocus={true} errorText={this.state.addMemberError}
                  /><br/>
               <div>
               {this.state.addUsers.map((item,i)=>{
                 return(<Chip key={i} onRequestDelete={this.handleRequestDelete.bind(this,item)} style={styles.chip}>{item}</Chip>)
               })}
               </div>
                <FloatingActionButton mini={true} onTouchTap={this.handleSlideChangeBackward} style={{marginBottom:"20px"}}>
                <NavigateBefore />
               </FloatingActionButton><br/>
              <RaisedButton label="Create" disabled={!this.state.create}  primary={true} style={{marginTop:"20px"}} onClick={this.handleClick}/>
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
ProjectDetails.contextTypes = {
  socket:React.PropTypes.object
};