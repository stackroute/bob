import RaisedButton from 'material-ui/RaisedButton';
import React, { Component } from 'react';
import {Link,hashHistory} from 'react-router';
import request from 'superagent';
import {Grid, Row, Col} from 'react-flexbox-grid/lib/index';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import Request from 'superagent';
export default class Login extends React.Component
{
    render()
    {
        return(
                <Grid style={{width:'96vw',height:'100%'}}>
<div style={{style:'##303f9f'}}>
                <Row center="xs">
                        {/* <img src="http://172.23.238.198:8000/images/final.jpg" /> */}
                         <Card style={{width:'100%',maxHeight:'100%'}}>
                             <CardMedia mediaStyle={{maxHeight:'100%'}} overlayContainerStyle={{marginBottom:'10%',opacity:'0.9',backgroundColor:'none',overflow:'hidden'}}
                                 overlayContentStyle={{background:'none'}}
                                overlay={<RaisedButton label="Login with GITHUB"
                                    href="https://github.com/login/oauth/authorize?client_id=1b4daad08bbe4298d833" primary={true} />}
                                >
                                    <img src="http://bob.blr.stackroute.in/static/images/final.jpg" style={{maxHeight:'100%'}}/>
                            </CardMedia>
                        </Card>
                </Row>
                    </div>
                    </Grid>
                );
                            }
                        }