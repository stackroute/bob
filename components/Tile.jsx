import {Card,CardHeader,CardText,CardMedia} from 'material-ui/Card';
import AutoComplete from 'material-ui/AutoComplete';
import Badge from 'material-ui/Badge';
import CircularProgress from 'material-ui/CircularProgress';
import Chip from 'material-ui/Chip';
import Dialog from 'material-ui/Dialog';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import IconButton from 'material-ui/IconButton';
import RaisedButton from 'material-ui/RaisedButton';
import React from 'react';
import TextField from 'material-ui/TextField';
import Paper from 'material-ui/Paper';
import {Grid, Row, Col} from 'react-flexbox-grid/lib/index';

import ClearAll from 'material-ui/svg-icons/communication/clear-all'
import ContentAdd from 'material-ui/svg-icons/content/add';
import DeleteIcon from 'material-ui/svg-icons/action/delete-forever';
import NotificationsIcon from 'material-ui/svg-icons/social/notifications';
import SettingsIcon from 'material-ui/svg-icons/action/settings';
import ViewStream from 'material-ui/svg-icons/action/view-stream';

import {autoPlay} from 'react-swipeable-views-utils';
import CurrentFilter from './Currentfilter.jsx';
import request from 'superagent';
import SwipeableViews from 'react-swipeable-views';

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

export default class Tile extends React.Component{

	constructor(props){
		super(props);
		this.state={
			msgList:[],
			dialogOpen:false,
			channels:[],
			projects:[],
			filters:{},
			filteredChannels:[],
			pOkay:false,
			cOkay:false,
			tOkay:false,
			Okay:false,
			filterInputs:{
				projectInput:"",
				channelInput:"",
				tagInput:""
			},
			stop:false,
		}
	}

	componentWillMount(){  //get the initial set of messages from server.
		let that = this;
		request
			.get('http://bob.blr.stackroute.in/user/'+this.props.userId+'/Tiles/'+this.props.tileId+"/Messages")
            .end(function(err,res){
                console.log("this is response from server\n\n ",res,"\n\n");
                let parsed_res = JSON.parse(res.text);
                console.log("this is parsed res",parsed_res);
                if(parsed_res.result)
                	that.setState({msgList : parsed_res.data});
            });
	}

	componentDidMount(){ //after mounting, get the tile info for this tile
		let that = this;
		request
			.get('http://bob.blr.stackroute.in/user/'+this.props.userId+'/Tiles/'+this.props.tileId)
			.end(function(err,reply){
				reply = JSON.parse(reply.text);
				if(!reply.result)
					console.log("No tile found for this user");
				else{
					let data = reply.data;
					that.setState({
						filters:reply.data
					});
				}
			});
			console.log(this.props);
			this.props.psocket.on('takeMessage',(channelID,msg)=>{ //Sent from socket server when a message is published in the redis channel.
				console.log("this is inside handler");
			this.handleTakeMessage(channelID,msg);
		});

	}

	handleTakeMessage(channelId,msg){  //handle an incoming message from redis channel
		console.log("channel name: ",channelId,"message: ",msg);
		if(this.state.filters.channels.includes(channelId)){
			if(msg.hasOwnProperty('typer')||msg.sender===this.props.userId){

			}
			else
			{
				msg = this.handleTime(msg);
				msg.channelId = channelId;
				this.setState((prevState,props)=>{
						prevState.msgList.push(msg);
						return {msgList:prevState.msgList};
				});
			}
		}

	}

	handleEdit(){ //get data for configuring tile and opne tile
		let that = this;
		request

			.get('http://bob.blr.stackroute.in/user/'+this.props.userId+'/channels') //get the channles user is part of

			.end(function(err,reply){
				reply = JSON.parse(reply.text);
				if(!reply.result)
					console.log("No channels found for this user");
				else{
					let projects = reply.data;
					projects = projects.map((item,i)=>{
						return item.split('#')[0];
					});
					projects = projects.filter((element,index)=>{
						return projects.indexOf(element) == index;
					});
					console.log("channels: ",reply.data+" projects: ",projects);
					that.setState({
						channels:reply.data,projects:projects   //keep project names in project and channels in channel.
					});
				}
			});

		request

			.get('http://bob.blr.stackroute.in/user/'+this.props.userId+'/Tiles/'+this.props.tileId) //get the tileconfig data
			.end(function(err,reply){
				reply = JSON.parse(reply.text);
				if(!reply.result)
					console.log("No tile found for this user");
				else{
					let data = reply.data;
					that.setState({
						filters:reply.data
					});
				}
			});
		console.log("clicked settings button");
		this.setState({dialogOpen:true});
	}

	handleClose(){  //closing the configure tile dialog
		this.setState({dialogOpen:false,pOkay:false,cOkay:false,Okay:false});
	}

