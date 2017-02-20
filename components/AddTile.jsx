import React, { Component } from 'react';
import {CardHeader,CardTitle,Card,CardText} from 'material-ui/Card';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {cyan500,cyan50,indigo700,grey900,grey600,white,red,fullBlack, cyan700,
  pinkA200,grey100, grey300, grey400, grey500, darkBlack,grey50} from 'material-ui/styles/colors';
  import getMuiTheme from 'material-ui/styles/getMuiTheme';
  import {fade} from 'material-ui/utils/colorManipulator';

const muiTheme = getMuiTheme({
card: {
	titleColor:'white',
  subtitleColor:'grey50',

}
});


export default class AddTile extends Component {
	constructor(props){
		super(props);
	}
	add_call(){
		console.log("in add call of tile");
		this.props.passfunc();
	}
	render() {
		return (<MuiThemeProvider muiTheme={muiTheme}>
			<div>
				<Card>
				<CardHeader style={{backgroundColor:'#3F51B5'}} title="TITLE ADD" subtitle="click the icon"/>
        		<CardText style={{backgroundColor: '#E8EAF6',height:'100%'}}>
        		<center><FloatingActionButton onClick={this.add_call.bind(this)}>
        		<ContentAdd  />
        		</FloatingActionButton></center></CardText>
					</Card>
        	</div>
					</MuiThemeProvider>
		);
	}
}
