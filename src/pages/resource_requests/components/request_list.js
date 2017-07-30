import React from 'react';;
import {Grid, Row, Col } from 'react-bootstrap';
import { Button, FormControl, FormGroup, InputGroup, Form, ListGroup, ListGroupItem, Pager } from 'react-bootstrap'
import Request from './request.js';
import { LightboxModal } from '../../../components/react-lightbox.js'

var moment = require('moment')

class RequestList extends React.Component {
    
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleGoToPage = this.handleGoToPage.bind(this);
    }

    handleSubmit(event) {
        this.props.handleAddComment(null,this.state.text).then( () => {  
                                                    this.props.handleHideComment();
                                                })
                                                .catch((error) => {
                                                    console.log('request_form handleSubmit fail with error message', error.message);
                                                })
        event.preventDefault();
    }

    handleChange(event) {
        this.state = { text : event.target.value};
    }

    handleGoToPage(eventKey) {
        switch (eventKey) {
            case '1': //go to previous page
                console.log(`resource-requests\components\request_list eventKey: ${eventKey}`)
                this.props.fetchResourceRequests('previous')
                break;
            case '2':
                this.props.fetchResourceRequests('next')
                break;
        }
    }

    

    render() {
        const { items: r_requests, isFetching, comments } = this.props;
        const baseUrl = this.props.baseUrl;
        let rows = [];
        let gridStyle = { opacity: 1 };
        r_requests.forEach((request,index) => {
            if (index % 3 === 0) {
                rows.push(<Row key={index} className='show-grid'>{[]}</Row>)
            }
            rows[rows.length-1].props.children.push(<Col sm={12} md={4} key={request._id}><Request history={this.props.history} location={this.props.location} match={this.props.match} handleAddComment={this.props.handleAddComment} handleShowComment={this.props.handleShowComment} handleCloseRequestWithComment={this.props.handleCloseRequestWithComment} data={request} baseUrl={baseUrl}/></Col>)
        });

        let _comments = [];
        if (comments) {
            comments.forEach((c,i) => {
                                    _comments.push(<ListGroupItem key={i} header={c.text}>{moment(c.createdDate).format('MMMM Do YYYY')}</ListGroupItem>)
                                }) 
        }
        { if (isFetching) { gridStyle = {opacity: 0.5} } }
        return (
            <div style={gridStyle}>
                {isFetching && <Row className='show-grid'><Col sm={12}><h2>Loading.....</h2></Col></Row>}
                {rows}
                <Row className='show-grid'>
                    <Col sm={12}>
                        <LightboxModal display={this.props.showComment} closeLightbox={this.props.handleHideComment}>
                            <ListGroup>
                                {_comments.length > 0? _comments : 'There is no comments'}
                            </ListGroup>
                            <Form onSubmit={this.handleSubmit}>
                                <FormGroup>
                                    <InputGroup>
                                        <FormControl type="text" onChange={this.handleChange} />
                                        <InputGroup.Button>
                                            <Button  type="submit">Add</Button>
                                        </InputGroup.Button>
                                    </InputGroup>
                                </FormGroup>
                            </Form>
                        </LightboxModal>
                    </Col>
                </Row>
                <Row className='show-grid'>
                    <Pager onSelect={this.handleGoToPage}>
                        <Pager.Item previous eventKey='1'>&larr; Previous</Pager.Item>
                        <Pager.Item next eventKey='2'>Next &rarr;</Pager.Item>
                    </Pager>
                </Row>
            </div>
        )
    }
}


export default RequestList;