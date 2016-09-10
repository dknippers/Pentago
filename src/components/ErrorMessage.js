import React from 'react';
import { connect } from 'react-redux';

const ErrorMessage = ({ error }) => {
  if(!error) return null;

  return (
    <div className="error">{ error }</div>
  );
}

export default connect(
  state => ({ error: state.error })
)(ErrorMessage);