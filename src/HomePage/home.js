import React, { useEffect, useState } from "react";
import "./home.css";
import axios from 'axios';

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
    updateCommentList(data?.data?.comments);
  }

  useEffect(() => {
    userListDataFunc();
    chipListFunc();
  }, [])

  const fetchDetailFunc = (pk) => {
    updateFetchDetail(userListData?.find(val => val?.pk === pk));
    commentListFunc(pk);
  }

  const addReviewModalFunc = () => {
    addReviewModalUpdate(!addReviewModal);
  }

  const addReviewSubmitHandler = (event) => {
    event.preventDefault();
    addReviewModalUpdate(false);
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
    axios.patch(url, commentList)
      .then((res) => {
        updateCommentListLoading(false);
        addReviewModalUpdate(false);
        updatePayload({
          rating: "",
          chips: [],
          commentId: ""
        });
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
      commentId: commentList?.length + 1
    })
  }

  return <div div className="container" >
    {
      <div>
        <div className="dashboardTitle">OPEN FEEDBACK (किसी को कुछ पता नहीं चलेगा)</div>
        <div className="dashboardContainer">
          <div className="nameCol">
            <div className="scrollView">
              <div className="nameSearch">
                <input placeholder="Enter name for search" />
              </div>
              {userListLoading ? <div class="loader"></div> : <div>
                {userListData?.map(val =>
                  <div key={val?.pk} className="nameInfo" onClick={() => fetchDetailFunc(val?.pk)}>
                    <div>
                      <img className="userProfilePic" alt="" src={`https://robohash.org/${val.name}`} />
                    </div>
                    <div className="userName">
                      {val?.name}<br />
                      <p className="listDesingation">({val?.designation})</p>
                    </div>
                  </div>
                )}
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
                {commentListLoading ? <div class="loader"></div> :
                  <div className="nameDetails">
                    <div className="viewPart">
                      {commentList?.length > 0 ? commentList?.map((val) => <div key={val?.commentId} className="commentMsg">
                        <h5>Comment Id-{val?.commentId}</h5>
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
                <div className="noUserSelect"> Please select a name from the left menu </div>
                <div className="leftIcon">
                  <i class="fa fa-arrow-left" aria-hidden="true"></i>
                </div>
              </div>
            }
          </div>
        </div>
        {addReviewModal && <div>
          <div className="openFeedbackFormShadow"></div>
          <div className="openFeedbackForm">
            <div className="title">Add Review</div>
            {addReviewModalLoading ? <div class="loader"></div> :
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
                    {chipList?.positive?.map((val) => <div key={val} onClick={(event) => addReviewValueHandler(event, val, "chips")} className={"chip chipPositive"}>{val}</div>)}
                  </div>
                  <div className="chipContainerRight">
                    {chipList?.negative?.map((val) => <div key={val} onClick={(event) => addReviewValueHandler(event, val, "chips")} className={"chip chipNegative"}>{val}</div>)}
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
