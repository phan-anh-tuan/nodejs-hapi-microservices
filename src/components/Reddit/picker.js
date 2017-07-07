import React from 'react';
import PropTypes from 'prop-types';

class Picker extends React.Component {
    render() {
        const {value, onChange, options} = this.props;
        return (
            <span>
                <h2>{value}</h2>
                <select value={value} onChange={(e) => onChange(e.target.value)}>
                    {options.map((opt) => 
                        <option key={opt} value={opt}>{opt}</option>
                    )}
                </select>
            </span>
        )
    }
}

Picker.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired
}

export default Picker
