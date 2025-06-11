import React from "react";
import './Main.css';
import Left from "./Left";
import Right from "./RIght";
import Center from "./Center";

function Main(){
    return (
        <div className="container">
            <Left />
            <Center />
            <Right />
        </div>
    );
}
export default Main;