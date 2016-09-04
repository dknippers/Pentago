import React from 'react';

export const makeArrow = (row, column, clockwise, rotateQuadrant, aiRotation, activePlayerId, lastRotation, showPreviousMove) => ({ dangerouslySetInnerHTML, className }) => {
  if(!dangerouslySetInnerHTML) return null;

  return (
    <span { ...{ dangerouslySetInnerHTML, className: getClassNames(), onClick: rotate } } />
  );

  function rotate(e) {
    e.stopPropagation();
    // We are showing a previous move,
    // you cannot click to rotate currently
    if(showPreviousMove) return false;

    rotateQuadrant(row, column, clockwise);
  }

  function getClassNames() {
    const classNames = ['arrow', className];

    classNames.push(clockwise ? 'clockwise' : 'counter-clockwise');

    // Are we using this arrow to show a computed AI move?
    if(isSameRotation(aiRotation)) {
      classNames.push('computed');
    }

    if(showPreviousMove && isSameRotation(lastRotation)) {
      classNames.push('last-rotation');
    }

    classNames.push(`player-${activePlayerId}`);

    return classNames.join(' ');
  }

  function isSameRotation(rotation) {
    return rotation &&
      rotation.row === row &&
      rotation.column === column &&
      rotation.clockwise === clockwise;
  }
};