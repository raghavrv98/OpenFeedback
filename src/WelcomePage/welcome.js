import React from "react";
import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-4xl h-[70vh] w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl text-white">
        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 text-red-500 tracking-wide">
          ⚠ Disclaimer
        </h1>

        {/* Divider */}
        <div className="h-[1px] bg-white/10 mb-6" />

        <div className="flex flex-col items-center justify-center h-[50vh]">
          {/* English */}
          <p className="text-gray-300 md:text-2xl leading-relaxed mb-14 text-center">
            This feedback platform is all in good fun! It's not meant to offend
            anyone. Please use it wisely and remember, it's just for laughs.
            Reality check: no real connections or deep meanings here. Enjoy the
            light-heartedness!
          </p>

          {/* Hindi */}
          <p className="text-gray-300 md:text-2xl leading-relaxed mb-14 text-center text-sm md:text-base">
            यह फीडबैक प्लेटफ़ॉर्म बिल्कुल मज़ेदार है! इसका उद्देश्य किसी को ठेस
            पहुंचाना नहीं है। कृपया इसे बुद्धिमानी से उपयोग करें और याद रखें, यह
            केवल हंसने के लिए है। वास्तविकता की जाँच: यहाँ कोई वास्तविक संबंध या
            गहरे अर्थ नहीं हैं। हल्के-फुल्केपन का आनंद लें!
          </p>

          {/* Marathi */}
          <p className="text-gray-300 md:text-2xl leading-relaxed mb-8 text-center text-sm md:text-base">
            हे अभिप्राय व्यासपीठ केवळ मनोरंजनासाठी आहे! कोणालाही दुखावण्याचा
            याचा हेतू नाही. कृपया याचा सुज्ञपणे वापर करा आणि लक्षात ठेवा, हे
            फक्त गंमतीसाठी आहे. वास्तविकता: येथे कोणताही खरा संबंध किंवा गहन
            अर्थ दडलेला नाही. या हलक्याफुलक्या वातावरणाचा आनंद घ्या!
          </p>

          {/* Button */}
          <div className="flex justify-center">
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 transition text-white font-medium shadow-lg"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
