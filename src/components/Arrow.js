import React from 'react';

export const makeArrow = (row, column, clockwise, rotateQuadrant) => ({ dangerouslySetInnerHTML, className }) => {
  if(!dangerouslySetInnerHTML) return null;

  return (
    <span { ...{ dangerouslySetInnerHTML, className: getClassNames(), onClick: rotate } } />
  );

  function rotate(e) {
    e.stopPropagation();
    rotateQuadrant(row, column, clockwise);
  }

  function getClassNames() {
    const classNames = ['arrow', className];

    classNames.push(clockwise ? 'clockwise' : 'counter-clockwise');

    return classNames.join(' ');
  }
};