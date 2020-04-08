import React, { useEffect } from 'react';
import "./InputBox.css"

const InputBox = (props) => {
    return (<div id={`c${props.i}${props.j}`} className="inputBox">
        <input type="number" min="0" max="9" value={props.val} onChange={props.onChange} />
    </div>);
}

export default InputBox;