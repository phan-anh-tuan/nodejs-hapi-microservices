import React from 'react';;
import {Grid, Row, Col } from 'react-bootstrap';
import Request from './request.js';
import { LightboxModal } from '../react-lightbox.js'
import { Button, FormControl, FormGroup, InputGroup, Form } from 'react-bootstrap'
var moment = require('moment')

class RequestList extends React.Component {
    
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleSubmit(event) {
        this.props.handleAddComment(this.state.text);
        event.preventDefault();
    }

    handleChange(event) {
        //console.log(`request_list set component state to ${event.target.value}`);
        this.state = { text : event.target.value};
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
            rows[rows.length-1].props.children.push(<Col sm={12} md={4} key={request._id}><Request handleShowComment={this.props.handleShowComment} data={request} baseUrl={baseUrl}/></Col>)
        });

        let _comments = [];
        if (comments) {
            comments.forEach((c,i) => {
                                    _comments.push(<li key={i}>{c.text + ' - ' + moment(c.createdDate).format('MMMM Do YYYY')}</li>)
                                }) 
        }
        { if (isFetching) { gridStyle = {opacity: 0.5} } }
        return (
            <Grid style={gridStyle}>
                {isFetching && <Row className='show-grid'><Col sm={12}><h2>Loading.....</h2></Col></Row>}
                {rows}
                <Row className='show-grid'>
                    <Col sm={12}>
                        <LightboxModal display={this.props.showComment} closeLightbox={this.props.handleHideComment}>
                            <ul>
                                {_comments.length > 0? _comments : 'There is no comments'}
                            </ul>
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
            </Grid>
        )
    }
}


export default RequestList;