import React from 'react';
import {Card,CardHeader,CardText} from 'material-ui/Card';
import Chip from 'material-ui/Chip';
import request from 'superagent';
import SwipeableViews from 'react-swipeable-views';
import {autoPlay} from 'react-swipeable-views-utils';
import SettingsIcon from 'material-ui/svg-icons/action/settings';
import IconButton from 'material-ui/IconButton';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import CircularProgress from 'material-ui/CircularProgress';
import Dialog from 'material-ui/Dialog';
import AutoComplete from 'material-ui/AutoComplete';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import CurrentFilter from './Currentfilter.jsx';
import Formsy from 'formsy-react';



const AutoPlaySwipeableViews = autoPlay(SwipeableViews);
export default class Tile extends React.Component{
	
	constructor(props){
		super(props);
		
		this.state={
			msgList:[],
			open:false,
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
			}
		}
	}

	componentWillMount(){
		let that = this;
		request
			.get('http://bob.blr.stackroute.in:8000/user/'+this.props.userId+'/Tiles/'+this.props.tileId+"/Messages")
            .end(function(err,res){
                console.log("this is response from server\n\n ",res,"\n\n");
                let parsed_res = JSON.parse(res.text);
                console.log("this is parsed res",parsed_res);
                if(parsed_res.result)
                	that.setState({msgList : parsed_res.data});
            });
	}

	componentDidMount(){
		let that = this;
		request
			.get('http://bob.blr.stackroute.in:8000/user/'+this.props.userId+'/Tiles/'+this.props.tileId)
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
	    
	}

	handleEdit(){
		let that = this;
		request
			.get('http://bob.blr.stackroute.in:8000/user/'+this.props.userId+'/channels')
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
						channels:reply.data,projects:projects
					});
				}
			});

		request
			.get('http://bob.blr.stackroute.in:8000/user/'+this.props.userId+'/Tiles/'+this.props.tileId)
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
		this.setState({open:true});
	}

	handleClose(){
		this.setState({open:false,pOkay:false,cOkay:false,Okay:false});
	}

	handleRequestDelete(category,filter){
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

	computeChannels(){
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

	handleTagInput(event){
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

	handleProjectInput(value){
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
		
	handleChannelInput(value){
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

	handleAdd(){
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

	handleSave(){
		request
			.patch('http://bob.blr.stackroute.in:8000/user/'+this.props.userId+'/Tiles/'+this.props.tileId)
			.send(this.state.filters)
			.end(function(err,res){
					console.log("result of save ",res.text);
					
			});
		this.handleClose.bind(this)();
	}

	render(){
		console.log("pokay: ",this.state.pOkay,"cokay: ",this.state.cOkay,"okay: ",
			this.state.Okay,"this.state.projects: ",this.state.projects,"filters ",this.state.filters," whole ",this.state);
		
		let dialog= (<Dialog open={this.state.open} onRequestClose={this.handleClose.bind(this)}
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
					);
		if(this.state.msgList.length===0){
			return (<div>
						{dialog}
		            	<CardHeader>     
		                    <IconButton  onClick={this.handleEdit.bind(this)} ><SettingsIcon  /></IconButton>   
		                </CardHeader>
		                <CardText >
		                	"No Notifications to Display"
		                </CardText>
		            </div>);
		}
		else{
			return (<div>
						{dialog}
						<AutoPlaySwipeableViews>
		                	{
		                		this.state.msgList.map((details, i) => (
		                     		<div key={i}>
		                              	<CardHeader title={details.channelId.split("#")[0]+"/"
		                              		+details.channelId.split("#")[1]+"/"
			                              	+details.sender}  subtitle = {details.TimeStamp}
			                            >     
		                              		<IconButton onClick={this.handleEdit.bind(this)} >
		                              			<SettingsIcon />
		                              		</IconButton>   
		                              	</CardHeader>
		                              	<CardText>
		                               		{details.msg}
		                              	</CardText>
		                            </div>
		                            )
		                		)
		                	}
		                </AutoPlaySwipeableViews>
		            </div>);
		}
	}	
		
}