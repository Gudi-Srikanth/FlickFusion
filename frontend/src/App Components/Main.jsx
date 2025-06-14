import React from "react";
import './Main.css';
import Right from "./Main components/RightPanel";
import Center from "./Main components/CenterPanel";
import Header from "./Header";
import Footer from "./Footer";

function Main(){
    return (
        <div className="mainWrapper">
            <Header />
            <div className="mainContent">
                <Center />
                <Right />
             </div>
            <Footer />
        </div>

    );
}
export default Main;