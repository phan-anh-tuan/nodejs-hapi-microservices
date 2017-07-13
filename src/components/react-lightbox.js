import React from 'react'

// CSS from http://stackoverflow.com/questions/19064987/html-css-popup-div-on-text-click
// and http://stackoverflow.com/questions/10019797/pure-css-close-button
// source code from https://github.com/howtomakeaturn/React-Lightbox/blob/master/react-lightbox.jsx

export class LightboxModal extends React.Component{
    constructor(props) {
        super(props);
        this.whiteContentStyles = {
                                            position: 'fixed',
                                            top: '25%',
                                            left: '30%',
                                            right: '30%',
                                            backgroundColor: '#fff',
                                            color: '#7F7F7F',
                                            padding: '20px',
                                            border: '2px solid #ccc',
                                            borderRadius: '20px',
                                            boxShadow: '0 1px 5px #333',
                                            zIndex:'101'
                                        };
        this.blackOverlayStyles = {
                                            background: 'black',
                                            opacity: '.5',
                                            position: 'fixed',
                                            top: '0px',
                                            bottom: '0px',
                                            left: '0px',
                                            right: '0px',
                                            zIndex: '100'
                                        };
        this.closeTagStyles = {
                                        float: 'right',
                                        marginTop: '-30px',
                                        marginRight: '-30px',
                                        cursor: 'pointer',
                                        color: '#fff',
                                        border: '1px solid #AEAEAE',
                                        borderRadius: '30px',
                                        background: '#605F61',
                                        fontSize: '31px',
                                        fontWeight: 'bold',
                                        display: 'inline-block',
                                        lineHeight: '0px',
                                        padding: '11px 3px',
                                        textDecoration: 'none'
                                    };
        
    }
    

    

    

    componentDidMount(){
        document.addEventListener("keydown", function (e) {
            if ( (this.props.display) && (e.keyCode === 27) ){
                this.props.closeLightbox();
            }
        }.bind(this));
    }

    render(){

        const _lightboxModal = this;
        const {children, ...rest} = _lightboxModal.props;
        const childrenWithProps = React.Children.map(_lightboxModal.props.children,(child) => {
            const childWithProps = React.cloneElement(child, { ...rest})
            return childWithProps;
        });

        if (this.props.display){
            return (
                <div>
                    <div style={Object.assign({},this.blackOverlayStyles,!!this.props.blackOverlayStyles? this.props.blackOverlayStyles: {})} onClick={this.props.closeLightbox} />
                    <div style={Object.assign({},this.whiteContentStyles,!!this.props.whiteContentStyles? this.props.whiteContentStyles: {})}>
                        <a style={Object.assign({},this.closeTagStyles,!!this.props.closeTagStyles? this.props.closeTagStyles: {})} onClick={this.props.closeLightbox}>&times;</a>
                        {childrenWithProps}
                    </div>
            </div>
            );
        } else {
            return (<div></div>);
        }
    }
}


export class LightboxTrigger extends React.Component{
    render(){
        const _lightboxTrigger = this;
        const {children, ...rest} = _lightboxTrigger.props;
        const childrenWithProps = React.Children.map(_lightboxTrigger.props.children,(child) => {
            const childWithProps = React.cloneElement(child, { onClick: _lightboxTrigger.props.openLightbox, ...rest})
            return childWithProps;
        });
    
        return childrenWithProps[0];
    }
}


export class Lightbox extends React.Component {
    
    constructor(props) {
        super(props);
        this.openLightbox = this.openLightbox.bind(this);
        this.closeLightbox = this.closeLightbox.bind(this);
        this.setLightboxState = this.setLightboxState.bind(this);
        this.state = { display: false };
    }
    
    componentWillMount(){
        if (this.props.data)
            this.setState(this.props.data);
    }

    openLightbox(){
        this.setState({display: true});
    }

    closeLightbox() {
        this.setState({display: false});
    }

    setLightboxState(obj){
        this.setState(obj);
    }

    render(){
        const _lightbox = this;
        let i = 0;
        const childrenWithProps = React.Children.map(this.props.children,(child) => {
            
            i++;
            const childProps = {
                openLightbox: _lightbox.openLightbox,
                closeLightbox: _lightbox.closeLightbox,
                setLightboxState: _lightbox.setLightboxState,
                key: i
            };
            for (var j in _lightbox.state){
                childProps[j] = _lightbox.state[j];
            }
            const childWithProps = React.cloneElement(child, childProps);
            return childWithProps;
        });
    
        return (
            <div>
                {childrenWithProps}
            </div>
        );
    }
}

