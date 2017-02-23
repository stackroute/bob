import React, { Component } from 'react';
import {CardHeader,CardTitle,Card,CardText} from 'material-ui/Card';
import NotificationMessage from './NotificationMessage.jsx';

export default class TileOpen extends Component {
	constructor(props){
		super(props);

	}
	render() {
		console.log("inside tileopen,props",this.props);
		let msgList = this.props.msgList.map((message,i)=>{
			return (<NotificationMessage key ={i} message={message} userId = {this.props.userId}
										 psocket={this.props.psocket}
					/>);
		});
		return (
			<div style={{height:"100%",overflow:'auto'}}>
				{msgList}
			</div>
		);
	}
}
