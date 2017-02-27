import React, { Component } from 'react';
import {List, ListItem,makeSelectable} from 'material-ui/List';
import Paper from 'material-ui/Paper';
import Subheader from 'material-ui/Subheader';
let SelectableList = makeSelectable(List);

export default class ProjectsList extends Component {
	constructor(props) {
		super(props);
		this.state={currentChannel:this.props.currentChannel.split('#')[0]}
		this.handleProjectChange=this.handleProjectChange.bind(this);
	}

	handleProjectChange(name){
		this.setState({currentChannel:name});
		this.props.setCurrentChannel(name+"#"+"general",this.props.currentChannel);
	}

	render() {
		let projects=[];
		this.props.projects.map((item,i)=>{
			if(projects.indexOf(item.split('#')[0])==-1){
				projects.push(item.split("#")[0]);
			}
		})
		return (
			<Paper style={{height:"100%",paddingRight:"0px"}}>
			<Subheader style={{fontSize:"18px", height:'9.3%', width:'100%', paddingTop:8}}>Projects</Subheader>
			 <SelectableList value={this.state.currentChannel}>
			 {
			 	projects.map((item,i)=>{
			 		return(<ListItem key={i} value={item.split("#")[0]} primaryText={item.split("#")[0]} onTouchTap={this.handleProjectChange.bind(this,item.split("#")[0])}/>)
			 	})
			 }
			 </SelectableList>
			 </Paper>
		);
	}
}
