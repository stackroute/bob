import React from 'react';
import io from 'socket.io-client';
import {Grid, Row, Col} from 'react-flexbox-grid/lib/index';
import ChatHistory from './ChatHistory.jsx';
import NewMessage from './NewMessage.jsx';
import Chip from 'material-ui/Chip';
import Paper from 'material-ui/Paper';
import SupervisorAccount from 'material-ui/svg-icons/action/supervisor-account';
import PersonAdd from 'material-ui/svg-icons/social/person-add';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import IconButton from 'material-ui/IconButton';
import RaisedButton from 'material-ui/RaisedButton';
import {BottomNavigation, BottomNavigationItem} from 'material-ui/BottomNavigation';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Popover, {PopoverAnimationVertical} from 'material-ui/Popover';
import request from 'superagent';
import Dialog from 'material-ui/Dialog';
import AutoComplete from 'material-ui/AutoComplete';
import ExitToApp from 'material-ui/svg-icons/action/exit-to-app';
import Favorite from 'material-ui/svg-icons/action/favorite';
import Drawer from 'material-ui/Drawer';
import AppBar from 'material-ui/AppBar';
import Clear from 'material-ui/svg-icons/content/clear';
import {List,ListItem} from 'material-ui/List';

const styles = {
  chip: {
    marginBottom: 4,
  }
  }

let socket;
export default class Chat extends React.Component{
	constructor(props) {
		super(props);
		this.state={typing:[],chatHistory:[],pagesDisplayed:0,next:"",searchText:"",members:[],addedMembers:[],openDrawer:false,booklist:[],addOpen:false,membersOpen:false,membersList:[]};
		socket=this.props.socket;
		this.handleShowMembers=this.handleShowMembers.bind(this);
		this.handleMembersClose=this.handleMembersClose.bind(this);
		this.handleAddMembers=this.handleAddMembers.bind(this);
	    this.handleClose=this.handleClose.bind(this);
	    this.handleUpdateInput=this.handleUpdateInput.bind(this);
	    this.handleNewRequest=this.handleNewRequest.bind(this);
	    this.handleSubmit=this.handleSubmit.bind(this);
	    this.handleLeave=this.handleLeave.bind(this);
            this.handleSelect=this.handleSelect.bind(this);

	}
	
	componentDidMount() {	

		socket.on('someoneAdded',(name)=>{ //Sent when a user subscribes to the channel.
			this.handleSomeoneAdded(name);
		});
		
		socket.on('takeMessage',(channelID,msg)=>{ //Sent from socket server when a message is published in the redis channel.
			this.handleTakeMessage(channelID,msg);
		});

		socket.on('chatHistory',(msg,next)=>{ //msg is an array of objects having messages from a page in mongodb. 
			this.handleChatHistory(msg,next);
			});
		// socket.on('typing',(name)=>{ 
		// 		this.handleTyping(name);
		// 	});
		socket.on('pempty',(msg)=>{
			this.handlePempty(msg);
		});

		socket.on("takeMembersList",(membersList)=>{
			this.setState({members:membersList,membersOpen:true});
		})
		socket.on("receiveBoomarkHistory",(receiveBoomarkHistory)=>{
			let a=this.props.channelID;
			console.log(receiveBoomarkHistory[0].bookmark);
			//console.log("Received BookMark History",receiveBoomarkHistory[0].bookmark[this.props.channelID][0]);
			this.setState({booklist:receiveBoomarkHistory[0].bookmark});
		});

		socket.emit('bookmarkHistory',this.props.userName,this.props.channelID);
		
	}

	componentWillReceiveProps(nextProps){
		//console.log(nextProps,this.props,"cwp chatarea outisde if");
		if(this.props.channelID!=nextProps.channelID){
			console.log(nextProps,this.props,"cwp chatarea inside if");
			let msg = {"pageNo":"initial_primary","channelName":nextProps.channelID};//increment the pages displayed currently.
			nextProps.socket.emit('receiveChatHistory',msg);
			this.setState({chatHistory:[]});
			
		}
	}

	handleSomeoneAdded(msg){
		//currently empty. 
	}

