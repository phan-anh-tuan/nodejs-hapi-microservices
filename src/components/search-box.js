import React from 'react'

class SearchBox extends React.Component {
    
    buttonUp(){
        
        var inputVal = $('.searchbox-input').val();
        inputVal = $.trim(inputVal).length;
        if( inputVal !== 0){
            $('.searchbox-icon').css('display','none');
        } else {
            $('.searchbox-input').val('');
            $('.searchbox-icon').css('display','block');
        }
    }
    componentDidMount() {
        
    }

    render() {
        return (<div className="searchbox-container">
            <form className="searchbox">
                <input type="search" placeholder="Enter some keyword..." name="search" className="searchbox-input" onKeyUp={this.buttonUp.bind(this)} required/>
                <input type="submit" className="searchbox-submit" value="GO" onClick={(e) => {e.preventDefault()}}/>
                <span className="searchbox-icon glyphicon glyphicon-search"></span>
            </form>
        </div>)
    }
}

export default SearchBox;
