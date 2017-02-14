import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import {Grid, Row, Col} from 'react-flexbox-grid/lib';

export default class NewMessage extends Component {
	constructor(props){
		super(props);
		this.state = {
			userInput:""
		};
	}

	handleChange(e){
		this.props.psocket.emit('typing',this.props.name,this.props.channelId);	//emit the name of user typing.
		console.log("hi bro",this.props);

		this.setState({userInput:e.target.value});
	}
	handleClick(){
		if(this.state.userInput!=="")
		{this.props.psocket.emit("send message",this.props.name,this.props.channelId,this.state.userInput);
				this.setState({userInput:""});}
	}
	
	render() {
		return (
				<div style={{width:"100%"}}>
					<Grid style={{width:"100%"}}>
						<Row style={{width:"100%"}}>
							<Col xs={11} sm={11} md={11} lg={11}>
								<TextField value={this.state.userInput} hintText="Type Message"
									fullWidth={true} multiLine={true} rowsMax={2}
									onChange={this.handleChange.bind(this)}/>
							</Col>
							<Col xs={1} sm={1} md={1} lg={1} style={{position:'relative',right:15,top:5}} >
								<RaisedButton label="SEND" primary={true} onClick={this.handleClick.bind(this)} />
							</Col>
						</Row>
					</Grid>
				</div>
			);
	}
	
}

