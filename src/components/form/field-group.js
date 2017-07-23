import React from 'react'
import { FormGroup, FormControl, Col, ControlLabel, HelpBlock } from 'react-bootstrap'

const FieldGroup = ({ id, label, help, children, ...rests }) => {
        return (
            <FormGroup controlId={id}>
                <Col componentClass={ControlLabel} xsPush={1} xs={11} sm={2}>
                    {label}
                </Col>
                <Col xsPush={1} xs={10} sm={6}>
                    <FormControl {...rests}>
                        {children}
                    </FormControl>
                    {help && <HelpBlock>{help}</HelpBlock>}
                </Col>
            </FormGroup>
        );
}

export default FieldGroup