// components/AddReviewModal.jsx

import React from "react";

const AddReviewModal = ({
  payload,
  setPayload,
  hoverRating,
  setHoverRating,
  chipList,
  isChipActive,
  addReviewValueHandler,
  addReviewSubmitHandler,
  setAddReviewModal,
  isFormValid,
  setIsFormValid, // ✅ added
}) => {
  const isInvalid = !payload.rating && payload.chips.length === 0;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl w-[900px] h-[80vh] shadow-xl flex flex-col">
        {/* HEADER */}
        <div className="p-5 border-b text-center font-semibold text-lg">
          Add Review
        </div>

        {/* VALIDATION MESSAGE */}
        {isFormValid && isInvalid && (
          <p className="text-red-500 text-center mt-3">
            Select rating or chips
          </p>
        )}

        {/* BODY */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* STARS */}
          <div className="flex justify-center gap-3 py-6">
            {[1, 2, 3, 4, 5].map((val) => (
              <button
                key={val}
                onMouseEnter={() => setHoverRating(val)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => {
                  setPayload({
                    ...payload,
                    rating: payload.rating === val ? 0 : val,
                  });

                  // ✅ clear error
                  setIsFormValid(false);
                }}
                className={`text-5xl transition ${
                  (hoverRating || payload.rating) >= val
                    ? "text-yellow-400 scale-110 drop-shadow-[0_0_10px_rgba(250,204,21,0.9)]"
                    : "text-gray-300 hover:text-yellow-300"
                }`}
              >
                ★
              </button>
            ))}
          </div>

          {/* CHIPS */}
          <div className="flex flex-1 gap-6 px-6 overflow-hidden">
            {/* GOOD */}
            <div className="w-1/2 flex flex-col">
              <h4 className="text-green-600 font-semibold mb-3">Good Skills</h4>

              <div className="flex flex-wrap gap-3 overflow-y-auto">
                {chipList?.positive?.map((chip) => (
                  <span
                    key={chip}
                    onClick={(e) => {
                      addReviewValueHandler(e, chip, "chips");

                      // ✅ clear error
                      setIsFormValid(false);
                    }}
                    className={`px-4 py-2 rounded-full cursor-pointer border ${
                      isChipActive(chip)
                        ? "bg-green-500 text-white"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            {/* BAD */}
            <div className="w-1/2 flex flex-col">
              <h4 className="text-red-600 font-semibold mb-3">
                Areas to Improve
              </h4>

              <div className="flex flex-wrap gap-3 overflow-y-auto">
                {chipList?.negative?.map((chip) => (
                  <span
                    key={chip}
                    onClick={(e) => {
                      addReviewValueHandler(e, chip, "chips");

                      // ✅ clear error
                      setIsFormValid(false);
                    }}
                    className={`px-4 py-2 rounded-full cursor-pointer border ${
                      isChipActive(chip)
                        ? "bg-red-500 text-white"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* COMMENT */}
          <div className="px-6 mt-4 pb-3">
            <textarea
              placeholder="Add a comment (optional)..."
              value={payload.comment || ""}
              maxLength={200}
              onChange={(e) =>
                setPayload({
                  ...payload,
                  comment: e.target.value,
                })
              }
              className="w-full h-24 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 mb-1 resize-none"
            />
            <div className="text-xs text-gray-500 text-right">
              {(payload.comment || "").length} / 200
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t flex gap-4">
          <button
            onClick={() => setAddReviewModal(false)}
            className="w-1/2 py-2 border rounded-xl"
          >
            Cancel
          </button>

          <button
            onClick={addReviewSubmitHandler}
            // disabled={isInvalid}
            className="w-1/2 py-2 rounded-xl text-white bg-blue-500 hover:bg-blue-600"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddReviewModal;
