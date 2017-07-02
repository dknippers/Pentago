import React from "react";
import Cell from "../components/Cell";

const Row = ({ row }) =>
    <div className="row">
        {row.map(cell => <Cell key={`cell-${cell.id}`} cell={cell} />)}
    </div>;

export default Row;