	handleRequestDelete(category,filter){ //delete the filter parameters
  		if(category === "tags"){
     		this.setState((prevState,props)=>{
	    		let index = prevState.filters.tags.indexOf(filter);
 			   	if(index>-1)
        			prevState.filters.tags.splice(index,1);
       			return {filters:prevState.filters};
     		});
   		}
   		else if(category === "channel"){
     		this.setState((prevState,props)=>{
       			let index = prevState.filters.channels.indexOf(filter);
       			if(index >-1)
         			prevState.filters.channels.splice(index,1);
       			return {filters:prevState.filters};
     		});
   		}
   		else{
   			//currently empty
   		}
 	}

	computeChannels(){ //compute the channels for the selected project in configure tile.
		console.log("happeining");
		let data=[];
		data = this.state.channels.filter((item,index)=>{
			return item.split('#')[0]===this.state.filterInputs.projectInput;
		});
		data = data.map((item,index)=>{
			return '#'+item.split('#')[1];
		});
		this.setState({filteredChannels:data});
	}

	handleTagInput(event){  //handle the data from tag input field
		event.persist();
		let data = event.target.value;
		let status;
		if(data.includes(' ')&&data.length==0)
			status = false;
		else
			status = true;
		this.setState({tOkay:status});
		this.setState((prevState,props)=>{
			prevState.filterInputs.tagInput = event.target.value;
			if(prevState.pOkay&&prevState.cOkay&&prevState.tOkay)
				return {filterInputs:prevState.filterInputs,Okay:true};
			else
				return {filterInputs:prevState.filterInputs,Okay:false};
		});
	}

	handleProjectInput(value){ //handle project input field. set bools for validation
		console.log("project");
		let status;
		if(this.state.projects.includes(value))
			status = true;
		else
			status = false;
		this.setState((prevState,props)=>{
			prevState.filterInputs.projectInput =value;
			return {filterInputs:prevState.filterInputs,pOkay:status};
		});
		this.setState((prevState,props)=>{
			if(prevState.pOkay&&prevState.cOkay)
				return {Okay:true};
			else
				return {Okay:false};
		});
	}

	handleChannelInput(value){  //handle channel input field. set bools for validation.
		console.log("channel");
		let status;
		if(this.state.filters.channels.includes(this.state.filterInputs.projectInput+value))
			status = true;
		else
			status = false;
		this.setState((prevState,props)=>{
			prevState.filterInputs.channelInput =value;
			return {filterInputs:prevState.filterInputs,cOkay:status};
		});
		this.setState((prevState,props)=>{
			if(prevState.pOkay&&prevState.cOkay)
				return {Okay:true};
			else
				return {Okay:false};
		});
	}

