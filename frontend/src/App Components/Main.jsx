import React from "react";
import './Main.css';
import Home from './Home'
import Header from "./Header";
import Footer from "./Footer";

function Main(){
    return (
        <div className="mainWrapper">
            <Header />
            <div className="mainContent">
                <Home />
            </div>
            <Footer />
        </div>

    );
}
export default Main;