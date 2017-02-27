import React, { Component } from 'react';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import {Grid, Row, Col} from 'react-flexbox-grid/lib/index';
import FlatButton from 'material-ui/FlatButton';
import Paper from 'material-ui/Paper';
import ReactDOM from 'react-dom';
import Checkbox from 'material-ui/Checkbox';
import ActionFavorite from 'material-ui/svg-icons/action/favorite';
import ActionFavoriteBorder from 'material-ui/svg-icons/action/favorite-border';
import Bookmark from 'material-ui/svg-icons/action/bookmark';
import IconButton from 'material-ui/IconButton';
import Dialog from 'material-ui/Dialog';
import {List, ListItem} from 'material-ui/List';
import RaisedButton from 'material-ui/RaisedButton';
import ContentInbox from 'material-ui/svg-icons/content/inbox';
import Subheader from 'material-ui/Subheader';
import Avatar from 'material-ui/Avatar';
import Tasks from './Tasks.jsx';
import Linkify from 'react-linkify';
const cardtitle={
	padding: '5px',
	fontSize: '9px'
}

const cardtext={
	padding: '5px',
	tableLayout: 'fixed',
	wordWrap:'break-word'

}

export default class ChatHistory extends Component {
	constructor(props){
		super(props);
		this.state={
		historyEnded:false,
		bookitem:'',
	    checkStatus:false,
	    task:[],
	    response:'',
		sn:false,
	};
		this.addTask = this.addTask.bind(this);
		this.handleOpen=this.handleOpen.bind(this);
		this.handleClose=this.handleClose.bind(this);
	}



scrollToBottom() {
    const node = ReactDOM.findDOMNode(this.messagesEnd);
    node.scrollIntoView({behavior: "smooth"});
}


	componentDidMount(){
		this.scrollToBottom();

		this.props.psocket.on("receiveBoomarkHistory",(receiveBoomarkHistory)=>{
				this.setState({booklist:receiveBoomarkHistory});
			});
		this.props.psocket.on('historyEmpty',(msg)=>{
				this.handleHistoryEmpty(msg);
			});

		let msg = {"pageNo":"initial_primary","channelName":this.props.channelId};//increment the pages displayed currently.
		//console.log("this is client sending request    ",msg);
		//console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nthis is mounted\n\n\n\n\n\n\n\n\n\n\n\n\n");
		this.props.psocket.emit('receiveChatHistory',msg);
		this.props.psocket.on('confirmStickyTasks', (task)=>{
			this.setState({task:task, sn:true});
		});
	}
    componentDidUpdate(){
        this.scrollToBottom();
    }

	handleHistoryEmpty(msg){
		this.setState({historyEnded:true});
	}

	getEarlierMessages(){
		let msg = {"pageNo":(this.props.next),"channelName":this.props.channelId};
		//console.log(msg);
		this.props.psocket.emit('receiveChatHistory',msg);
	}

	// Task functionality START ---------->
	addTask(val){
    var lists = this.state.task;
    var obj = {task:val,checked:false}
    lists.push(obj);
    this.setState({task:lists});
  }
  handleChecked(i){
    var lists = this.state.task;
    var obj = lists[i];
    obj.checked = !obj.checked;
    console.log(obj);
    lists.splice(i,1,obj);
    this.setState({task: lists})
  }
	handleTaskDelete(i){
		var list = this.state.task;
		list.splice(i,1);
		this.setState({task: list});
	}

	handleOpen(){
		this.setState({sn: true});

	};
  handleClose(){
		this.props.psocket.emit('taskArray', this.props.channelId, this.state.task);
    this.setState({sn: false, task:[]});
		console.log('task state emit socket -----> ', this.state.task);
  };
	// Task functionality END ---------->


	render() {
		console.log(this.props,"ChatHistory");
		const actions = [
			<FlatButton
				label="OK"
				keyboardFocused={true}
				onTouchTap={this.handleClose}
			/>
		];
		let lem;
		let showbooklist;
		let messageList;
		if(this.state.historyEnded)
			lem = null;
		else
			lem = (<FlatButton label="Load Earlier Messages" primary={true} onClick={this.getEarlierMessages.bind(this)}/>);


		//messageList ---------->
		if(this.props.gitStatus==true){
			//console.log("This is a git Channel inside chatHistory",this.props.chatHistory);
			messageList = this.props.chatHistory.map((message,i)=>{
				return (<Row key={i} start="xs"><Col xs={10} sm={10} md={10} lg={10} style={{marginTop:"2px",marginBottom:"2px"}}>
				<Card>
				<CardHeader title={message.author_name} subtitle={message.timestamp}/>
				<CardText style={cardtext} subtitle={<Checkbox onCheck={this.props.bookmark.bind(this,message)} checkedIcon={<ActionFavorite />}
        uncheckedIcon={<ActionFavoriteBorder />}/>}>{message.msg}
  		</CardText>
				<CardMedia style={{position:'relative',marginTop:0,marginLeft:'90%'}} overlayContentStyle={{background:'#ffffff'}} overlay={<Checkbox onCheck={this.props.bookmark.bind(this,message)} checkedIcon={<ActionFavorite />}
					 uncheckedIcon={<ActionFavoriteBorder />}/>} >
				</CardMedia>
				</Card>
				</Col></Row>);
			});
		}
      else{
			if(this.state.historyEnded)
			lem = null;
			else
			lem = (<FlatButton label="Load Earlier Messages" primary={true} onClick={this.getEarlierMessages.bind(this)}/>);

			messageList = this.props.chatHistory.map((message,i)=>{
				if(this.state.sn){
					return(
						<Dialog
							key={i}
							title="Tasks"
							actions={actions}
							modal={false}
							open={this.state.sn}
							onRequestClose={this.handleClose}
						>
								<Tasks handleChecked={this.handleChecked.bind(this)} handleTaskDelete={this.handleTaskDelete.bind(this)} task={this.state.task} addTask={this.addTask}/>
						</Dialog>
					);
				}else{
					return (<Row key={i} start="xs"><Col xs={10} sm={10} md={10} lg={10} style={{marginTop:"2px",marginBottom:"2px"}}>
					<Card>
					<CardHeader title={message.sender} subtitle={message.TimeStamp} avatar={this.props.avatars[message.sender]} openIcon={<ActionFavorite />}/>

					<CardText title={message.msg} subtitle={<Checkbox onCheck={this.props.bookmark.bind(this,message)} checkedIcon={<ActionFavorite />}
					uncheckedIcon={<ActionFavoriteBorder />}/>}>{message.msg}
					</CardText>
					<CardMedia style={{position:'relative',marginTop:0,marginLeft:'90%'}} overlayContentStyle={{background:'#ffffff'}} overlay={<Checkbox onCheck={this.props.bookmark.bind(this,message)} checkedIcon={<ActionFavorite />}
					uncheckedIcon={<ActionFavoriteBorder />}/>} >
					</CardMedia>
					</Card>
					</Col></Row>);
				}
			});
		}

return (

	<div style={{ height:'100%'}}>
		{lem}
		<linkify>{messageList}</linkify>
		<div style={ {float:"left", clear: "both"} }
    ref={(el) => { this.messagesEnd = el; }}></div>
	</div>

		);
	}
}
