import {List, ListItem,makeSelectable} from 'material-ui/List';
import { Grid, Row, Col} from 'react-flexbox-grid/lib';
import ChannelList from './ChannelList.jsx';
import ChatArea from './ChatArea.jsx';
import Header from './Header.jsx';
import RaisedButton from 'material-ui/RaisedButton';
import React from 'react';
import Snackbar from 'material-ui/Snackbar';
import TextField from 'material-ui/TextField';

import async from 'async';
import cookie from 'react-cookie';
import ProjectsList from './ProjectsList.jsx';

var base64 = require('base-64');
var utf8 = require('utf8');

export default class Bob extends React.Component{
      constructor(props){
        super(props);
        //console.log(cookie.load(''),cookie.load('projectName'));
         var a=cookie.load("Token");
         var b=base64.decode(a.split('.')[1]);
         var c=utf8.decode(b);
         var d=a.split("#")[1];
         //console.log(d,"avatar");
        // console.log(c,c.userName,"Nameee");
        this.state={
          userName:c,
          channelsList:[],
          currentChannel:"",
          unreadCount:{},
          lat:{},
          avatars:{},
          snackbarData:"",
          openSnackbar:false,
          gitChannelStatus:false,
          repos:[]
        };
        this.toggleCurrentChannel=this.toggleCurrentChannel.bind(this);
        this.handleChange=this.handleChange.bind(this);
        this.resetCurrentChannelUnread=this.resetCurrentChannelUnread.bind(this);
        this.handleReposChange=this.handleReposChange.bind(this);
      }
       componentDidMount(){
           let that=this;
              this.context.socket.on('channelList', function (list,unreadCount,lat,currentChannel,avatars,gitChannelStatus,repos) {
               // console.log(currentChannel,"Bob current Channel Name");
                that.setState({channelsList:list,unreadCount:unreadCount,lat:lat,currentChannel:currentChannel,avatars:avatars,gitChannelStatus:gitChannelStatus,repos:repos});
                cookie.save('projectName',currentChannel.split('#')[0]);
                that.resetCurrentChannelUnread(that.state.unreadCount);

            });

              this.context.socket.on("updateUnread",function(currentChannel,prevChannel,d,avatars){
                //console.log("Inside Update Unread");
                let temp=that.state.lat;
                let unread=that.state.unreadCount;
                temp[prevChannel]=d;
                unread[prevChannel]=0;
                //console.log(currentChannel,"bbbbbb");
                //unread[that.state.currentChannel]=0;
                that.setState({lat:temp,unreadCount:unread,avatars:avatars})
                that.resetCurrentChannelUnread(that.state.unreadCount);
              })

              this.context.socket.on("listenToMessage",function(channelList,channelName){
               //console.log(channelList,"aaaa");
                if(channelList.indexOf(channelName)!=-1){
                  var temp=that.state.unreadCount;
                  temp[channelName]++;
                  that.setState({unreadCount:temp});
                }

                 that.resetCurrentChannelUnread(that.state.unreadCount);
              })

              this.context.socket.on('updatedChannelList', function(channel,status){
                //console.log(channel,"Updated Channel List");
                let a=channel.length;
               that.setState({channelsList: channel,currentChannel:channel[a-1],gitChannelStatus:status});
             });

                  this.context.socket.on('joinedNewChannel',function(message){ //added by manoj
                  console.log("invited ",message);
                  console.log("this is username",that.state.userName);
                if(message.toId.includes(that.state.userName))
                  {
                    that.snackbar("You are added to a new Channel '"+message.newDM);
                    console.log("subscribing to channel. ",message.newDM);  
                                    that.context.socket.emit('subscribeMe',message.newDM);
                                    that.setState((prevState,props)=>{
                                      prevState.channelsList.push(message.newDM);
                                      prevState.lat[message.newDM] = message.lat;
                                      prevState.unreadCount[message.newDM] = 0;
                                      console.log(prevState,"prevstate");
                                      return {channelsList:prevState.channelsList,lat:prevState.lat,unreadCount:prevState.unreadCount};
                                    });}
              });

              this.context.socket.on('errorOccured',function(data){
                that.snackbar(data);
              });
               this.context.socket.emit("login",this.state.userName,cookie.load('projectName'));
         }

