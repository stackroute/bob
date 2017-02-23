import {Card,CardHeader,CardText,CardMedia} from 'material-ui/Card';
import Dialog from 'material-ui/Dialog';
import IconButton from 'material-ui/IconButton';
import RaisedButton from 'material-ui/RaisedButton';
import React, { Component } from 'react';
import Reply from 'material-ui/svg-icons/content/reply';

import Formsy from 'formsy-react';
import {FormsyText} from 'formsy-material-ui/lib';

export default class NotificationMessage extends Component {
	constructor(props){
		super(props);
		this.state={
			entered:false,
			open:false,
			userInput:""
		}
	}

	handleOpen(){
    	this.setState({open: true});
  	}

  	handleClose(){
    	this.setState({open: false});
  	}

  	handleChange(e){	
		this.setState({userInput:e.target.value});
	}

  	handleClick(){
		if(this.state.userInput!=="")
		{this.props.psocket.emit("send message",this.props.userId,this.props.message.channelId,
								this.props.message.msg+"\n"+this.props.userId+" \nReplied:\n "+this.state.userInput);
				this.setState({userInput:"",open:false});}
	}

	render() {
		let pop;
		if(this.state.entered)
			pop = (<div>
						<IconButton tooltip="Reply"  onClick={this.handleOpen.bind(this)} >
		                    	<Reply />
		                </IconButton> 
		           </div>
					);
		else
			pop = null;
	
		let dialog =  (<Dialog
          			title={this.props.message.sender}
          			open={this.state.open}
          			onRequestClose={this.handleClose.bind(this)}
        			>
    	    			<Card >
							
								<CardHeader title={this.props.message.channelId.split("#")[0]+"/"
		                					+this.props.message.channelId.split("#")[1]+"/"
		            	    				+this.props.message.sender}
		            	    				subtitle = {this.props.message.TimeStamp}
		        	        	>  
		    	            	</CardHeader>
		    	            	
			                	<CardText>
		                			{this.props.message.msg}
		                		</CardText>
		                		<CardMedia overlay={pop} >
		                		</CardMedia>
							
						</Card>

        				<Formsy.Form>
							<FormsyText name="textInput" style={{marginLeft:"0px"}} value={this.state.userInput} hintText="Type Message"
										fullWidth={true} multiLine={true} rowsMax={2}
										onChange={this.handleChange.bind(this)}
							/>
						</Formsy.Form>
						<RaisedButton label="SEND" primary={true} onClick={this.handleClick.bind(this)} />
        			</Dialog>);


		return (
			<div>
			{dialog}
			<div
			 	onMouseEnter={()=>{this.setState({entered:true});}} 
				onMouseLeave={()=>{this.setState({entered:false});}}
			>
				<Card >
					
						<CardHeader title={this.props.message.channelId.split("#")[0]+"/"
		                				        	+this.props.message.channelId.split("#")[1]+"/"
		                					        +this.props.message.sender}  subtitle = {this.props.message.TimeStamp}
		                >  
		                	</CardHeader>
		                	<CardText>
		                	{this.props.message.msg}
		                </CardText>
		                <CardMedia overlay={pop} >
					</CardMedia>
				</Card>
			</div>
			</div>
		);
	}
}
