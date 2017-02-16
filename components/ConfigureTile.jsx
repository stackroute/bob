import React, { Component } from 'react';
import {Card,CardHeader,CardText} from 'material-ui/Card';
import SettingsIcon from 'material-ui/svg-icons/action/settings';
import FloatingActionButton from 'material-ui/FloatingActionButton';


export default class ConfigureTile extends Component {
	constructor(props){
		super(props);
		this.state={};
	}
	render() {
		return (
			<Card style={{height: '100%',overflow:"hidden"}}>
					<CardHeader title="Unconfigured Tile" subtitle="Click to Configure" />   
                    <CardText >
                               <center>
                               	<FloatingActionButton onClick={this.calll.bind(this)}>
                               		<SettingsIcon  />
                              	 </FloatingActionButton>
                               </center>
                    </CardText>
				</Card>	);
		}
	}