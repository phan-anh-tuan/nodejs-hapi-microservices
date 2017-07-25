import React from 'react'
import { FormGroup, FormControl, Col, ControlLabel, HelpBlock } from 'react-bootstrap'

const FieldGroup = ({ id, label, help, children, ...rests }) => {
        //console.log(`field-group rests: ${JSON.stringify(rests)}`);
        return (
            <FormGroup controlId={id}>
                <Col componentClass={ControlLabel} xsPush={1} xs={11} sm={2} xsHidden={(rests.type === 'hidden')} smHidden={(rests.type === 'hidden')} mdHidden={(rests.type === 'hidden')} lgHidden={(rests.type === 'hidden')}>
                    {label}
                </Col>
                <Col xsPush={1} xs={10} sm={6} xsHidden={(rests.type === 'hidden')} smHidden={(rests.type === 'hidden')} mdHidden={(rests.type === 'hidden')} lgHidden={(rests.type === 'hidden')}>
                    <FormControl {...rests}>
                        {children}
                    </FormControl>
                    {help && <HelpBlock>{help}</HelpBlock>}
                </Col>
            </FormGroup>
        );
}

export default FieldGroup