	handleTakeMessage(channelId,msg){
		//console.log("channel name: ",channelId,"message: ",msg);
		if(channelId===this.props.channelID){

			if(msg.hasOwnProperty('typer')){
				this.handleTyping(msg.typer);
			}

			else 
			{
				//console.log(msg);
				msg = this.handleTime(msg);
				this.setState((prevState,props)=>{ 
						prevState.chatHistory.push(msg); 
						return {chatHistory:prevState.chatHistory};
				});
			}
		}
		else{
			if(msg.hasOwnProperty('typer')){
			}
			else
			{this.props.LiveUnreadCount(channelId);}
		}
	}
	handleChatHistory(msg,next){
		//console.log(msg);
		let mess = this.state.chatHistory;
		msg.forEach((msgob)=>{

			msgob = this.handleTime(msgob);
			mess.unshift(msgob); 
		});
		this.setState((prevState,props)=>{ return {chatHistory:mess,pagesDisplayed:prevState.pagesDisplayed+1,next:next};});
	}
	 handleToggle(){this.setState({openDrawer: !this.state.openDrawer});};
	handleTime(msg){
		let date=[];
         date[0]= new Date(msg.TimeStamp).getHours();
         date[1]= new Date(msg.TimeStamp).getMinutes();
         if(date[0]>12){
             date[2] = "PM";
             date[0] = date[0] -12;
         }
         else{
             date[2] = "AM";
         }
         date = date[0]+":"+date[1]+" "+date[2];
	//console.log(new Date().getHours(),date,"=======================");
         msg.TimeStamp = date;
        return msg;
    }
	handleTyping(name){
		if(!this.state.typing.includes(name))
		{
			this.setState((prevState,props)=>{prevState.typing.push(name); return {typing:prevState.typing};  });
		 	setTimeout(()=>{this.setState((prevState,props)=>{prevState.typing.shift(); return {typing:prevState.typing};  });},1000);
		} //show user is typing for 1000 milliseconds.
	}

	handlePempty(msg){
		let msg1 = {
			"pageNo":msg,
			"channelName":this.props.channelId
		};
		socket.emit('receiveChatHistory',msg1);
	}

	handleShowMembers(event){
		this.setState({ anchorEl: event.currentTarget});
		socket.emit("getMembersList",this.props.channelID);
	}

	handleMembersClose(){
		this.setState({membersOpen:false});
	}

	handleAddMembers(){
		let a=this.props.channelID.split("#");
		request.get("http://bob.blr.stackroute.in/add/"+a[0]+"/channel/"+a[1]).end((err,res)=>{
			res=JSON.parse(res.text);
			this.setState({membersList:res.data,addOpen:true});	
				})
	}


	handleUpdateInput(searchText){
	    this.setState({
	      searchText: searchText,
	    });
	  };

	handleClose(){
		this.setState({addOpen:false})
	}

	handleNewRequest(){
		this.state.addedMembers.push(this.state.searchText);
		var a=this.state.searchText;
		var b=this.state.membersList;
		var c=b.indexOf(a);
		b.splice(c,1);
		this.setState({membersList:b,searchText:""})
	}

	handleRequestDelete(item){
		var a=this.state.addedMembers;
		var b=a.indexOf(item);
		a.splice(b,1);

		this.setState({addedMembers:a});
		this.state.membersList.push(item);
	}

	handleSubmit(){
		socket.emit("addMembers",this.props.channelID,this.state.addedMembers);
		this.setState({addOpen:false});
	}

	handleLeave(){
		socket.emit("leaveGroup",this.props.channelID,this.props.userName);
	}
	handleSelect(book,event,status)
  {
 		 //this.setState({bookitem:event.target.value});

 			 console.log(book,"=======",status);
 		 if(status)
 			 {
 		 console.log("Boooooooooooooooook Iiiiiiiiiiiiiitem     ",this.state.booklist);
 		 this.state.booklist.push(book);
 		 socket.emit('saveBookmarks',book,this.props.userName,this.props.channelID,);
 		 console.log(this.state.booklist);

 			 }
 			 else
 			 {
 				 var indexno=this.state.booklist.indexOf(book);
 				 console.log("false parttt", indexno);
 				 this.state.booklist.splice(indexno,1);
 				 socket.emit('deleteBookmarks',book,this.props.userName,this.props.channelID);
 				 console.log(this.state.booklist);

 			 }
 			//socket.emit('bookmarks',this.state.booklist);

 	 }

