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
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import request from 'superagent'; //added by manoj


let SelectableList = makeSelectable(List);
injectTapEventPlugin();
import cookie from 'react-cookie';


export default class ChannelList extends React.Component{
  constructor(props){
    super(props);
   // console.log(this.props.currentChannel,"Constructor");
    this.state={currentProject:"",channels:[],channelName:"",open:false,dOpen:false,type:"public"
                ,DMDialogInput:"",DMDialogOpen:false}
    this.handleAddChannel=this.handleAddChannel.bind(this);
    this.handleClose=this.handleClose.bind(this);
    this.handleNameChange=this.handleNameChange.bind(this);
    this.handleSubmit=this.handleSubmit.bind(this);
    this.handleDrawerOpen=this.handleDrawerOpen.bind(this);
    this.handleProjectChange=this.handleProjectChange.bind(this);
    this.handleType=this.handleType.bind(this);
   }

   componentDidMount() {
     console.log(this.props.channelList,this.props.currentChannel,"Inside ChannelList");
     let a=this.props.currentChannel.split('#')[0];
     this.setState({currentProject:a})
   }

  handleChange(item){
   // console.log("setCurrentChannel", item);
    var temp=this.props.currentChannel;
    console.log(item,this.props.currentChannel,"heloooooo");
    this.props.setCurrentChannel(this.props.currentChannel.split("#")[0]+"#"+item,temp);
  }

  handleAddChannel(){
        //console.log("Icon clicked");
    this.setState({open:true});

  }

  handleClose(){
    this.setState({open:false})
  }

  handleDMDClose(){ //added by manoj
    this.setState({DMDialogOpen:false})
  }

  handleNameChange(e){
    this.setState({channelName:e.target.value})
  }


 handleAddDM(){  //added by manoj
        console.log("Icon clicked");
    this.setState({DMDialogOpen:true});

  }

  handleDMDChange(e){ //added by manoj
    this.setState({DMDialogInput:e.target.value})

  }


  handleSubmit(){
    this.props.socket.emit('newChannel', this.props.userName,this.props.currentChannel.split("#")[0],this.state.channelName,this.state.type);
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

   handleType(event){
    this.setState({type:event.target.value});
  }
  handleAddDirectMessage(){ //added by manoj


    request
      .post('http://bob.blr.stackroute.in/users/'+ this.props.userName +'/channels')
      .send({
            "userId":this.props.userName,
            "toId":this.state.DMDialogInput,
            "project":this.state.currentProject
        })
      .end((err,res)=>{
        if(JSON.parse(res.text).result)
          {
            this.props.snackbar(JSON.parse(res.text).status);
            this.props.pushChannel(JSON.parse(res.text).channelName);
          }
          else{
            console.log("adding DM failed: ",JSON.parse(res.text));
          }

      });
      this.setState({DMDialogOpen:false,DMDialogInput:""});
  }

  render(){
    console.log(this.props.channelList,"Render of ChannelList");
    const actions = <RaisedButton label="Create" primary={true} onTouchTap={this.handleSubmit}/>
    let display=  (<Dialog title="Create Channel" actions={actions} modal={false} open={this.state.open} onRequestClose={this.handleClose}>
    <TextField hintText="Channel Name" floatingLabelText="Channel Name" value={this.state.channelName} onChange={this.handleNameChange}/><br />
    <RadioButtonGroup name="Types" defaultSelected="public" onChange={this.handleType}>
    <RadioButton value="public" label="Public"/>
    <RadioButton value="private" label="Private"/>
    </RadioButtonGroup>
    </Dialog>);


    //added by manoj
    let addDMActions = (<RaisedButton label="Create" primary={true} onTouchTap={this.handleAddDirectMessage.bind(this)}/>);
    let addDMDialog = (<Dialog title="Start Chat" actions={addDMActions}
    modal={false} open={this.state.DMDialogOpen}
    onRequestClose={this.handleDMDClose.bind(this)}>
    <TextField hintText="Person Name" floatingLabelText="Person Name" value={this.state.DMDialogInput} onChange={this.handleDMDChange.bind(this)}/><br />
    </Dialog>);
    //added by manoj end

    let channels=[];

    channels = this.props.channelList.filter((item,i)=>{ //get only this project channles.
      return this.state.currentProject===item.split('#')[0];
    })

    let DMList = channels.filter((item,i)=>{ //get all dm channels.
      return item.split('#').length === 3;
    });

    channels = channels.filter((item,i)=>{ //get all group channels.
      return item.split('#').length === 2;
    });

    let channelSelectable = channels;
    let DMSelectable = DMList;

    channels = channels.map((item,i)=>{ //get all group channel without project name.
      return item.split('#')[1];
    });


    let DMListfiltered = DMList.map((item,i)=>{  //get the dm filtered list.
      let index = item.split('#').indexOf(this.props.userName);
      if(index == 1)
      return item.split('#')[2];
      else
      return item.split('#')[1];

    });
    DMList = DMList.map((item,i)=>{  //display the names.
      return item.split('#')[1]+"#"+item.split('#')[2];
    });
    console.log("this is channels, ",channels,"and this is dm",DMList,"filtered: ",DMListfiltered);


    let channelList=channels.map((item,i)=>{  //this is group channels list
        if(this.props.unreadCount[this.props.currentChannel.split("#")[0]+'#'+item]!=0&&this.props.unreadCount[this.props.currentChannel.split("#")[0]+'#'+item]!=undefined){
          return(<ListItem key={i} value={item} primaryText={item} onTouchTap={this.handleChange.bind(this,item)} rightIcon={<Badge badgeContent={this.props.unreadCount[this.props.currentChannel.split("#")[0]+'#'+item]} primary={true}></Badge>}/>);
        }
        else{
          return(<ListItem key={i} value={item} primaryText={item} onTouchTap={this.handleChange.bind(this,item)}/>);
        }
      });

      DMListfiltered = DMListfiltered.map((item,i)=>{  //this is dm channel list.
        return(<ListItem key={"dm"+i} value={DMSelectable[i]} primaryText={item}
        onTouchTap={this.handleChange.bind(this,DMList[i])}
        rightIcon={<Badge badgeContent={this.props.unreadCount[this.state.currentProject+'#'+DMList[i]]}
        primary={true}></Badge>}/>)
      });
      console.log('ipaaa channel : ',this.props.currentChannel);
     return(
       <div style={{height:'100%',border:'solid 1px #d9d9d9'}}>
       <Grid style={{height:'100%',width:"100%"}}>
       <Paper style={{height:'100%',width:"100%"}}>
         <Row style={{width:"100%"}}>
         <Col xs={12} sm={12} md={12} lg={12} style={{height:'100%',width:"100%"}}>
         <Subheader style={{fontSize:"18px"}}>Channels<IconButton onTouchTap={this.handleAddChannel} style={{marginLeft:"136px"}}><AddCircle/></IconButton></Subheader>
         </Col>
         </Row>
         <Row style={{width:"100%"}}>
         <Col xs={12} sm={12} md={12} lg={12} style={{height:'100%'}}>
         {addDMDialog}
         {display}
         <SelectableList value={this.props.currentChannel.split("#")[1]}>
         {channelList}
         <Subheader style={{
           fontSize: "18px"
         }}>Direct Message
         </Subheader>
         <IconButton onTouchTap={this.handleAddDM.bind(this)} style={{marginLeft:"136px"}}><AddCircle/></IconButton>
         {DMListfiltered}
         </SelectableList>
         </Col>
         </Row>
       </Paper>
       </Grid>
       </div>
    );
  }
}
