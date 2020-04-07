import React from 'react';
import "./InputBox.css"

const InputBox = (props) => {
    return (<div className="inputBox">
        <input type="number" min="0" max="9" value={props.val} onChange={props.onChange} />
    </div>);
}

export default InputBox;