	render(){
		console.log(this.state.members,"Inside Chat");
		let typ;
		if(this.state.typing.length===1){
			typ = <Chip>{this.state.typing + " is typing"}</Chip>;

		}
		else if(this.state.typing.length>1 && this.state.typing.length<6)
			typ = <Chip>{this.state.typing + " are typing"}</Chip>;
		else if(this.state.typing.length>1)
			{
				typ = <Chip>{this.state.typing.slice(0,5) + " and others are typing"}</Chip>
				
			}
		else
			{
				typ = null;
			}

  const actions = <RaisedButton label="Add" primary={true} onTouchTap={this.handleSubmit}/>
  let display=  <Dialog title="AddMembers" actions={actions} modal={false} open={this.state.addOpen} onRequestClose={this.handleClose}>
  				  <AutoComplete style={{marginTop:"20px",marginBottom:"20px"}} hintText="Add" searchText={this.state.searchText}  maxSearchResults={5} onUpdateInput={this.handleUpdateInput} onNewRequest={this.handleNewRequest} dataSource={this.state.membersList} filter={(searchText, key) => (key.indexOf(searchText) !== -1)} openOnFocus={true} /><br/>
               {this.state.addedMembers.map((item,i)=>{
                 return(<Chip key={i} onRequestDelete={this.handleRequestDelete.bind(this,item)} style={styles.chip}>{item}</Chip>)
               })}
  				</Dialog>
  				let leave=null;
   if(this.props.channelID.split("#")[1]!="general"){
  	leave=<IconButton ><ExitToApp onTouchTap={this.handleLeave}/></IconButton>
  }
return(
			<center style={{height:"100%",width:"100%"}}>
				<Paper style={{height:"100%",width:"100%",border: 'solid 1px #d9d9d9'}}>
						<Grid  style={{height:'100%', width:"100%"}}>
						<Row style={{ height:'8%',overflow:'hidden',width:"100%",margin:"0px"}}>
								<Col xs={12} sm={12} md={12} lg={12} style={{height:'100%'}}>
			<Paper zDepth={0}>
   <IconMenu open={this.state.membersOpen}
           onTouchTap={this.handleShowMembers}
   		  iconButtonElement={<IconButton><SupervisorAccount/></IconButton>}
          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          onRequestChange={this.handleMembersClose}
        >
   {this.state.members.map((item,i)=>{
   		return(<MenuItem key={i} primaryText={item}/>)
   })}
  </IconMenu>
   <IconMenu iconButtonElement={<IconButton onTouchTap={this.handleAddMembers}><PersonAdd /></IconButton>} >
  </IconMenu>
				<IconButton onTouchTap={this.handleToggle.bind(this)}>
				<Favorite />
				</IconButton>
  {leave}
      </Paper>
									<Drawer width={400} openSecondary={true} open={this.state.openDrawer} >
			 <AppBar style={{background:"#3F51B5"}} title="Bookmarks"><IconButton iconStyle={{color:"white"}} onTouchTap={this.handleToggle.bind(this)}><Clear/> </IconButton></AppBar>
				 <List>
		 {this.state.booklist.map((item,i)=>{
			 return(<ListItem key={i}><Paper>{item.TimeStamp}<br/>{item.msg}<br/>{item.sender}</Paper></ListItem>)
		 })
		 }
	 </List>
			 </Drawer>
      	{display}
					</Col>
							</Row>
							<Row style={{ height:'4%',overflow:'hidden',width:"100%"}}>
								<Col xs={12} sm={12} md={12} lg={12} style={{height:'100%'}}>
						{typ}
					</Col>
							</Row>
							<Row style={{height:'78%',overflowY:'auto',width:"100%"}}>
								<Col xs={12} sm={12} md={12} lg={12}>
									<ChatHistory avatars={this.props.avatars} channelId={this.props.channelID} psocket={socket} next={this.state.next} bookmark={this.handleSelect} username={this.props.userName} chatHistory={this.state.chatHistory}/>
								</Col>
							</Row>
							<Row bottom="lg" style={{height:"10%",width:'100%'}}>
								<Col xs={12} sm={12} md={12} lg={12}>
									<NewMessage channelId={this.props.channelID} psocket={socket} name={this.props.userName}/>
								</Col>
							</Row>
						</Grid>
					</Paper>
				</center>
			);
		}
	}
