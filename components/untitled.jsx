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
		this.state={historyEnded:false,
		bookitem:'',
					checkStatus:false};
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




	render() {
		//console.log("this is chatHistory channelid ",this.props.channelId);
		//console.log(this.props.chatHistory);

		let lem;
		let showbooklist;
		if(this.state.historyEnded)
			lem = null;
		else
			lem = (<FlatButton label="Load Earlier Messages" primary={true} onClick={this.getEarlierMessages.bind(this)}/>);

		let messageList = this.props.chatHistory.map((message,i)=>{
			if(this.props.username !== message.sender)
			return (<Row key={i} end="xs"><Col xs={10} sm={10} md={10} lg={10} style={{marginTop:'2vh',marginBottom:'2vh',maxWidth:'80%'}}><Card >
			<CardTitle style={cardtitle} title={message.sender} subtitle={message.TimeStamp}  />
			<CardText style={cardtext}>{message.msg}</CardText>
			<Checkbox onCheck={this.props.bookmark.bind(this,message)} checkedIcon={<ActionFavorite />}
      uncheckedIcon={<ActionFavoriteBorder />}/>
		</Card></Col></Row>);
		else
		return (<Row key={i} start="xs"><Col xs={10} sm={10} md={10} lg={10} style={{marginTop:'2vh',marginBottom:'2vh',maxWidth:'80%'}}><Card >
		<CardTitle style={cardtitle} title={message.sender} subtitle={message.TimeStamp}  />
		<CardText style={cardtext}>{message.msg}</CardText>
			<Checkbox onCheck={this.props.bookmark.bind(this,message)} checkedIcon={<ActionFavorite />}
      uncheckedIcon={<ActionFavoriteBorder />}/>
	</Card></Col></Row>);
});
return (

	<Paper style={{ height:'100%'}}>
		{lem}
		{messageList}
		<div style={ {float:"left", clear: "both"} }
    ref={(el) => { this.messagesEnd = el; }}></div>
	</Paper>

		);
	}
}