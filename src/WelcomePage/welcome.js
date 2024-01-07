import React from "react";
import { useNavigate } from 'react-router-dom';

const Welcome = () => {

  const navigate = useNavigate();

  return <div className="parentContainer">
    <div className="welcomeContainer">
      <h1 className="welcomeMsg">Disclaimer</h1><br />
      <p className="english">This feedback Platform is all in good fun! It's not meant to offend anyone. Please use it wisely and remember, it's just for laughs. Reality check: no real connections or deep meanings here. Enjoy the light-heartedness!"</p><br />
      <p className="hindi">यह फीडबैक प्लेटफ़ॉर्म बिल्कुल मज़ेदार है! इसका उद्देश्य किसी को ठेस पहुंचाना नहीं है. कृपया इसे बुद्धिमानी से उपयोग करें और याद रखें, यह केवल हंसने के लिए है। वास्तविकता की जाँच: यहाँ कोई वास्तविक संबंध या गहरे अर्थ नहीं हैं। हल्के-फुल्केपन का आनंद लें!"</p><br />
      <p className="tip">Tip: किसी को भी किसी का पता नहीं चलेगा इसलिए खुलकर फीडबैक दें।</p>
      <button onClick={() => navigate('/dashboard')} className="getStarted">Let's Start</button>
    </div>
  </div>
}
export default Welcome;
