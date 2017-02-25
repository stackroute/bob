import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import {Grid, Row, Col} from 'react-flexbox-grid/lib';
import Paper from 'material-ui/Paper';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import DatePicker from 'material-ui/DatePicker';
import ajax from 'superagent';

export default class NewMessage extends Component {
	constructor(props){
		super(props);
		this.state = {
			userInput:"",
			open: false,
			open1: false,
			open2:false,
			summary:'',
		        location:'',
		        startDate:'',
		        endDate:'',
			username:'',
			eventurl:''
		};
		this.handleOpen=this.handleOpen.bind(this);
		this.handleClose=this.handleClose.bind(this);
		this.handleSubmit=this.handleSubmit.bind(this);
		this.handleOpen1=this.handleOpen1.bind(this);
		this.handleClose1=this.handleClose1.bind(this);
		this.handleSubmit1=this.handleSubmit1.bind(this);
		this.handleClose2=this.handleClose2.bind(this);
		this.handleChangeSummary=this.handleChangeSummary.bind(this);
		this.handleChangeLocation=this.handleChangeLocation.bind(this);
		this.handleChangeStartDate=this.handleChangeStartDate.bind(this);
		this.handleChangeEndDate=this.handleChangeEndDate.bind(this);
		this.handleKeyPress=this.handleKeyPress.bind(this);
		this.ajaxCall=this.ajaxCall.bind(this);
	}

	componentDidMount(){
		let that=this;
		that.props.psocket.on('confirmSetRemainder', function(result, summary, location){
			console.log("confirmSetRemainderResult: ", result);
			that.setState({open: true, summary: summary, location:location});
		});
		that.props.psocket.on('noToken', function(username, summary, location, sd, ed){
			that.setState({open1: true, username:username, summary: summary, location:location, startDate:sd, endDate:ed});
			console.log('inside 2nd dialog box : ', that.state.open1);
		});
		that.props.psocket.on('tokenRec', function(token){
			that.props.psocket.emit('storeToken', that.state.username, token);
		});
		that.props.psocket.on('eventCreated', function(link){
			console.log('event created in new message : ',link);
			that.setState({open2:true, eventurl:link});
		})
	}

	handleOpen(){
		this.setState({open: true});

	};
  handleClose(){
    this.setState({open: false});
  };

	handleSubmit(){
		this.setState({open: false});
		console.log('sd on comp : ',this.state.startDate);
		console.log('ed on comp : ',this.state.endDate);
		this.props.psocket.emit('remainderAccepted', this.props.name, this.state.summary, this.state.location, this.state.startDate, this.state.endDate);
	}

	handleOpen1(){
		this.setState({open1: true});
  };

  handleClose1(){
    this.setState({open1: false});
  };

	handleSubmit1(){
		this.setState({open1: false});
		//this.props.psocket.emit('getNewToken', this.props.name, this.state.summary, this.state.location, this.state.startDate, this.state.endDate);
	}


	handleOpen2(){
    this.setState({open2: true});
  };

	handleClose2(){
    this.setState({open2: false});
  };

	handleChangeStartDate(e,date){
		 console.log("Date is ", date);
		 this.setState({
			 startDate:date
		 })
	 }
	 handleChangeEndDate(e,date){
		 console.log("Date is ", date);
		 this.setState({
			 endDate:date
		 })
	 }
	 handleChangeSummary(e){
		 this.setState({
			 summary:e.target.value
		 })
	 }
	 handleChangeLocation(e){
		 this.setState({
			 location:e.target.value
		 })
	 }
	//  handleAddRem(){
	// 	 this.setState({open:true});
	//  }

	handleChange(e){
		this.props.psocket.emit('typing',this.props.name,this.props.channelId);	//emit the name of user typing.
		console.log("hi bro",this.props);
		this.setState({userInput:e.target.value});
	}

	handleKeyPress(event){
	if(event.key === 'Enter'){
		console.log('enter press here! ')
		if(this.state.userInput!=="")
		{this.props.psocket.emit("send message",this.props.name,this.props.channelId,this.state.userInput);
				this.setState({userInput:""});}
	}
}

