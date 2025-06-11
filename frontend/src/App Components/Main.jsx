import React from "react";
import './Main.css';
import Left from "./Main components/Left";
import Right from "./Main components/Right";
import Center from "./Main components/Center";

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