	handleAdd(){    //add the filter selected and reset the input fields and but dont close dialog.
		this.setState((prevState,props)=>{
			let channel = prevState.filterInputs.projectInput+prevState.filterInputs.channelInput;
			prevState.filters.channels.push(channel);
			prevState.filters.tags.push(prevState.filterInputs.tagInput);
				return {
						filters:prevState.filters,
						filterInputs:
							{
								projectInput:"",
								channelInput:"",
								tagInput:""
							},
						pOkay:false,
						cOkay:false,
						tOkay:false,
						Okay:false
				};
		});
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

	handleSave(){  //save the selected filters to server.
		request
			.patch('http://bob.blr.stackroute.in/user/'+this.props.userId+'/Tiles/'+this.props.tileId)
			.send(this.state.filters)
			.end(function(err,res){
					console.log("result of save ",res.text);

			});
		this.handleClose.bind(this)();
	}




	handleClear(){  //clear the tile notifications.
		this.setState({msgList:[]});
		request
			.patch('http://bob.blr.stackroute.in/user/'+this.props.userId+'/Tiles/'+this.props.tileId)
			.send({lastCleared:new Date()})
			.end(function(err,res){
					console.log("result of save ",res.text);

			});
	}

	handleViewAllWrapper(){
		this.props.handleViewAll(this.state.msgList);
	}

	render(){


		//below dialog is the configuration tile dialog.
		let dialog= (<div><Dialog open={this.state.dialogOpen} onRequestClose={this.handleClose.bind(this)}
						title="Change Tile Settings"
					>
						<AutoComplete hintText="Enter the project" onUpdateInput={this.handleProjectInput.bind(this)}
							value ={this.state.filterInputs.projectInput} errorText="Enter a project that you are part of."
							onBlur={this.computeChannels.bind(this)} dataSource={this.state.projects}
						/>
						<AutoComplete hintText="Enter the channel" onUpdateInput={this.handleChannelInput.bind(this)}
							value ={this.state.filterInputs.channelInput} errorText="Enter a channel that you are part of."
							dataSource={this.state.filteredChannels}
						/>
						<TextField value={this.state.filterInputs.tagInput} hintText="Enter the tags"
							onChange={this.handleTagInput.bind(this)}
						/>
						<RaisedButton disabled= {!this.state.Okay} label="ADD" primary={true}
							onClick={this.handleAdd.bind(this)}
						/>
						<RaisedButton  label="SAVE" primary={true}
							onClick={this.handleSave.bind(this)}
						/>
						<CurrentFilter filters={this.state.filters}
  							handleRequestDelete={this.handleRequestDelete.bind(this)}
  						/>
					</Dialog>
					</div>
					);

		let notification_badge; //the notification icon with badge.

		if(this.state.msgList.length>0)
		    notification_badge= (<div><IconButton tooltip="Notifications"  tooltipPosition="bottom-right"><Badge
		               				badgeContent={this.state.msgList.length}
		               				primary={true}
		               			>
		               				<NotificationsIcon />
		               			</Badge>
												</IconButton>
		               			</div>
		               			);
		else
		    notification_badge = (
		               				null
		               			);

		let pop;   //this is onmouseenter to show icons on tiles.
		if(this.state.stop)
			pop = (<div>
				<Grid  style={{ width:"100%"}}>
			<Row style={{width:"100%"}}>
					<Col xs={3} sm={3} md={3} lg={3} style={{height:'100%'}}>
						<IconButton tooltip="Settings"  onClick={this.handleEdit.bind(this)} >
		                    	<SettingsIcon  />
		                    </IconButton>
											</Col>
											<Col xs={3} sm={3} md={3} lg={3} style={{height:'100%'}}>
		                    <IconButton tooltip="Delete Forever" onClick={this.props.handleDelete}>
		                		<DeleteIcon />
		               		</IconButton>
										</Col>
											<Col xs={3} sm={3} md={3} lg={3} style={{height:'100%'}}>
		               		   <IconButton tooltip="Clear Notifications" onClick={this.handleClear.bind(this)}>
		                		<ClearAll />
		               		</IconButton>
										</Col>
											<Col xs={3} sm={3} md={3} lg={3} style={{height:'100%'}}>
		               		<IconButton tooltip="View all" onClick={this.handleViewAllWrapper.bind(this)}>
		                		<ViewStream />
		               		</IconButton>
										</Col>
									</Row>
									</Grid>
		               		{notification_badge}
		           </div>
			);
		else
			pop = null;

		if(this.state.msgList.length===0){
			return (<div onMouseEnter={()=>{this.setState({stop:true});}}
						onMouseLeave={()=>{this.setState({stop:false});}}>
						{dialog}
						<Paper style={{width:'96%',}} zDepth={3} >
						<Card style={{background:'#ff9800',margin: 0}}>
		                	<CardText style={{background:'#e3f2fd',height: 60}}>
		                		"No Notifications to Display"
		                	</CardText>
		                 	<CardMedia overlayContentStyle={{background:'#e3f2fd'}} style={{position:'relative',marginTop:0}} overlay={pop} >
		                 	</CardMedia>
		                </Card>
										</Paper>
		            </div>);
		}
		else{
			return (<div >
						{dialog}
						<AutoPlaySwipeableViews autoplay={!this.state.stop}
						 onMouseEnter={()=>{this.setState({stop:true});}}
						 onMouseLeave={()=>{this.setState({stop:false});}}>
		                {
		                	this.state.msgList.map((details, i) => {
		                		return (
		                			    <div key={i} tyle={{width:'100%'}}	containerStyle={{tableLayout:'fixed',wordWrap:'break-word'}}>
																<Paper style={{width:'98%',overflow:'hidden'}} zDepth={5} >
		                			      <Card style={{background:'#ff9800',margin: 0}}>

		               				        <CardHeader style={{background:'#ff9800',fontWeight:600}} titleStyle={{tableLayout:'fixed',wordWrap:'break-word'}} title={details.channelId.split("#")[0]+"/"
		               				        	+details.channelId.split("#")[1]+"/"
		               					        +details.sender}  subtitle = {details.TimeStamp}
		               					    >
		               				        </CardHeader>
		               				        <CardText style={{background:'#e3f2fd',height:140,tableLayout:'fixed',wordWrap:'break-word'}}>
		               				        	{details.msg}
		               				        </CardText>
		               				        <CardMedia style={{position:'relative',marginTop:0}} overlayContentStyle={{background:'#e3f2fd'}} overlay={pop} >
		               				        </CardMedia>
		                				</Card>
														</Paper>
		                				</div>);
		                	})
		                }
		                </AutoPlaySwipeableViews>
		            </div>
		    );
		}
	}

}
