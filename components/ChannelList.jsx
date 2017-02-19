import React, {PropTypes,Component} from 'react';
import {List, ListItem,makeSelectable} from 'material-ui/List';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Badge from 'material-ui/Badge';
import SelectField from 'material-ui/SelectField';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import AddCircle from 'material-ui/svg-icons/content/add-circle';
import ViewList from 'material-ui/svg-icons/action/view-list';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Subheader from 'material-ui/Subheader';
import { Grid, Row, Col} from 'react-flexbox-grid/lib';
import Paper from 'material-ui/Paper';
import AppBar from 'material-ui/AppBar'

let SelectableList = makeSelectable(List);
injectTapEventPlugin();
import cookie from 'react-cookie';


export default class ChannelList extends React.Component{
  constructor(props){
    super(props);
   // console.log(this.props.currentChannel,"Constructor");
    this.state={currentProject:"",channels:[],channelName:"",open:false,dOpen:false}
    this.handleAddChannel=this.handleAddChannel.bind(this);
    this.handleClose=this.handleClose.bind(this);
    this.handleNameChange=this.handleNameChange.bind(this);
    this.handleSubmit=this.handleSubmit.bind(this);
    this.handleDrawerOpen=this.handleDrawerOpen.bind(this);
    this.handleProjectChange=this.handleProjectChange.bind(this);
   } 

   componentDidMount() {
     console.log(this.props.channelList,this.props.currentChannel,"Inside ChannelList");
     let a=this.props.currentChannel.split('#')[0];
     this.setState({currentProject:a})
   }

  handleChange(item){
   // console.log("setCurrentChannel", item);
    var temp=this.props.currentChannel;
    console.log(item,this.state.currentChannel,"heloooooo");
    this.props.setCurrentChannel(this.state.currentProject+"#"+item,temp);
  }
  
  handleAddChannel(){
        //console.log("Icon clicked");
    this.setState({open:true});
  
  }

  handleClose(){
    this.setState({open:false})
  }

  handleNameChange(e){
    this.setState({channelName:e.target.value})
  }

  handleSubmit(){
    this.props.socket.emit('newChannel', this.props.userName,this.state.currentProject,this.state.channelName);
    this.setState({open:false,channelName:""})
  }

  handleDrawerOpen(name){
    if(this.state.dOpen)
    this.setState({dOpen:false});
    else
    this.setState({dOpen:true});
  }

  handleProjectChange(name){
    this.setState({currentProject:name,dOpen:false});
    this.props.setCurrentChannel(name+"#"+"general",this.props.currentChannel);

  }

  render(){
    console.log(this.props.channelList,"Render of ChannelList");
  //  let twoD = {};
  //  this.props.channelList.forEach((item,i)=>{
  //    let splitted = item.split("#");
  //    if(!twoD.hasOwnProperty(splitted[0])){
  //     twoD[splitted[0]] = new Array();
  //     twoD[splitted[0]].push(splitted[1]);
  //     }
  //    else{
  //      twoD[splitted[0]].push(splitted[1]);
  //     }
  // });
  const actions = <RaisedButton label="Create" primary={true} onTouchTap={this.handleSubmit}/>
  let display=  <Dialog title="Create Channel" actions={actions} modal={false} open={this.state.open} onRequestClose={this.handleClose}>
  <TextField hintText="Channel Name" floatingLabelText="Channel Name" value={this.state.channelName} onChange={this.handleNameChange}/><br />
        </Dialog>
  let projects=[];
  this.props.channelList.map((item,i)=>{
    if(projects.indexOf(item.split("#")[0])==-1){
      projects.push(item.split("#")[0]);
    }
  })
  let channels=[];
  this.props.channelList.map((item,i)=>{
    if(this.state.currentProject==item.split('#')[0]){
      channels.push(item.split('#')[1]);
    }
  })

let channelList=<div>{channels.map((item,i)=>{
    return(<ListItem key={i} primaryText={item} onTouchTap={this.handleChange.bind(this,(this.state.channelName+item))} rightIcon={<Badge badgeContent={this.props.unreadCount[this.state.currentProject+'#'+item]} primary={true}></Badge>}/>)
})}
    </div>
   // let channelList = Object.getOwnPropertyNames(twoD).map((item,i)=>{

   //    let nestedItems = twoD[item].map((element,index)=>{
   //      return (<ListItem
   //                key={index}
   //                primaryText={element}
   //                rightIcon={<Badge badgeContent={this.props.unreadCount[item+"#"+element]} primary={true}></Badge>}
   //                onTouchTap={this.handleChange.bind(this,(item+"#"+element))}

   //              />);
   //    });
   //    return (<ListItem
   //            primaryText={item}
   //            key={i}
   //            initiallyOpen={true}
   //            primaryTogglesNestedList={true}
   //            nestedItems={nestedItems}

   //              />);
              
   // });
    return(
      <div style={{height:'100%',border:'solid 1px #d9d9d9'}}>
       <Grid style={{height:'100%',width:"100%"}}>
       <Paper style={{height:'100%',width:"100%"}}>
          <Row style={{width:"100%"}}>
            <Col xs={12} sm={12} md={12} lg={12} style={{height:'100%',width:"100%"}}>
       <Subheader style={{fontSize:"18px"}}>Switch Project<IconButton style={{marginLeft:"100px"}} onTouchTap={this.handleDrawerOpen}><ViewList/></IconButton></Subheader>
      </Col>
          </Row>
       <Row style={{width:"100%"}}>
            <Col xs={12} sm={12} md={12} lg={12} style={{height:'100%',width:"100%"}}>
       <Subheader style={{fontSize:"18px"}}>Channels<IconButton onTouchTap={this.handleAddChannel} style={{marginLeft:"136px"}}><AddCircle/></IconButton></Subheader>
      </Col>
          </Row>
          <Row style={{width:"100%"}}>
            <Col xs={12} sm={12} md={12} lg={12} style={{height:'100%'}}>
      {display}
      <SelectableList >
      {channelList}
      <Drawer open={this.state.dOpen}>
       <Subheader style={{fontSize:"20px"}}>Your Projects</Subheader>
       <SelectableList value={this.state.currentProject}>
          {projects.map((item,i)=>{
            return(<ListItem key={i} value={item} onTouchTap={this.handleProjectChange.bind(this,item)}>{item}</ListItem>);
          })}
        </SelectableList>
      </Drawer>
      </SelectableList>
      </Col>
          </Row>
           </Paper>
        </Grid>
      </div>
    );
  }
}