	handleClick(){
		if(this.state.userInput!=="")
		{this.props.psocket.emit("send message",this.props.name,this.props.channelId,this.state.userInput);
				this.setState({userInput:""});}
	}

	render() {
		let obj = {
			username:this.state.username,
			summary:this.state.summary,
			location:this.state.location,
			startDate:this.state.startDate,
			endDate:this.state.endDate
		}
		const url='https://accounts.google.com/o/oauth2/auth?redirect_uri=http://bob.blr.stackroute.in/oauth2callback&state='+JSON.stringify(obj)+'&response_type=code&client_id=616007233163-g0rk4o8g107upgrmcuji5a8jpnbkd228.apps.googleusercontent.com&scope=https://www.googleapis.com/auth/calendar+https://www.googleapis.com/auth/userinfo.email+https://www.googleapis.com/auth/userinfo.profile&approval_prompt=force&access_type=offline';
		const eventurl=this.state.eventurl;
		const actions = [
	     <FlatButton
	       label="Close"
	       keyboardFocused={true}
	       onTouchTap={this.handleClose}
	     />,
	     <FlatButton
	       label="OK"
	       primary={true}
	       keyboardFocused={true}
	       onTouchTap={this.handleSubmit}
	     />
	   ];
		 const actions1 = [
	     <FlatButton
	       label="Close"
	       keyboardFocused={true}
	       onTouchTap={this.handleClose1}
	     />,
			 <FlatButton
			 	 href={url}
				 label="OK"
	       primary={true}
	       keyboardFocused={true}
	     />
	   ];
		 const actions2 = [
	     <FlatButton
	       label="OK"
	       keyboardFocused={true}
	       onTouchTap={this.handleClose2}
	     />
		 ];
		 if (this.state.open) {
			return (<div>
			<Dialog
				title="Do you want the BOB to set Reminder"
				actions={actions}
				modal={false}
				open={this.state.open}
				onRequestClose={this.handleClose}
			>
				Summary : <TextField hintText="Enter the summary" value={this.state.summary} onChange={this.handleChangeSummary}/><br/>
				Location : <TextField hintText="Enter the location" value={this.state.location} onChange={this.handleChangeLocation}/><br/>
				Start Date : <DatePicker hintText="Date Picker" onChange={this.handleChangeStartDate}/><br/>
				End Date : <DatePicker hintText="Date Picker" onChange={this.handleChangeEndDate}/>
			</Dialog>
		</div>);
		}
		else if (this.state.open1) {
			return (<div>
        <Dialog
          title="OOPS !!!!"
          actions={actions1}
          modal={false}
          open={this.state.open1}
          onRequestClose={this.handleClose1}
        >
         Your Google Account is not linked .
         Do you want to Link your Google Account
        </Dialog>
      </div>);
		}
		else if (this.state.open2) {
			return (<div>
        <Dialog
          title="Event Created !!!!"
          actions={actions2}
          modal={false}
          open={this.state.open2}
          onRequestClose={this.handleClose2}
        >
         {eventurl}
        </Dialog>
      </div>);
		}
		else {
			return (
					<Paper style={{marginLeft:"0px"}}>
						<Grid style={{width:"100%"}}>
							<Row style={{width:"100%"}}>
								<Col xs={11} sm={11} md={11} lg={11}>
									<TextField style={{marginLeft:"0px"}} value={this.state.userInput} hintText="Type Message"
										fullWidth={true} onKeyPress={this.handleKeyPress}
										onChange={this.handleChange.bind(this)}/>
								</Col>
								<Col xs={1} sm={1} md={1} lg={1} style={{position:'relative',right:15,top:5}} >
									<RaisedButton style={{marginLeft:"0px"}} label="SEND" primary={true} onClick={this.handleClick.bind(this)} />
								</Col>
							</Row>
						</Grid>
					</Paper>
				);
		}
	}

}
