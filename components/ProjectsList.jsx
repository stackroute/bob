import React, { Component } from 'react';
import {List, ListItem} from 'material-ui/List';
import Paper from 'material-ui/Paper';
export default class ProjectsList extends Component {
	render() {
		return (
			<Paper style={{height:"100%"}}>
			 <List>
			 {
			 	this.props.projects.map(function(item,i){
			 		return(<ListItem key={i} primaryText={item.split("#")[0]} />)
			 	})
			 }
			 </List>
			 </Paper>
		);
	}
}
