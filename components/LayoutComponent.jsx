import {CardHeader,CardTitle,Card,CardText} from 'material-ui/Card';
import CircularProgress from 'material-ui/CircularProgress';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Paper from 'material-ui/Paper';
import React, { Component } from 'react';
import ReactGridLayout from 'react-grid-layout';
import Snackbar from 'material-ui/Snackbar';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import 'react-drawer/lib/react-drawer.css';

var base64 = require('base-64');
var utf8 = require('utf8');
import cookie from 'react-cookie';
import request from 'superagent';
import AddTile from './AddTile.jsx';
import ReactDrawer from 'react-drawer';
import Tile from './Tile.jsx';
import TileOpen from './TileOpen.jsx';

export default class LayoutComponent extends Component {

    constructor(props){
        super(props);
        var a=cookie.load("Token");
        var b=base64.decode(a.split('.')[1]);
        var c=utf8.decode(b);
        this.state={
            layout:[],
            userId:c,
            openedTileId:"",
            openedMessages:[],
            openSnackbar:false,
            openDrawer: false,
            position: 'bottom',
            noOverlay: false
           }

        this.closeDrawer = this.closeDrawer.bind(this);
        this.onDrawerClose = this.onDrawerClose.bind(this);
        }

  toggleDrawer(tileId,msgList) {

    console.log("this is inside toggleDrawer,",this.state.openDrawer);
    if(msgList.length!==0)
    {
      console.log("Getting tileID: ",tileId,"msgList: ",msgList);
      this.setState({openDrawer: !this.state.openDrawer,openedTileId:tileId,openedMessages:msgList});}
    else
      {
        this.setState({openSnackbar:true});
        window.setTimeout(()=>{this.setState({openSnackbar:false})},4000)
      }
  }

  closeDrawer() {
    this.setState({openDrawer: false});
    console.log("this is close drawer", this.state.openDrawer);
  }

  onDrawerClose() {
    this.setState({openDrawer: false});
    console.log("this is on drawer close",this.state.openDrawer);
  }

  saveLayout(Layout){
      request.put('http://bob.blr.stackroute.in/user/'+this.state.userId+'/Layout')
                .set('Content-Type','application/json')
                .send({layout:Layout})
                .end(function(err,res){
                   console.log("this is response from server on load\n\n\n\n ",res,"\n\n\n\n");
                   let parsed_res = JSON.parse(res.text);
                   console.log("this is parsed res",parsed_res);
                   if(parsed_res.result)
                    console.log("Layout saved in server.");
                   else
                    console.log("An error in server saving layout");
                });

  }
  componentWillMount(){
      let that = this;
      request.get('http://bob.blr.stackroute.in/user/'+this.state.userId+'/Layout')
                .end(function(err,res){
                   console.log("this is response from server on load\n\n\n\n ",res,"\n\n\n\n");
                   let parsed_res = JSON.parse(res.text);
                   console.log("this is parsed res",parsed_res);
                   if(parsed_res.result)
                    that.setState({layout:parsed_res.data});
                });


  }
  componentDidMount(){
    this.context.socket.emit("login",this.state.userId,cookie.load('projectName'));
  }

  addTile(){
    console.log("clicked");
    let that = this;
    request.post('http://bob.blr.stackroute.in/user/'+that.state.userId+'/Tiles/'+cookie.load('projectName'))
                .end(function(err,res){
                   console.log("this is response from server on adding tile\n\n\n\n ",res,"\n\n\n\n");
                   if(JSON.parse(res.text).result){
                        request.get('http://bob.blr.stackroute.in/user/'+that.state.userId+'/Layout')
                            .end(function(err,res){
                                console.log("this is response from server on getting layout\n\n\n\n ",res,"\n\n\n\n");
                                let parsed_res = JSON.parse(res.text);
                                console.log("this is parsed res of layout get",parsed_res);
                                if(parsed_res.result)
                                    that.setState({layout:parsed_res.data});
                             });
                   }
                });

  }

  deleteTile(tileId){
        console.log("dlelte");
        let that = this;
        request
            .delete('http://bob.blr.stackroute.in/user/'+this.state.userId+'/Tiles/'+tileId)
            .end(function(err,reply){
               request.get('http://bob.blr.stackroute.in/user/'+that.state.userId+'/Layout')
                .end(function(err,res){
                   console.log("this is response from server on load\n\n\n\n ",res,"\n\n\n\n");
                   let parsed_res = JSON.parse(res.text);
                   console.log("this is parsed res",parsed_res);
                   if(parsed_res.result)
                    that.setState({layout:parsed_res.data});
                });
            });
  }

  render() {
    console.log("this is layout in render, ",this.state.layout);
    if(this.state.layout.length>0)
    {
      let tile_list = this.state.layout.filter((item)=>{    //display only tiles that are not "add_tile"
        if(item.i!=="add_tile")
          return true;
        else
         return false;
      });

      tile_list = tile_list.map((item,i)=>{
         return (<div key={item.i}><Tile userId={this.state.userId}
                 psocket={this.context.socket} tileId = {item.i}
                  handleDelete={this.deleteTile.bind(this,item.i)}
                  handleViewAll = {this.toggleDrawer.bind(this,item.i)}
                  />
                  </div>);
      });

      return (
            <MuiThemeProvider>
            <Paper>
            <ReactGridLayout style={{height:'100%'}} className="layout" onLayoutChange={this.saveLayout.bind(this)} layout={this.state.layout} cols={10} width={1200} rowHeight={70}>

            <div key = {"add_tile"} style={{height:'500%'}} ><AddTile  passfunc = {this.addTile.bind(this)} /></div>

            {tile_list}

            </ReactGridLayout>
            <div>
              <ReactDrawer
                  open={this.state.openDrawer}
                  position={this.state.position}
                  onClose={this.onDrawerClose}
                  noOverlay={this.state.noOverlay}
              >
                <TileOpen msgList = {this.state.openedMessages} tileId = {this.state.openedTileId}
                  userId={this.state.userId} psocket={this.context.socket}/>
              </ReactDrawer>
            </div>

             <Snackbar
              open={this.state.openSnackbar}
              message="No Messages to View"
              autoHideDuration={4000}
              onRequestClose={this.handleRequestClose}
            />

            </Paper>

            </MuiThemeProvider>
      );
    }
    else{
      return (
            <MuiThemeProvider>
              <Paper>
                <center>
                  <CircularProgress size={120} thickness={5} />
                </center>
              </Paper>
            </MuiThemeProvider>
      );
    }
  }
}

LayoutComponent.contextTypes = {
  socket:React.PropTypes.object
};
