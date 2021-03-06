import React from "react";
import { connect } from "react-redux";
import Cell from "./Cell";
import { rotateQuadrant, animateQuadrant, selectQuadrant } from "../actions";
import Arrow from "./Arrow";

const Quadrant = ({
    quadrant,
    canRotateQuadrant,
    hasSelectedQuadrant,
    isSelected,
    row,
    column,
    rotateQuadrant,
    selectQuadrant,
    animateQuadrant,
    aiRotation,
    activePlayerId,
    lastRotation,
    showLastMove,
    quadrantAnimation,
    animationsEnabled,
    animationDuration,
}) => {
    return (
        <div className={getClassNames()} style={getStyle()} onClick={onClick}>
            {quadrant.map((row, i) =>
                row.map(cell => <Cell key={`cell-${cell.id}`} cell={cell} />)
            )}

            <div className="arrows">
                <Arrow {...getArrowParams(true)} />
                <Arrow {...getArrowParams(false)} />
            </div>
        </div>
    );

    function getStyle() {
        if (!animationsEnabled || !isThisQuadrant(quadrantAnimation))
            return null;

        const animationDurationInSeconds = animationDuration / 1000;

        return {
            transform: `rotate(${quadrantAnimation.clockwise ? 90 : -90}deg)`,
            transition: `all ${animationDurationInSeconds}s linear`
        };
    }

    function onClick(e) {
        if (!canRotateQuadrant) return null;

        e.stopPropagation();

        selectQuadrant(row, column);
    }

    function getArrowParams(clockwise) {
        return {
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
            activePlayerId,
        };
    }

    function getClassNames() {
        const classNames = ["quadrant"];

        if (isSelected) {
            classNames.push("selected");
        }

        if (
            showLastMove &&
            lastRotation != null &&
            lastRotation.row === row &&
            lastRotation.column === column
        ) {
            classNames.push("show-last-move");
        }

        if (
            aiRotation &&
            aiRotation.row === row &&
            aiRotation.column === column
        ) {
            classNames.push("ai-preview");
        }

        if (isThisQuadrant(quadrantAnimation) && animationsEnabled) {
            classNames.push("animating");
        }

        return classNames.join(" ");
    }

    function isThisQuadrant(quadrantObject) {
        return (
            quadrantObject &&
            quadrantObject.row === row &&
            quadrantObject.column === column
        );
    }
};

export default connect(
    (state, props) => ({
        canRotateQuadrant: !state.gameOver && state.canRotateQuadrant,
        hasSelectedQuadrant: state.ui.selectedQuadrant.row != null,
        isSelected:
            state.ui.selectedQuadrant.row === props.row &&
            state.ui.selectedQuadrant.column === props.column,
        aiRotation: state.ui.computedMove && state.ui.computedMove.rotation,
        activePlayerId: state.activePlayer,
        lastRotation: state.lastMove.rotation,
        showLastMove: state.ui.showLastMove,
        quadrantAnimation: state.ui.quadrantAnimation,
        animationsEnabled: state.options.animationsEnabled,
        animationDuration: state.options.animationDuration
    }),
    { rotateQuadrant, animateQuadrant, selectQuadrant }
)(Quadrant);
