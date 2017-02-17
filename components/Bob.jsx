import React from 'react';
import ChannelList from './ChannelList.jsx';
import async from 'async';
import {List, ListItem,makeSelectable} from 'material-ui/List';
import ChatArea from './ChatArea.jsx';
import io from 'socket.io-client';
import Header from './Header.jsx';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import { Grid, Row, Col} from 'react-flexbox-grid/lib';
import cookie from 'react-cookie';
var base64 = require('base-64');
var utf8 = require('utf8');

export default class Bob extends React.Component{
      constructor(props){
        super(props);
        console.log(cookie.load(''),cookie.load('projectName'));
         var a=cookie.load("Token");
         var b=base64.decode(a.split('.')[1]);
         var c=utf8.decode(b);
        // console.log(c,c.userName,"Nameee");
        this.state={
          userName:c,
          channelsList:[],
          currentChannel:"",
          unreadCount:{},
          lat:{},
          socket:null
};
        this.toggleCurrentChannel=this.toggleCurrentChannel.bind(this);
        this.handleChange=this.handleChange.bind(this);
        this.resetCurrentChannelUnread=this.resetCurrentChannelUnread.bind(this);
      }
       componentDidMount(){
          var socket=io('http://172.23.238.171:8000');
           let that=this;
              socket.on('channelList', function (list,unreadCount,lat,currentChannel) {
                that.setState({channelsList:list,unreadCount:unreadCount,lat:lat,currentChannel:currentChannel});
                that.resetCurrentChannelUnread(that.state.unreadCount);
                 
            });

              socket.on("updateUnread",function(currentChannel,prevChannel,d){
                let temp=that.state.lat;
                let unread=that.state.unreadCount;
                temp[prevChannel]=d;
                unread[prevChannel]=0;
                //console.log(currentChannel,"bbbbbb");
                //unread[that.state.currentChannel]=0;
                that.setState({lat:temp,unreadCount:unread})
                that.resetCurrentChannelUnread(that.state.unreadCount);
              })

              socket.on("listenToMessage",function(channelList,channelName){
               //console.log(channelList,"aaaa");
                if(channelList.indexOf(channelName)!=-1){
                  var temp=that.state.unreadCount;
                  temp[channelName]++;
                  that.setState({unreadCount:temp});
                }
                
                 that.resetCurrentChannelUnread(that.state.unreadCount);
              })

              socket.on('updatedChannelList', function(channel){
               that.setState({channelsList: channel});
             });
               socket.emit("login",this.state.userName,cookie.load('projectName'));
              this.setState({socket:socket});
         }

      resetCurrentChannelUnread(unreadCount){
          var temp=unreadCount;
                var channel=this.state.currentChannel;
                //console.log(temp[channel],"temp");
                let that=this;
                 setTimeout(function(){
                      temp[channel]=0
                      console.log(temp);
                      that.setState({unreadCount:temp}); 
                     }.bind(this),500);

      }
     
      handleChange(e){
        this.setState({userName:e.target.value})
      }

      handleClick(){
        this.state.socket.emit("login",this.state.userName);
      }

      toggleCurrentChannel(item,prevChannel){
        console.log("Inside the bob the current and previous channel ",item,prevChannel);
        this.setState({
          currentChannel:item
        });
        this.state.socket.emit('currentChannel', item,prevChannel,this.state.userName);
      }

      handleLiveUnreadCount(channelID){
        this.setState((prevState,props)=>{
          return prevState.unreadCount[channelID]++;
        });
      }
     
      render(){
      // console.log(this.state.userName,"User Name");
        let chatArea;
         if(this.state.socket!=null&&this.state.currentChannel!=""){
        //console.log(this.state.currentChannel,"current Channel");
          
          chatArea=(
          <Grid  style={{height:"89vh",width:"100%"}}>
            <Row style={{height:"100%",width:"100%"}}>
              <Col xs={12} sm={3} md={3} lg={3} style={{height:"100%"}}>
               <ChannelList socket={this.state.socket} userName={this.state.userName} channelList={this.state.channelsList} currentChannel={this.state.currentChannel} unreadCount={this.state.unreadCount} setCurrentChannel={this.toggleCurrentChannel}/>
              </Col>
              <Col xs={12} sm={9} md={9} lg={9} style={{height:"100%"}}>
             <ChatArea channelID={this.state.currentChannel} socket={this.state.socket} LiveUnreadCount={this.handleLiveUnreadCount.bind(this)} userName={this.state.userName}/>
              </Col>
            </Row>
          </Grid>);
        }
         else
         {
          chatArea=null;
         }
        //console.log(a);
        return(
           <Grid style={{height:'100%',width:"100%",marginTop:"1px"}}>
          <Row style={{width:"100%"}}>
                <Col xs={12} sm={12} md={12} lg={12} style={{height:'100%'}}>
                  {chatArea}
                </Col>
              </Row>
            </Grid>
        );
      }
}
