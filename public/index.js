/*
 * Name: Suzanne Piver and Miya
 * Date: 5/4/2023
 * Section: CSE 154 AA
 *
 * {ADD DESCRIPTION}
 */

"use strict";

/**
 * encapsulates js functions and runs when script is used
 */
(function() {
  window.addEventListener("load", init);

  /**
   * runs once the window has loaded and DOM is ready to access
   */
  function init() {
    initializeHomePage();
    let signedIn = window.localStorage.getItem('username');
    if (signedIn) {
      id('profile').textContent = signedIn;
    } else {
      id('profile').textContent = 'Log in/Sign up';
    }
    qsa(".scroll-button").forEach(button => button.addEventListener('click', scrollBehavior));
    id("profile").addEventListener("click", loadProfilePage);
    id("logo").addEventListener("click", () => {
      hideOtherPages("home-page");
      uncheckSizes();
    });
    id("add-to-cart").addEventListener("click", addToCart);
    id("cart").addEventListener("click", () => {
      hideOtherPages("checkout-page");
      uncheckSizes();
    });
    //id("checkout-button").addEventListener("click", addReview);
    qsa("#size-buttons button").forEach(button => {
      button.addEventListener("click", toggleChecked);
    });
    id("search-bar").addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        getSearchItems();
      }
    });
    qsa(".homeSwitchButtons").forEach(button => {
      button.addEventListener("click", toggleViews);
    });
  }

 /**----------------------------------------------------------------------------------------------
  * ------------ PROFILE PAGE SECTION START --------------------------------------------------------
  ---------------------------------------------------------------------------------------------- */

  /**
   * takes the user to their profile page
   * No paramaters, returns nothing
   */
  function loadProfilePage() {
    uncheckSizes();
    let name = this.textContent;
    // check the div button content that was clicked
    if (name === 'Log in/Sign up') { // show log in page
      hideOtherPages("login-page");
      let logFields = ['log-name', 'log-password'];
      let signFields = ['sign-name', 'sign-email', 'sign-password'];
      for (let i = 0; i < logFields.length; i++) {
        id(logFields[i]).addEventListener('input', updateLoginBtn);
      }
      for (let i = 0; i < signFields.length; i++) {
        id(signFields[i]).addEventListener('input', updateSignupBtn);
      }
      id('login-btn').addEventListener('click', getLoginInfo);
      id('sign-btn').addEventListener('click', getSignInInfo);
    } else { // show profile/history page
      hideOtherPages("history-page");
      id('logout-btn').addEventListener('click', logout);
    }
  }

  /**
   * Checks if all required inputs in login are filled with characters besides white space.
   * If so, the login button is enabled, otherwise it remains disabled.
   */
  function updateLoginBtn() {
    let user = id('log-name').value.trim();
    let password = id('log-password').value.trim();
    if (user.length > 0 && password.length > 0) {
      id('login-btn').disabled = false;
    } else {
      id('login-btn').disabled = true;
    }
  }

  /**
   * Checks if all required inputs in sign in are filled with characters besides white space.
   * If so, the sign up button is enabled, otherwise it remains disabled.
   */
  function updateSignupBtn() {
    let user = id('sign-name').value.trim();
    let email = id('sign-email').value.trim();
    let password = id('sign-password').value.trim();
    if (user.length > 0 && email.length > 0 && password.length > 0) {
      id('sign-btn').disabled = false;
    } else {
      id('sign-btn').disabled = true;
    }
  }

  /**
   * description
   * No paramaters, returns nothing
   */
  function getLoginInfo() {
    let username = id('log-name').value;
    let password = id('log-password').value;
    id('log-name').value = '';
    id('log-password').value = '';
    performLogin(username, password);
  }

  /**
   * description
   * No paramaters, returns nothing
   */
  function getSignInInfo() {
    let username = id('sign-name').value;
    let email = id('sign-email').value;
    let password = id('sign-password').value;
    performSignUp(username, email, password);
  }

  /**
   * description
   * @param {string} username - descrip
   * @param {string} password -descrip
   * No paramaters, returns nothing
   */
  async function performLogin(username, password) {
    try {
      let data = new FormData();
      data.append('username', username);
      data.append('password', password);
      let res = await fetch('/login', {method: 'POST', body: data});
      await statusCheck(res);
      let name = await res.text();
      updateProfilePage(name, password);
    } catch(err) {
      handleError(err);
    }
  }

  /**
   * description
   * @param {string} username - descrip
   * @param {string} email -descrip
   * @param {string} password -descrip
   * No paramaters, returns nothing
   */
  async function performSignUp(username, email, password) {
    try {
      let data = new FormData();
      data.append('username', username);
      data.append('email', email);
      data.append('password', password);
      let res = await fetch('/newuser', {method: 'POST', body: data});
      await statusCheck(res);
      let newUser = await res.text();
      updateProfilePage(newUser, password);
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * description
   * @param {APIResponse} name - username of user
   * @param {string} password - password of user
   * No paramaters, returns nothing
   */
  function updateProfilePage(name, password) {
    window.localStorage.setItem('username', name);
    window.localStorage.setItem('password', password);
    id('profile').textContent = name;
    hideOtherPages('home-page');
  }

  function logout() {
    window.localStorage.clear();
    hideOtherPages('home-page');
    id('profile').textContent = 'Log in/Sign up';
  }

  /**----------------------------------------------------------------------------------------------
   * ------------ PROFILE PAGE SECTION END --------------------------------------------------------
   ---------------------------------------------------------------------------------------------- */

  /**----------------------------------------------------------------------------------------------
   * ------------ HOME PAGE SECTION START --------------------------------------------------------
   ---------------------------------------------------------------------------------------------- */

  /**
   * descrip
   * @param {string} search - filter for search
   * @returns {response} items - json of items
   * No paramaters, returns nothing
   */
  async function fetchItems(search) {
    try {
      let resp = null;
      if (search) {
        resp = await fetch("/clothes?item=" + search);
      } else {
        resp = await fetch("/clothes");
      }
      await statusCheck(resp);
      let items = await resp.json();
      return items;
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * fetches 12 of each top, bottom, and dress, and adds it to the home page for viewing
   * No paramaters, returns nothing
   */
  async function initializeHomePage() {
    hideOtherPages("home-page");
    let resp = null;
    let categories = ["top", "bottom", "dress"];
    categories.forEach(async cat => {
      resp = await fetchItems(cat);
      for (let i = 0; i < 3; i++) { // three scrolls
        let div = gen('div');
        div.classList.add("imageDiv");
        for (let j = i * 4; j < i * 4 + 4; j++) { // four images in each scroll
          let div2 = gen('div');
          div2.classList.add('scrollImage');
          let item = makeImg("imgs/clothes/" + resp[j]["name"] + '.png', resp[j]["webname"]);
          div2.addEventListener('click', () => itemView(resp[j]));
          let ptag = gen('p');
          ptag.textContent = resp[j]["webname"];
          div2.append(item, ptag);
          div.appendChild(div2);
        }
        id(cat).appendChild(div);
      }
    });
    resp = await fetchItems(null);
    fillGridView(resp, "grid-home-page");
  }

  /**
   * descrop
   * @param {Response} resp - list of items from server as json
   * @param {string} section - id of section being appended too
   */
  function fillGridView(resp, section) {
    if (!(resp.length === 0)) {
      for (let i = 0; i < resp.length; i++) {
        let div = gen('div');
        div.addEventListener('click', () => itemView(resp[i]));
        let ptag = gen('p');
        ptag.textContent = resp[i]["webname"];
        let item = makeImg("imgs/clothes/" + resp[i]["name"] + '.png', resp[i]["webname"]);
        div.append(item, ptag);
        id(section).append(div);
      }
    } else {
      let ptag = gen('p');
      ptag.textContent = "No Items Match this Search";
      id(section).append(ptag);
    }
  }

  /**
   * dscrip
   */
  function toggleViews() {
    if (id('compact-home-page').classList.contains("hidden")) {
      id("grid-button").classList.remove("hidden");
      id("compact-button").classList.add("hidden");
      id('grid-home-page').classList.add("hidden");
      id('compact-home-page').classList.remove("hidden");
    } else {
      id("grid-button").classList.add("hidden");
      id("compact-button").classList.remove("hidden");
      id('grid-home-page').classList.remove("hidden");
      id('compact-home-page').classList.add("hidden");
    }
  }

  /**
   * scrolls the images within a container to the next set of images
   * No paramaters, returns nothing
   */
  function scrollBehavior() {
    // let parentID = this.parentNode.firstElementChild.nextElementSibling.id;
    let scroller = qs("#" + this.parentNode.id + " .scroller-content");
    if (this.classList.contains("left-scroll")) {
      scroller.scrollLeft -= qs("#" + scroller.id + " div").offsetWidth;
    } else {
      scroller.scrollLeft += qs("#" + scroller.id + " div").offsetWidth;
    }
  }

  //----------------------------------------------------------------------------------------------
  // ------------ HOME PAGE SECTION END --------------------------------------------------------
  // ----------------------------------------------------------------------------------------------

  //----------------------------------------------------------------------------------------------
  //------------ SEARCH PAGE SECTION START --------------------------------------------------------
  // ----------------------------------------------------------------------------------------------

  /**
   * descrip
   * No paramaters, returns nothing
   */
  async function getSearchItems() {
    id("search-page").innerHTML = '';
    hideOtherPages("search-page");
    let resp = await fetchItems(id("search-bar").value);
    fillGridView(resp, "search-page");
    id("search-bar").value = '';
  }

/**----------------------------------------------------------------------------------------------
  * ------------ SEARCH PAGE SECTION END --------------------------------------------------------
  ---------------------------------------------------------------------------------------------- */

/**----------------------------------------------------------------------------------------------
  * ------------ ITEM PAGE SECTION START --------------------------------------------------------
  ---------------------------------------------------------------------------------------------- */
  /**
   * descrip
   * @param {Response} resp - sdf
   * No paramaters, returns nothing
   */
  function itemView(resp) {
    console.log("showing Item");
    hideOtherPages("item-page");
    id("item-name").textContent = resp["webname"];
    qs("#item-page img").src = "/imgs/clothes/" + resp["name"] + '.png';
    qs("#item-page img").alt = 'image of ' + resp["webname"];
    id("item-price").textContent = "$" + resp["price"] + ".00";
  }

  /**
   * descrip
   * No paramaters, returns nothing
   */
  function toggleChecked() {
    if (this.classList.contains("checked")) {
      this.classList.remove("checked");
    } else {
      if (qs(".checked")) {
        qs(".checked").classList.remove("checked");
      }
      this.classList.add("checked");
      id("add-to-cart").disabled = true;
    }
    isSizeSelected();
  }

  /**
   * If no size is selected, add to cart is disabled
   * No paramaters, returns nothing
   */
  function isSizeSelected() {
    if (qsa(".checked").length < 1) {
      id("add-to-cart").disabled = true;
    } else {
      id("add-to-cart").disabled = false;
    }
  }

  /**
   * If no size is selected, add to cart is disabled
   * No paramaters, returns nothing
   */
  function uncheckSizes() {
    if (qs(".checked")) {
      qs(".checked").classList.remove("checked");
    }
    isSizeSelected();
  }

//----------------------------------------------------------------------------------------------
// ------------ ITEM PAGE SECTION END ----------------------------------------------------------
// --------------------------------------------------------------------------------------------

//----------------------------------------------------------------------------------------------
// ------------ CHECKOUT PAGE SECTION START ----------------------------------------------------
// --------------------------------------------------------------------------------------------

  // /**
  //  * description
  //  * No paramaters, returns nothing
  //  */
  // async function checkout() {
  //   try {
  //     let items = id("checkout-page");
  //     let data = new FormData();
  //     data.append('username', username);
  //     data.append('password', password);
  //     let res = await fetch('/login', {method: 'POST', body: data});
  //     await statusCheck(res);
  //     res = await res.text();
  //     updateProfilePage(res);
  //   } catch(err) {
  //     console.log(err);
  //     handleError(err);
  //   }
  // }

  /**
   * descrip
   * No paramaters, returns nothing
   */
  function addToCart() {
    let div = gen('div');
    let div2 = gen('div');
    let img = qs("#item-page img").cloneNode(true);
    let name = id("item-name").cloneNode(true);
    name.id = '';
    let price = id("item-price").cloneNode(true);
    price.id = '';
    let size = gen('p');
    size.textContent = qs(".checked").textContent;
    let remove = gen('button');
    remove.textContent = "Remove Item";
    remove.classList.add("remove-button");
    div2.append(name, price, size, remove);
    div.append(img, div2);
    id("checkout-page").prepend(div);
    remove.addEventListener("click", () => remove.parentNode.parentNode.remove()); // remove item
    uncheckSizes();
  }
//----------------------------------------------------------------------------------------------
//------------ CHECKOUT PAGE SECTION END ----------------------------------------------------
// --------------------------------------------------------------------------------------------

//----------------------------------------------------------------------------------------------
// ------------ REVIEW PAGE SECTION START ------------------------------------------------------
// --------------------------------------------------------------------------------------------

  // /**
  //  * If no size is selected, add to cart is disabled
  //  * No paramaters, returns nothing
  //  */
  // function addReview() {
  //   hideOtherPages("review-page");
  // }

//--------------------------------------------------------------------------------------------
// ------------ CHECKOUT PAGE SECTION START ----------------------------------------------------
// --------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------------
// ------------ HELPER FUNCTIONS -------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------

  /**
   * Hides all other pages besides the one that will be displayed
   * @param {string} displayPage - id of the page that will be displayed
   */
  function hideOtherPages(displayPage) {
    let pages = ["home-page", "item-page", "checkout-page",
<<<<<<< HEAD
                  "profile-page", "review-page", "search-page"];
=======
                  "login-page", "review-page", "search-page", "history-page"];
>>>>>>> 9f32c3faaab7c03e156638c00389ef4b4737dee4
    for (let i = 0; i < pages.length; i++) {
      if (pages[i] === displayPage) {
        // unhide
        id(displayPage).classList.remove('hidden');
      } else {
        // hide
        id(pages[i]).classList.add('hidden');
      }
    }
  }

  /**
   * Creates a new image object and sets it's src and alt text
   * @param {string} src - string of the src location of an image
   * @param {string} alt - string of the alt text for an image
   * @returns {object} - DOM img object .
   */
  function makeImg(src, alt) {
    let img = gen('img');
    img.src = src;
    img.alt = alt;
    return img;
  }

  /**
   * Error handler function takes whatever error message occured and pastes it on the webpage.
   * @param {Error} err - error from catch statment
   */
  function handleError(err) {
    let error = gen('p');
    error.textContent = err;
    qs('body').prepend(error);
  }

  /**
   * Checks to ensure no errors occured in fetching data from the API.
   * @param {*} res - the Promise object from the fetch call
   * @return {String} the error text or the Promise object
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} id - element ID.
   * @returns {object} - DOM object associated with id.
   */
  function id(id) {
    return document.getElementById(id);
  }

  /**
   * Returns first element matching selector.
   * @param {string} selector - CSS query selector.
   * @returns {object} - DOM object associated selector.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Returns the array of elements that match the given CSS selector.
   * @param {string} query - CSS query selector
   * @returns {object[]} array of DOM objects matching the query.
   */
  function qsa(query) {
    return document.querySelectorAll(query);
  }

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} element - js element to create
   * @returns {object} - DOM object associated with element.
   */
  function gen(element) {
    return document.createElement(element);
  }
})();