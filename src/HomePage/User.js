import React, { useEffect, useState } from "react";
import moment from "moment";
import { chipListState, Users } from "./constants";
import AddReviewModal from "./AddReviewModal";
import Skeleton from "./Skeleton";
import Header from "./Header";

const User = () => {
  const [selectedUser, setSelectedUser] = useState(null); // selected user
  const [commentList, setCommentList] = useState([]);
  const [chipList, setChipList] = useState({});
  const [userListData, setUserListData] = useState([]); // filtered list
  const [originalUsers, setOriginalUsers] = useState([]); // original list (IMPORTANT)
  const [addReviewModal, setAddReviewModal] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hoverRating, setHoverRating] = useState(0);
  const [fetchDetails, setFetchDetails] = useState({});
  const [suggestionText, setSuggestionText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [payload, setPayload] = useState({
    rating: "",
    chips: [],
    comment: "",
  });

  const storedData = JSON.parse(localStorage.getItem("data")) || {};

  /**
   * LOAD DATA FROM LOCAL STORAGE
   * Expecting structure:
   * {
   *   id: "...",
   *   teammates: []
   * }
   */

  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem("users")) || Users;
    const currentUser = storedUsers?.find(
      (val) => val.email === storedData?.email
    );

    const fetchDetails = storedUsers?.find((val) => val.id === storedData.id);

    const userList = currentUser?.teammates || [];

    setOriginalUsers(userList);
    setUserListData(userList);
    setChipList(chipListState);

    setLoading(false);
    setFetchDetails(fetchDetails);
  }, []);

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("data")) || {};
    const storedUsers = JSON.parse(localStorage.getItem("users")) || Users;

    // find logged-in user
    const currentUser = storedUsers.find(
      (user) => user.email === storedData?.email
    );

    // set suggestions of that user
    setSuggestions(currentUser?.suggestions || []);
  }, []);

  /**
   * FETCH SELECTED USER DETAILS
   */
  const fetchDetailFunc = (id) => {
    setLoading(true);

    const user = originalUsers.find((u) => u.id === id);
    setSelectedUser(user);

    setCommentList(user?.reviews || []);

    setLoading(false);
  };

  /**
   * ADD REVIEW
   */
  const addReviewSubmitHandler = (e) => {
    e.preventDefault();

    // validation
    if (!payload?.rating && payload?.chips.length === 0) {
      setIsFormValid(true);
      return;
    }

    const categorizedChips = {
      positive: payload.chips.filter((chip) =>
        chipList?.positive?.includes(chip)
      ),
      negative: payload.chips.filter((chip) =>
        chipList?.negative?.includes(chip)
      ),
    };

    const newComment = {
      rating: payload?.rating,
      chips: categorizedChips,
      commentId: Date.now(),
      date: Date.now(),
      reviewBy: fetchDetails?.name,
      designation: fetchDetails?.designation,
      comment: payload?.comment,
    };

    // Update users array (reviews added)
    const updatedUsers = originalUsers.map((user) => {
      if (user.id === selectedUser.id) {
        return {
          ...user,
          reviews: [...(user.reviews || []), newComment],
        };
      }
      return user;
    });

    // Update state
    setOriginalUsers(updatedUsers);
    setUserListData(updatedUsers);

    const updatedUser = updatedUsers.find((u) => u.id === selectedUser.id);
    setSelectedUser(updatedUser);
    setCommentList(updatedUser.reviews);

    // Update USERS in localStorage properly
    const storedUsers = JSON.parse(localStorage.getItem("users")) || Users;

    const updatedStoredUsers = storedUsers.map((user) => {
      // match logged-in user (assuming selectedUser belongs to this user’s teammates)
      if (user.email === selectedUser.email) {
        return {
          ...user,
          reviews: updatedUser.reviews, // update reviews directly
        };
      }

      // also update teammates if needed
      if (user.teammates?.length) {
        return {
          ...user,
          teammates: user.teammates.map((t) =>
            t.id === selectedUser.id
              ? { ...t, reviews: updatedUser.reviews }
              : t
          ),
        };
      }

      return user;
    });

    // Save correctly (array, not object)
    localStorage.setItem("users", JSON.stringify(updatedStoredUsers));

    // reset
    setPayload({ rating: "", chips: [] });
    setAddReviewModal(false);
    setIsFormValid(false);
  };

  /**
   * CHIP SELECT TOGGLE
   */
  const addReviewValueHandler = (e, chip, type) => {
    let chipsArr = [...payload.chips];

    if (type === "chips") {
      chipsArr = chipsArr.includes(chip)
        ? chipsArr.filter((c) => c !== chip)
        : [...chipsArr, chip];
    }

    setPayload({ ...payload, chips: chipsArr });
  };

  const isChipActive = (chip) => payload.chips.includes(chip);

  /**
   * SEARCH (DEBOUNCED)
   * Uses originalUsers to avoid losing data
   */
  useEffect(() => {
    const handler = setTimeout(() => {
      if (!searchTerm.trim()) {
        setUserListData(originalUsers);
      } else {
        const filtered = originalUsers.filter((u) =>
          u.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setUserListData(filtered);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, originalUsers]);

  const handleSuggestionSubmit = () => {
    if (!suggestionText.trim()) return;

    const newSuggestion = {
      id: Date.now(),
      suggestion: suggestionText,
      date: Date.now(),
    };

    const updatedSuggestions = [newSuggestion, ...suggestions];

    setSuggestions(updatedSuggestions);

    const storedUsers = JSON.parse(localStorage.getItem("users")) || Users;

    const updatedStoredUsers = storedUsers.map((user) => {
      if (user?.email === fetchDetails?.email) {
        return {
          ...user,
          suggestions: updatedSuggestions,
        };
      }

      return user;
    });

    localStorage.setItem("users", JSON.stringify(updatedStoredUsers));

    setSuggestionText(""); // reset
  };

  return (
    <div className="h-[100vh] p-4 bg-gray-100">
      <Header />

      <div className="flex gap-5">
        {/* LEFT PANEL */}
        <div className="w-1/5 bg-white p-4 rounded-xl shadow h-[calc(100vh-150px)] flex flex-col">
          {/* SEARCH */}
          <div className="mb-3">
            <input
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search teammates..."
              className="w-full p-2.5 rounded-xl border focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          {/* USER LIST */}
          <div className="flex-1 overflow-auto">
            {loading ? (
              <Skeleton />
            ) : userListData.length === 0 ? (
              <div className="text-center text-gray-400 mt-10">
                No teammates found
              </div>
            ) : (
              userListData.map((user) => (
                <div
                  key={user.id}
                  onClick={() => fetchDetailFunc(user.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                    selectedUser?.id === user.id
                      ? "bg-blue-100 border-blue-300 shadow-sm"
                      : "bg-white hover:bg-gray-50 border-transparent hover:border-gray-200"
                  }`}
                >
                  <img
                    src={user.avatar}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border"
                  />

                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800">
                      {user.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {user.designation}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 bg-white p-4 rounded-2xl shadow-lg h-[calc(100vh-150px)] w-4/5 flex flex-col">
          {!selectedUser && (
            <div className="flex justify-between items-center mb-4">
              <div className="text-lg font-semibold">My Ratings & Reviews</div>

              <button
                onClick={() => setIsSuggestionModalOpen(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600"
              >
                + Add Suggestion
              </button>
            </div>
          )}
          {!selectedUser ? (
            loading ? (
              <Skeleton />
            ) : fetchDetails?.reviews?.length === 0 ? (
              <div className="flex items-center justify-center h-[50vh] text-gray-400 mt-20 text-2xl">
                No reviews available
              </div>
            ) : (
              <div className="space-y-4 overflow-auto h-[74vh]">
                {fetchDetails?.reviews?.map((c) => (
                  <div
                    key={c.commentId}
                    className="p-5 rounded-2xl border bg-gray-50 hover:shadow-lg"
                  >
                    {/* DATE */}
                    <div className="text-xs text-gray-400 mb-2">
                      {moment(c.date).format("DD MMM YYYY • HH:mm")}
                    </div>

                    {/* STARS */}
                    <div className="text-yellow-400 text-3xl mb-4">
                      {"★".repeat(c.rating)}
                      <span className="text-gray-300">
                        {"★".repeat(5 - c.rating)}
                      </span>
                    </div>

                    {/* CHIPS */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {[
                        ...(c.chips?.positive || []),
                        ...(c.chips?.negative || []),
                      ].map((chip) => {
                        const isPositive = chipList?.positive?.includes(chip);

                        return (
                          <span
                            key={chip}
                            className={`px-4 py-2 text-sm rounded-full border ${
                              isPositive
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {chip}
                          </span>
                        );
                      })}
                    </div>
                    <div>
                      {c.comment ? (
                        <div className="bg-gray-50 text-sm text-gray-700 leading-relaxed">
                          Comments : {c.comment}
                        </div>
                      ) : (
                        <div className="text-gray-400 text-xs italic">
                          No comment provided
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <>
              {/* HEADER */}
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">
                    {selectedUser.name}
                  </h2>
                  <p className="text-gray-500 text-md">
                    {selectedUser.designation}
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="bg-blue-100 text-blue-700 px-5 py-2 rounded-xl hover:bg-blue-200"
                  >
                    My Reviews
                  </button>
                  <button
                    onClick={() => setAddReviewModal(true)}
                    className="bg-blue-500 text-white px-5 py-2 rounded-xl shadow hover:bg-blue-600"
                  >
                    + Add Review
                  </button>
                </div>
              </div>

              {/* CONTENT */}
              {loading ? (
                <Skeleton />
              ) : commentList.length === 0 ? (
                <div className="flex items-center justify-center h-[50vh] text-gray-400 mt-20 text-2xl">
                  No reviews yet
                </div>
              ) : (
                <div className="space-y-4 overflow-auto h-[69vh]">
                  {commentList
                    .filter((c) => c.reviewBy === storedData.name)
                    .map((c) => (
                      <div
                        key={c.commentId}
                        className="p-5 rounded-2xl border bg-gray-50 hover:shadow-lg"
                      >
                        {/* DATE */}
                        <div className="text-xs text-gray-400 mb-2">
                          {moment(c.date).format("DD MMM YYYY • HH:mm")}
                        </div>

                        {/* STARS */}
                        <div className="text-yellow-400 text-3xl mb-4">
                          {"★".repeat(c.rating)}
                          <span className="text-gray-300">
                            {"★".repeat(5 - c.rating)}
                          </span>
                        </div>

                        {/* CHIPS */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {[
                            ...(c.chips?.positive || []),
                            ...(c.chips?.negative || []),
                          ].map((chip) => {
                            const isPositive =
                              chipList?.positive?.includes(chip);

                            return (
                              <span
                                key={chip}
                                className={`px-4 py-2 text-sm rounded-full border ${
                                  isPositive
                                    ? "bg-green-50 text-green-700"
                                    : "bg-red-50 text-red-700"
                                }`}
                              >
                                {chip}
                              </span>
                            );
                          })}
                        </div>

                        <div>
                          {c.comment ? (
                            <div className="bg-gray-50 text-sm text-gray-700 leading-relaxed">
                              Comments : {c.comment}
                            </div>
                          ) : (
                            <div className="text-gray-400 text-xs italic">
                              No comment provided
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {isSuggestionModalOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* BACKDROP */}
          <div
            className="flex-1 bg-black/40"
            onClick={() => setIsSuggestionModalOpen(false)}
          />

          {/* SLIDE PANEL */}
          <div className="w-[500px] h-full bg-white shadow-xl p-5 flex flex-col animate-slideIn">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Add your suggestions</h2>
              <button onClick={() => setIsSuggestionModalOpen(false)}>✕</button>
            </div>

            {/* INPUT */}
            <textarea
              value={suggestionText}
              onChange={(e) => setSuggestionText(e.target.value)}
              maxLength={200}
              placeholder="Write your suggestion here..."
              className="w-full h-[150px] p-3 border rounded-xl mb-1 resize-none"
            />
            <div className="text-xs text-gray-500 text-right mb-3">
              {suggestionText.length} / 200 characters
            </div>

            <button
              onClick={handleSuggestionSubmit}
              className="bg-blue-500 text-white py-2 rounded-xl mb-4"
            >
              Submit
            </button>

            {/* LIST */}
            <div className="flex-1 overflow-y-auto space-y-3">
              <div className="text-lg font-md">My suggestions</div>
              <div className="h-[60vh] overflow-auto">
                {suggestions.length > 0 ? (
                  suggestions.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 border rounded-xl bg-gray-50 mb-4 break-words"
                    >
                      <div className="text-xs text-gray-400 mb-1">
                        {moment(item.date).format("DD MMM YYYY • HH:mm")}
                      </div>
                      <div className="text-sm">{item.suggestion}</div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No suggestions yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL */}
      {addReviewModal && (
        <AddReviewModal
          payload={payload}
          setPayload={setPayload}
          hoverRating={hoverRating}
          setHoverRating={setHoverRating}
          chipList={chipList}
          isChipActive={isChipActive}
          addReviewValueHandler={addReviewValueHandler}
          addReviewSubmitHandler={addReviewSubmitHandler}
          setAddReviewModal={setAddReviewModal}
          isFormValid={isFormValid}
          setIsFormValid={setIsFormValid}
        />
      )}
    </div>
  );
};

export default User;
