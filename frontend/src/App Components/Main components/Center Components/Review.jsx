import React from "react";
import './Review.css';

function Review(){
    return (
        <div className="reviews">
            <p className="firstLine">POPULAR REVIEWS THIS WEEK</p>
            <hr />
            <div className="reviewList"> 
                <div className="image">
                    <img src="/tdk.png" alt="The Dark Knight" />
                </div>
                <div className="reviewContent">
                    <h2>The Dark Knight</h2>
                    <h3>Rating: 10.0</h3>
                    <p>"The Dark Knight" is a gripping and intense superhero film that transcends the genre with its complex characters, thought-provoking themes, and masterful direction by Christopher Nolan. Heath Ledger's iconic portrayal of the Joker steals the show, delivering a chilling and mesmerizing performance that elevates the film to legendary status. With its relentless action, moral ambiguity, and exploration of the nature of heroism, "The Dark Knight" is a cinematic masterpiece that continues to captivate audiences and define the superhero genre.</p>
                </div>
            </div>
            <div className="reviewList"> 
                <div className="image">
                    <img src="/fc.png" alt="Fight Club" />
                </div>
                <div className="reviewContent">
                    <h2>Fight Club</h2>
                    <h3>Rating: 9.5</h3>
                    <p>"Fight Club" is a riveting exploration of masculinity, consumerism, and the human psyche. Directed by David Fincher and based on Chuck Palahniuk's novel, the film follows an unnamed protagonist who creates an underground fight club as a form of rebellion against societal norms. As the club evolves into something more sinister, the protagonist becomes entangled in a web of chaos and self-destruction. Featuring outstanding performances by Edward Norton, Brad Pitt, and Helena Bonham Carter, "Fight Club" is a thought-provoking and visually stunning film that challenges viewers to question the status quo and examine the consequences of unchecked aggression and materialism.</p>
                </div>
            </div>
            <div className="reviewList"> 
                <div className="image">
                    <img src="/is.png" alt="Interstellar" />
                </div>
                <div className="reviewContent">
                    <h2>Interstellar</h2>
                    <h3>Rating: 9.0</h3>
                    <p>"Interstellar" is a visually stunning and emotionally captivating science fiction film directed by Christopher Nolan. Set in a future where Earth is becoming uninhabitable, a group of astronauts embarks on a journey through a wormhole in search of a new home for humanity. The film explores themes of love, sacrifice, and the survival of the human race. With breathtaking visuals, a gripping story, and powerful performances from its cast, "Interstellar" is a cinematic experience that leaves a profound impact on its audience.</p>
                </div>
            </div> 
        </div>
    );
}

export default Review;
