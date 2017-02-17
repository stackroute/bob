import React from 'react';
import AppBar from 'material-ui/AppBar';
import Feedback from 'material-ui/svg-icons/action/feedback';
import SettingsPower from 'material-ui/svg-icons/action/settings-power';
import IconButton from 'material-ui/IconButton';
import {Link} from 'react-router';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import io from 'socket.io-client';
import cookie from 'react-cookie';
import Notifications from 'material-ui/svg-icons/social/notifications';
import Chat from 'material-ui/svg-icons/communication/chat';
import Add from 'material-ui/svg-icons/content/add';
export default class Header extends React.Component{

	constructor(props) {
		super(props);
		this.handleLogOut=this.handleLogOut.bind(this);
	}
		handleLogOut(){
			cookie.remove("Token");
		}

	render(){
		var a;
	    if(cookie.load("Token")!=undefined)
	    {
	    	a=<div>
	         <Link to={'project'}><IconButton tooltip="Create Project" tooltipPosition="bottom-left" iconStyle={{color:"white"}}><Add/></IconButton></Link>
	    	  <Link to={'notification'}><IconButton tooltip="Notifications" tooltipPosition="bottom-left" iconStyle={{color:"white"}}><Notifications/></IconButton></Link>
			<Link to={'bob'}><IconButton tooltip="Chat Screen" tooltipPosition="bottom-left" iconStyle={{color:"white"}}><Chat/></IconButton></Link>
			<Link to={'/'}><IconButton tooltip="LogOut" tooltipPosition="bottom-left" onTouchTap={this.handleLogOut} iconStyle={{color:"white"}}><SettingsPower/></IconButton></Link>
			</div>
	    }
		return(
			<div style={{marginTop:"0px"}}>
			<AppBar title="Bob(beta)" style={{background:"#3F51B5",marginTop:"0px"}} >
			<Link to={'feedback'}><IconButton tooltip="FeedBack" tooltipPosition="bottom-left" iconStyle={{color:"white"}}><Feedback/></IconButton></Link>
	        {a}
			</AppBar>
			{this.props.children}
			</div>
			);

	}
}

// Header.childContextTypes = {
//   socket: React.PropTypes.object
// };
