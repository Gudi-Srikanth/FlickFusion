import React from "react";
import './Reviewers.css';
import SearchIcon from '@mui/icons-material/Search';

function Reviewers(){
    return (
        <div className="reviewerList">
            <div className="search-bar">
                <input type="text" placeholder="Find Reviewers"/>
                <SearchIcon style={{ marginLeft: '5px', color: 'white', border: '1px solid white', borderRadius: '8px' }} />
            </div>
            <p className="reviewerTitle">Who To Follow</p>
            <hr className="divider"/>
            <div className="reviewerDetails">
                <h3 className="reviewerName">godamongstmen</h3>
                <h4 className="followerCount">6000 Followers</h4>
                <h4 className="reviewCount">500 Reviews</h4>
            </div>
            <div className="reviewerDetails">
                <h3 className="reviewerName">godamongstmen</h3>
                <h4 className="followerCount">6000 Followers</h4>
                <h4 className="reviewCount">500 Reviews</h4>
            </div>
            <div className="reviewerDetails">
                <h3 className="reviewerName">godamongstmen</h3>
                <h4 className="followerCount">6000 Followers</h4>
                <h4 className="reviewCount">500 Reviews</h4>
            </div>
            <div className="reviewerDetails">
                <h3 className="reviewerName">godamongstmen</h3>
                <h4 className="followerCount">6000 Followers</h4>
                <h4 className="reviewCount">500 Reviews</h4>
            </div>
            <div className="reviewerDetails">
                <h3 className="reviewerName">godamongstmen</h3>
                <h4 className="followerCount">6000 Followers</h4>
                <h4 className="reviewCount">500 Reviews</h4>
            </div>
        </div>
    );
}

export default Reviewers;
