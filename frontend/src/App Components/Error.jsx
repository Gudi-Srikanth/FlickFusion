import React from 'react';
import './Error.css';

function Error({ message }) {
  if (!message) return null;

  return (
    <div className="errorText">
      {message}
    </div>
  );
}

export default Error;
