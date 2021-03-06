import React from "react";
import SVG from 'react-inlinesvg';
import clockwiseArrow from "../svg/clockwise.svg";
import counterClockwiseArrow from "../svg/counter-clockwise.svg";

const Arrow = ({
    row,
    column,
    clockwise,
    rotateQuadrant,
    animateQuadrant,
    aiRotation,
    activePlayerId,
    lastRotation,
    showLastMove,
    isSelected,
    animationsEnabled,
    className,
    src,
}) => {
    return (
        <span
            className={getClassNames()}
            onClick={rotate}
        >
            <SVG src={clockwise ? clockwiseArrow : counterClockwiseArrow}></SVG>
        </span>
    );

    function rotate(e) {
        e.stopPropagation();
        // We are showing a previous move,
        // you cannot click to rotate currently
        if (showLastMove) return false;
        // Our Quadrant must be selected, otherwise something fishy is going on
        if (!isSelected) return false;

        if (animationsEnabled) {
            animateQuadrant(row, column, clockwise);
        } else {
            rotateQuadrant(row, column, clockwise);
        }
    }

    function getClassNames() {
        const classNames = ["arrow", className];

        classNames.push(clockwise ? "clockwise" : "counter-clockwise");

        // Are we using this arrow to show a computed AI move?
        if (isSameRotation(aiRotation)) {
            classNames.push("ai-preview");
        }

        if (showLastMove && isSameRotation(lastRotation)) {
            classNames.push("last-rotation");
        }

        classNames.push(`player-${activePlayerId}`);

        return classNames.join(" ");
    }

    function isSameRotation(rotation) {
        return (
            rotation &&
            rotation.row === row &&
            rotation.column === column &&
            rotation.clockwise === clockwise
        );
    }
};

export default Arrow;
