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
let socket;
export default class Chat extends React.Component{
	constructor(props) {
		super(props);
		this.state={typing:[],chatHistory:[],pagesDisplayed:0,next:"",members:[],membersOpen:false};
		socket=this.props.socket;
		this.handleShowMembers=this.handleShowMembers.bind(this);
		this.handleRequestClose=this.handleRequestClose.bind(this);
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

	handleRequestClose(){
		this.setState({membersOpen:false});
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
		return(
			<center style={{height:"100%",width:"100%"}}>
				<Paper style={{height:"100%",width:"100%",border: 'solid 1px #d9d9d9'}}>
						<Grid  style={{height:'100%', width:"100%"}}>
						<Row style={{ height:'8%',overflow:'hidden',width:"100%",margin:"0px"}}>
								<Col xs={12} sm={12} md={12} lg={12} style={{height:'100%'}}>
			<Paper zDepth={1}>
			<RaisedButton onTouchTap={this.handleShowMembers} label="Members" icon={<SupervisorAccount />}/>
   <Popover open={this.state.membersOpen}
   			anchorEl={this.state.anchorEl}
          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          onRequestClose={this.handleRequestClose}
          animation={PopoverAnimationVertical}
        >
   {this.state.members.map((item,i)=>{
   		return(<MenuItem key={i} primaryText={item}/>)
   })}
  </Popover>
   <IconMenu iconButtonElement={<IconButton tooltip="Add Members"><PersonAdd /></IconButton>} >
  </IconMenu>
      </Paper>
					</Col>
							</Row>
							<Row style={{ height:'4%',overflow:'hidden',width:"100%"}}>
								<Col xs={12} sm={12} md={12} lg={12} style={{height:'100%'}}>
						{typ}
					</Col>
							</Row>
							<Row style={{height:'78%',overflowY:'auto',width:"100%"}}>
								<Col xs={12} sm={12} md={12} lg={12}>
									<ChatHistory channelId={this.props.channelID} psocket={socket} next={this.state.next} username={this.props.userName} chatHistory={this.state.chatHistory}/>
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
