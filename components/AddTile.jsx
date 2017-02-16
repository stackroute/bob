import React, { Component } from 'react';
import {CardHeader,CardTitle,Card,CardText} from 'material-ui/Card';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';


export default class AddTile extends Component {
	constructor(props){
		super(props);
	}
	add_call(){
		console.log("in add call of tile");
		this.props.passfunc();
	}
	render() {
		return (
			<div>
				<CardHeader title="TITLE ADD" subtitle="click the icon"/>
        		<CardText>
        		<center><FloatingActionButton onClick={this.add_call.bind(this)}>
        		<ContentAdd  />
        		</FloatingActionButton></center></CardText>
        	</div>
		);
	}
}
