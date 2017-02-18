import React, { Component } from 'react';
import Chip from 'material-ui/Chip';

export default class Currentfilter extends Component {
 	constructor(props){
	   super(props);
	}


	handleDelete(category,filter){
		this.props.handleRequestDelete(category,filter);
	}



	render() {
		console.log(this.props,"herer");
		let tag_chips = this.props.filters.tags.map((item,i)=>{
			return (
       			 	<Chip
          			backgroundColor={this.props.filters.colors.tag}
          			onRequestDelete={this.handleDelete.bind(this,'tags',item)}
          			key = {"tag"+i}
        			>
        				{item}
        			</Chip>
        	);
		});




		

		let channel_chips = [];
		

		channel_chips = this.props.filters.channels.map((item,i)=>{
										return 	(
											<Chip
												backgroundColor={this.props.filters.colors.channel}
											  	onRequestDelete={this.handleDelete.bind(this,"channel",item)}
					   							key = {"channel"+i}
											>
										   		{item}
											</Chip>
											);
					});
		


		return (
			<div style={{display:"flex",overflow:"auto",width:"100%"}}>
			<p>Filters applied</p>
				{tag_chips}
				{channel_chips}
			</div>
		);
	}
}

