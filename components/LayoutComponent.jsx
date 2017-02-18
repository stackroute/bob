import React, { Component } from 'react';
import ReactGridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import {CardHeader,CardTitle,Card,CardText} from 'material-ui/Card';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Tile from './Tile.jsx';
import CircularProgress from 'material-ui/CircularProgress';
import request from 'superagent';
import AddTile from './AddTile.jsx';
import cookie from 'react-cookie';
var base64 = require('base-64');
var utf8 = require('utf8');
import Paper from 'material-ui/Paper';


export default class LayoutComponent extends Component {
    constructor(props){
        super(props);
        var a=cookie.load("Token");
        var b=base64.decode(a.split('.')[1]);
        var c=utf8.decode(b);
        this.state={
            layout:[],
            userId:c

           }
        }
    saveLayout(Layout){
        
        
        // //console.log("Layout",Layout);
        // ajax.post('http://localhost:3001/Layout')
        //     .send({"id": "cl","Tile": Layout})
        //     .end(function(err,response){
        //         if(err)
        //           console.log("Post error ",err);
        //         else
        //            console.log("post was complete. with this layout ",Layout);
        //        });

        
        //  this.setState({
        //         layout:Layout
        //     });
           
        
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

addTile(){
    console.log("clicked");
    let that = this;
    request.post('http://bob.blr.stackroute.in/user/'+that.state.userId+'/Tiles/'+cookie.load('projectName'))
                .end(function(err,res){
                   console.log("this is response from server\n\n\n\n ",res,"\n\n\n\n");
                   if(JSON.parse(res.text).result){
                        request.get('http://bob.blr.stackroute.in/user/'+that.state.userId+'/Layout')
                                    .end(function(err,res){
                                        console.log("this is response from server\n\n\n\n ",res,"\n\n\n\n");
                                        let parsed_res = JSON.parse(res.text);
                                        console.log("this is parsed res",parsed_res);
                                        if(parsed_res.result)
                                          that.setState({layout:parsed_res.data});
                                    });

                   }
                });
  //  console.log("clicked");
    

                         
            //          ajax.get('http://localhost:3001/Layout')
            // .end(function(err,response){
            //     if(err)
            //         console.log("Get error ",err);
            //     else
            //         {
            //          console.log("setting the layout")
                     
            //          console.log("got this layout:", response.body.Tile);
            //            let nx,ny,nw,nh,ni;
            //            let data = response.body.Tile;
            //          nx = data[0].x;
            //          ny = data[0].y;
            //          nw = 2;
            //          nh = 2;
            //          ni = "t"+(data.length+1);
            //          data.push(
            //                     {
            //                     "w": nw,
            //                     "h": nh,
            //                     "x": nx,
            //                     "y": ny,
            //                     "i": ni,
            //                     "moved": false,
            //                     "static": false
            //                     }
            //                   );
            //         this.setState({layout: data});

            //         }

            //    }.bind(this));            
                    
                     // let addindex = data.findIndex(function(item){
                     //    return (item.i==="t1");
                     // });
                     //data[addindex].x++;
                     //data[addindex].y++;

        // request.post('http://localhost:8000/user/'+this.props.userId+'/Tiles')
        //         .end(function(err,res){
        //            console.log("this is response from server\n\n\n\n ",res,"\n\n\n\n");
        //            if(res.result)
        //             this.setState({Layout:res.data});
        //         });
                     
}
    

    render() {
    //    console.log("Render called");
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
         return (<div key={item.i}><Tile userId={this.state.userId} tileId = {item.i} /></div>);
     });
  
        return (
            <MuiThemeProvider>
            <Paper>
            <ReactGridLayout className="layout" layout={this.state.layout} cols={10} width={1200} rowHeight={60}>
                        
            <div key = {"add_tile"}><AddTile  passfunc = {this.addTile.bind(this)}/></div>

            {tile_list} 
            
            </ReactGridLayout>
            </Paper>
            </MuiThemeProvider>
        );
    }
    else{
       
         return (
            <MuiThemeProvider>
               <Paper>
               <center>
                
                 <CircularProgress size={120} thickness={5} /></center>      
                </Paper>
            </MuiThemeProvider>
        );
    }
 }
}

