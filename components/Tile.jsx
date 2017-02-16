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

	const AutoPlaySwipeableViews = autoPlay(SwipeableViews);
	export default class Tile extends React.Component{
		
		constructor(props){
			super(props);
			
			this.state={
				msgList:[],
				div:null,
				title:"",
				subtitle:"",
				
				dialog:null
				
			}
		}
		componentWillMount(){
			let that = this;
			request.get('http://localhost:8000/user/'+this.props.userId+'/Tiles/'+this.props.tileId+"/Messages")
	                .end(function(err,res){


	                   console.log("this is response from server\n\n\n\n ",res,"\n\n\n\n");
	                   let parsed_res = JSON.parse(res.text);
                  	   console.log("this is parsed res",parsed_res);
	                   if(parsed_res.result)
	                   	that.setState({msgList : parsed_res.data});
	                });
		}


		componentDidMount() {
			
		    
		}
		componentWillReceiveProps(nextProps) {
			
		}
		
		

		render(){
			
			// if(this.state.configured===null)
			// {
			// 		return (<center><CircularProgress size={10} thickness={3} /></center>);
			// }
			if(this.state.msgList.length===0){
				return (<div>
			                              <CardHeader >     
			                              	<IconButton  ><SettingsIcon  /></IconButton>   
			                              </CardHeader>
			                              <CardText >
			                                "No Notifications to Display"
			                              </CardText>
			                              </div>);
			}
			else{
				return (<AutoPlaySwipeableViews>
			                              {this.state.msgList.map((details, i) => (
			                                  <div key={i}>
			                              <CardHeader title={details.channelId.split("#")[0]+"/"
			                              	+details.channelId.split("#")[1]+"/"
			                              	+details.sender}  subTitle = {details.TimeStamp}>     
			                              	<IconButton  ><SettingsIcon  /></IconButton>   
			                              </CardHeader>
			                              <CardText >
			                                {details.msg}
			                              </CardText>
			                              </div>
			                               ))}
			                              </AutoPlaySwipeableViews>);
				}
					
				
			}
	}