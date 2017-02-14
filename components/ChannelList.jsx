import React, {PropTypes,Component} from 'react';
import {List, ListItem,makeSelectable} from 'material-ui/List';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Badge from 'material-ui/Badge';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import AddCircle from 'material-ui/svg-icons/content/add-circle';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Subheader from 'material-ui/Subheader';
import { Grid, Row, Col} from 'react-flexbox-grid/lib';
let SelectableList = makeSelectable(List);
injectTapEventPlugin();
import cookie from 'react-cookie';


export default class ChannelList extends React.Component{
  constructor(props){
    super(props);
    this.state={channels:[],channelName:""}
    super(props);
    this.handleAddChannel=this.handleAddChannel.bind(this);
    this.handleClose=this.handleClose.bind(this);
    this.handleNameChange=this.handleNameChange.bind(this);
    this.handleSubmit=this.handleSubmit.bind(this);
   } 



  handleChange(item){
    console.log("setCurrentChannel", item);
    var temp=this.props.currentChannel;
    this.props.setCurrentChannel(item,temp);
  }
  
  handleAddChannel(){
        console.log("Icon clicked");
    this.setState({open:true});
  
  }

  handleClose(){
    this.setState({open:false})
  }

  handleNameChange(e){
    this.setState({channelName:e.target.value})
  }

  handleSubmit(){
    this.props.socket.emit('newChannel', cookie.load('userId'),cookie.load('projectName'), this.state.channelName);
    this.setState({open:false,channelName:""})
  }

  render(){
    console.log(this.props,"hi");
   let twoD = {};
   this.props.channelList.forEach((item,i)=>{
     let splitted = item.split("#");
     if(!twoD.hasOwnProperty(splitted[0])){
      twoD[splitted[0]] = new Array();
      twoD[splitted[0]].push(splitted[1]);
      }
     else{
       twoD[splitted[0]].push(splitted[1]);
      }
  });
  const actions = <RaisedButton label="Create" primary={true} onTouchTap={this.handleSubmit}/>
  let display=  <Dialog title="Create Channel" actions={actions} modal={false} open={this.state.open} onRequestClose={this.handleClose}>
  <TextField hintText="Channel Name" floatingLabelText="Channel Name" value={this.state.channelName} onChange={this.handleNameChange}/><br />
        </Dialog>

   let channelList = Object.getOwnPropertyNames(twoD).map((item,i)=>{

      let nestedItems = twoD[item].map((element,index)=>{
        return (<ListItem
                  key={index}
                  primaryText={element}
                  rightIcon={<Badge badgeContent={this.props.unreadCount[item+"#"+element]} primary={true}></Badge>}
                  onTouchTap={this.handleChange.bind(this,(item+"#"+element))}

                />);
      });
      return (<ListItem
              primaryText={item}
              key={i}
              initiallyOpen={true}
              primaryTogglesNestedList={true}
              nestedItems={nestedItems}

                />);
              
   });
    return(
      <div style={{height:'100%',border:'solid 1px #d9d9d9'}}>
       <Grid style={{height:'100%',width:"100%"}}>
          <Row style={{width:"100%"}}>
            <Col xs={12} sm={12} md={12} lg={12} style={{height:'100%',width:"100%"}}>
       <Subheader style={{fontSize:"18px"}}>Channels<IconButton style={{marginLeft:"100px"}}  onTouchTap={this.handleAddChannel}><AddCircle/></IconButton></Subheader>
      </Col>
          </Row>
          <Row style={{width:"100%"}}>
            <Col xs={12} sm={12} md={12} lg={12} style={{height:'100%'}}>
      {display}
      <List>
      {channelList}
      </List>
      </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}
