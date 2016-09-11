import React from 'react';
import { connect } from 'react-redux';

const OptionsWindow = () => {
  return (
    <div className="options">
    <h1>Options</h1>
    </div>
  )
}

export default connect(
  state => ({})
)(OptionsWindow);