      resetCurrentChannelUnread(unreadCount){
        //console.log("timeOut",unreadCount);
          var temp=unreadCount;
                var channel=this.state.currentChannel;
                //console.log(temp[channel],"temp");
                let that=this;
                 setTimeout(function(){
                      temp[channel]=0
                      //console.log(temp);
                      that.setState({unreadCount:temp});
                     }.bind(this),500);

      }

      handleChange(e){
        this.setState({userName:e.target.value})
      }
      handleRequestClose(){ //added my manoj
        this.setState({openSnackbar:false});
      }

      handleClick(){
        this.context.socket.emit("login",this.state.userName);
      }

      toggleCurrentChannel(item,prevChannel){
        //console.log("Inside the bob the current and previous channel ",item,prevChannel);
        this.setState({
          currentChannel:item
        });
        this.context.socket.emit('currentChannel', item,prevChannel,this.state.userName);
      }

      handleLiveUnreadCount(channelID){
        this.setState((prevState,props)=>{
          return prevState.unreadCount[channelID]++;
        });
      }

      handleReposChange(repos){
        this.setState({repos:repos})
      }

      snackbar(data){ //added by manoj
        this.setState({openSnackbar:true,snackbarData:data});
        window.setTimeout(()=>{this.setState({openSnackbar:false})},4000)
      }

      pushChannel(channel){ //added by manoj
        this.setState((prevState,props)=>{
                    prevState.channelsList.push(channel);
                    return {channelsList:prevState.channelsList};
                  });
      }

      render(){
       //console.log(this.state,"User Name");
        let chatArea;
         if(this.context.socket!=null&&this.state.currentChannel!=""){
        //console.log(this.state.currentChannel,"current Channel");

          chatArea=(
          <Grid  style={{height:"90vh",width:"100%"}}>
            <Row style={{height:"100%",width:"100%"}}>
            <Col xs={2} sm={2} md={1} lg={1} style={{height:"100%",paddingRight:"0px"}}>
            <ProjectsList projects={this.state.channelsList} currentChannel={this.state.currentChannel}
                            setCurrentChannel={this.toggleCurrentChannel}/>
            </Col>
              <Col xs={2} sm={1} md={2} lg={2} style={{height:"100%",paddingRight:"0px"}}>
               <ChannelList socket={this.context.socket} userName={this.state.userName}
                             channelList={this.state.channelsList} currentChannel={this.state.currentChannel}
                             unreadCount={this.state.unreadCount} setCurrentChannel={this.toggleCurrentChannel}
                             snackbar = {this.snackbar.bind(this)}
                              pushChannel = {this.pushChannel.bind(this)}
                              gitChannelStatus={this.state.gitChannelStatus} repos={this.state.repos}
                              reposUpdate={this.handleReposChange}/>
              </Col>
              <Col xs={8} sm={9} md={9} lg={9} style={{height:"100%",paddingRight:"0px"}}>
             <ChatArea avatars={this.state.avatars} channelID={this.state.currentChannel} socket={this.context.socket}
                          LiveUnreadCount={this.handleLiveUnreadCount.bind(this)} userName={this.state.userName}/>
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
           <Grid style={{height:'100%',width:"100%",marginTop:"0px"}}>
          <Row style={{width:"100%",paddingRight:"0px"}}>
                <Col xs={12} sm={12} md={12} lg={12} style={{height:'100%',paddingRight:"0px"}}>
                  {chatArea}
                </Col>
              </Row>
               <Snackbar   //added by manoj
              open={this.state.openSnackbar}
              message={this.state.snackbarData}
              autoHideDuration={4000}
              onRequestClose={this.handleRequestClose.bind(this)}
              />
            </Grid>
        );
      }
}

Bob.contextTypes = {
  socket:React.PropTypes.object
};
