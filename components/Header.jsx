import React from 'react';
import AppBar from 'material-ui/AppBar';
import Feedback from 'material-ui/svg-icons/action/feedback';
import IconButton from 'material-ui/IconButton';
import {Link} from 'react-router';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
export default class Header extends React.Component{
	
	render(){
		
		return(
			<div style={{marginTop:"0px"}}>
			<AppBar title="Bob(beta)" onLeftIconButtonTouchTap={this.toggleDrawer} style={{background:"#3F51B5",marginTop:"0px"}} iconElementRight={<Link to={'feedback'}><IconButton tooltip="FeedBack" tooltipPosition="bottom-left" iconStyle={{color:"white"}}><Feedback/></IconButton></Link>}/>
			{this.props.children}
			</div>
			);

	}
}