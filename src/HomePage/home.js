import React, { useEffect, useState, useRef } from "react";
import "./home.css";
import axios from 'axios';
import moment from 'moment';

const Home = () => {
  const [userListLoading, updateUserListLoading] = useState(false);
  const [commentListLoading, updateCommentListLoading] = useState(false);
  const [addReviewModalLoading, updateAddReviewModalLoading] = useState(false);
  const [fetchDetail, updateFetchDetail] = useState({});
  const [commentList, updateCommentList] = useState([]);
  const [chipList, updateChipList] = useState({});
  const [addReviewModal, addReviewModalUpdate] = useState(false);
  const [userListData, updateUserListData] = useState([]);
  const [isFormValid, updateIsFormValid] = useState(false);
  const [payloadSearch, updatePayloadSearch] = useState("");
  const [isMobileDevice, updateIsMobileDevice] = useState(false);
  const _ = require('lodash');
  const [payload, updatePayload] = useState({
    rating: "",
    chips: [],
    commentId: ""
  });

  const chipListFunc = async () => {
    updateAddReviewModalLoading(true);
    const url = `${window.API_URL}/chips`;
    const response = await fetch(url);
    let data = await response.json();
    updateAddReviewModalLoading(false);
    updateChipList(data?.data);
  }

  const userListDataFunc = async () => {
    updateUserListLoading(true);
    const url = `${window.API_URL}/users`;
    const response = await fetch(url);
    let data = await response.json();
    updateUserListLoading(false);
    updateUserListData(data?.data);
  }

  const commentListFunc = async (pk) => {
    updateCommentListLoading(true);
    const url = `${window.API_URL}/comments/${pk}`;
    const response = await fetch(url);
    let data = await response.json();
    updateCommentListLoading(false);
    updateCommentList(data?.data?.comments?.sort((a, b) => b?.commentId - a?.commentId));
  }

  useEffect(() => {
    userListDataFunc();
    chipListFunc();
    checkMobileDevice();
  }, [])

  const fetchDetailFunc = (pk) => {
    updateFetchDetail(userListData?.find(val => val?.pk === pk));
    commentListFunc(pk);
  }

  const addReviewModalFunc = () => {
    addReviewModalUpdate(!addReviewModal);
    // if (!addReviewModal) {
    //   disableBodyScroll();
    // }
    // else {
    //   enableBodyScroll();
    // }
  }

  const addReviewSubmitHandler = (event) => {
    event.preventDefault();
    updateCommentListLoading(true)
    const url = `${window.API_URL}/addComment/${fetchDetail?.pk}`;

    if (payload?.chips?.length === 0 && payload?.rating === "") {
      updateIsFormValid(true)
      return;
    }
    else {
      updateIsFormValid(false)
    }

    commentList?.push(payload)
    addReviewModalUpdate(false);
    axios.patch(url, commentList)
      .then((res) => {
        updateCommentListLoading(false);
        addReviewModalUpdate(false);
        updatePayload({
          rating: "",
          chips: [],
          commentId: ""
        });
        commentListFunc(fetchDetail?.pk);
      })
      .catch((err) => {
        updateCommentListLoading(false)
      });
  }

  const addReviewValueHandler = (event, chipValue, chipName) => {
    const value = event?.target?.value ? event?.target?.value : payload?.rating;

    let chipsArr = [...payload?.chips];

    if (chipName === "chips") {
      if (chipsArr?.includes(chipValue)) {
        const chipsIndex = chipsArr?.findIndex(val => val === chipValue);
        chipsArr?.splice(chipsIndex, 1)
      }
      else {
        chipsArr.push(chipValue);
      }
    }

    updatePayload({
      rating: value,
      chips: chipsArr,
      commentId: commentList?.length + 1,
      date: Date.now()
    })
  }

  const searchHandler = async (event) => {
    const value = event.target.value;
    if (value.length > 0 && value.trim()?.length === 0) return;
    updatePayloadSearch(value);
    debouncedFunction(value);
  }

  const debouncedFunction = useRef(_.debounce(async (value) => {
    updateUserListLoading(true);
    const url = `${window.API_URL}/users/${value}`;
    const response = await fetch(url);
    let data = await response.json();
    updateUserListLoading(false);
    updateUserListData(data?.data);
  }, 500)).current;

  // // Function to disable body scroll
  // const disableBodyScroll = () => {
  //   document.body.style.overflow = 'hidden';
  // };

  // // Function to enable body scroll
  // const enableBodyScroll = () => {
  //   document.body.style.overflow = ''; // Set back to default (allow scrolling)
  // };

  const checkMobileDevice = () => {
    const isMobile = window.matchMedia('(max-width: 473px)').matches;

    if (isMobile) {
      updateIsMobileDevice(true);
    } else {
      updateIsMobileDevice(false);
    }
  }

  return <div div className="container" >
    {
      <div>
        <div className="dashboardTitle">OPEN FEEDBACK (किसी को कुछ पता नहीं चलेगा)</div>
        <div className="dashboardContainer">
          <div className="nameCol">
            <div className="scrollView">
              <div className="nameSearch">
                <input value={payloadSearch} onChange={searchHandler} placeholder="Enter name for search" />
              </div>
              {userListLoading ? <div className="loader"></div> : <div>
                {userListData.length > 0 ? userListData?.map(val =>
                  <div key={val?.pk} className="nameInfo" onClick={() => fetchDetailFunc(val?.pk)}>
                    <div>
                      <img className="userProfilePic" alt="" src={`https://robohash.org/${val.name}`} />
                    </div>
                    <div className="userName">
                      {val?.name}<br />
                      <p className="listDesingation">({val?.designation})</p>
                    </div>
                  </div>
                ) : <p className="noDataUser">No Data Available</p>
                }
              </div>
              }
            </div>
          </div>
          <div className="detailCol">
            {Object.keys(fetchDetail).length > 0 ?
              <div>
                <div className="nameHeader">
                  {fetchDetail?.name} ({fetchDetail?.designation})
                </div>
                {commentListLoading ? <div className="loader"></div> :
                  <div className="nameDetails">
                    <div className="viewPart">
                      {commentList?.length > 0 ? commentList?.map((val) => <div key={val?.commentId} className="commentMsg">
                        <h5>Comment Id-{val?.commentId} <span className="commentDate">({moment(val?.date).format('DD-MMM-YYYY HH:mm:ss')})</span></h5>
                        <p>{val?.rating.length > 0 &&
                          Array(parseInt(val?.rating)).fill(0)?.map((val, index) => <img key={index} className="commentStar" alt="" src={require('./filled-star.png')} />)
                        }</p>
                        <p
                          className="chipNameContainer"
                        >
                          {val.chips.map((name) => <div key={name} className={chipList?.positive?.includes(name) ? "chipName chipPositive" : "chipName chipNegative"}>{name}</div>)}</p>
                      </div>)
                        : <p className="noFeedBackText">No Comments Added Yet.<br />Be the first one to add.</p>
                      }
                    </div>
                  </div>
                }
                <div className="floatingButton" onClick={addReviewModalFunc}>Add Review</div>
              </div>
              :
              <div>
                <div className="noUserSelect"> Please select a name from the {isMobileDevice ? "above" : "left"} menu </div>
                <div className="leftIcon">
                  {isMobileDevice ?
                    <i className="fa fa-arrow-up" aria-hidden="true"></i> :
                    <i className="fa fa-arrow-left" aria-hidden="true"></i>}
                </div>
              </div>
            }
          </div>
        </div>
        {addReviewModal && <div>
          <div className="openFeedbackFormShadow"></div>
          <div className="openFeedbackForm">
            <div className="title">Add Review</div>
            {addReviewModalLoading ? <div className="loader"></div> :
              <form onSubmit={addReviewSubmitHandler}>
                <button className="closeFeedbackForm" onClick={addReviewModalFunc}>X</button>
                <div className="rating">
                  <input type="radio" id="star5" name="rating" onChange={addReviewValueHandler} value="5" />
                  <label for="star5"></label>
                  <input type="radio" id="star4" name="rating" onChange={addReviewValueHandler} value="4" />
                  <label for="star4"></label>
                  <input type="radio" id="star3" name="rating" onChange={addReviewValueHandler} value="3" />
                  <label for="star3"></label>
                  <input type="radio" id="star2" name="rating" onChange={addReviewValueHandler} value="2" />
                  <label for="star2"></label>
                  <input type="radio" id="star1" name="rating" onChange={addReviewValueHandler} value="1" />
                  <label for="star1"></label>
                </div>
                <div className="chipPartition">
                  <div className="chipContainerLeft">
                    {chipList?.positive?.map((val) => <div key={val} onClick={(event) => addReviewValueHandler(event, val, "chips")} className={payload?.chips.length > 0 && payload?.chips.every(item => (chipList?.positive.includes(item) || chipList?.negative.includes(item)) && payload?.chips.includes(val)) ? "chip chipPositive activeChip" : "chip chipPositive"}>{val}</div>)}
                  </div>
                  <div className="chipContainerRight">
                    {chipList?.negative?.map((val) => <div key={val} onClick={(event) => addReviewValueHandler(event, val, "chips")} className={payload?.chips.length > 0 && payload?.chips.every(item => (chipList?.positive.includes(item) || chipList?.negative.includes(item)) && payload?.chips.includes(val)) ? "chip chipNegative activeChip" : "chip chipNegative"}>{val}</div>)}
                  </div>
                </div>
                {isFormValid && <p className="errorMsg">Please click either of the options.</p>}
                <input className="formSubmitButton" type="submit" value={"Submit"} />
              </form>
            }
          </div>
        </div>}
      </div>
    }
  </div >
}
export default Home;
