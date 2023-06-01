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
    /*
     *when you type in search and hit enter do something
     *when you click product do something
     *when you click logo do something
     *when you click scroll arrow scroll to next images
     *when you click on cart image do something
     *when you click on a profile drop down item, do something X drop down items
     */
    qsa(".scroll-button").forEach(button => button.addEventListener('click', scrollBehavior));
    id("profile").addEventListener("click", loadProfilePage);
    id("logo").addEventListener("click", loadMainPage);
    // id("cart").addEventListener("click", loadCartPage);
  }

  /**
   * Hides all other pages besides the one that will be displayed
   * @param {string} displayPage - id of the page that will be displayed
   */
  function hideOtherPages(displayPage) {
    let pages = ["home-page", "item-page", "checkout-page", "profile-page", "review-page"];
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
   * takes the user to their current cart of items
   * No paramaters, returns nothing
   */
  function loadCartPage() {
    clearPage();
    let cartMsg = gen('p');
    cartMsg.textContent = "There are no items in your cart :(";
    id("temp-msgs").appendChild(cartMsg);

    // need to add cart page details
  }

  /**
   * takes the user to their profile page
   * No paramaters, returns nothing
   */
  function loadProfilePage() {
    hideOtherPages("profile-page");
    let name = this.textContent;
    // check the div button content that was clicked
    if (name === 'Log in/Sign up') {
      // show log in page
      id('user-view').classList.add('hidden');
      id('login-signup').classList.remove('hidden');
      id('login-btn').addEventListener(getLoginInfo);
      id('sign-btn').addEventListener(performSignUp);
    } else {
      id('user-view').classList.remove('hidden');
      id('login-signup').classList.add('hidden');
      // show profile page
    }
    // need to add profile page details
  }
  function getLoginInfo() {
    let username = id('log-name').value;
    let password = id('log-password').value;
    id('log-name').value = '';
    id('log-password').value = '';
    performLogin(username, password);
  }

  async function performLogin(username, password) {
    try {
      let data = new FormData();
      data.append('username', username);
      data.append('password', password);
      let res = await fetch('/login', {method: 'POST', body: data});
      await statusCheck(res);
      res = await res.text();
      updateProfilePage(res);
    } catch {
      console.log(err);
      handleError(err);
    }
  }

  function getSignInInfo() {
    let username = id('sign-name').value;
    let email = id('sign-email').value;
    let password = id('sign-password').value;
  }

  async function performSignUp(username, email, password) {
    try {
      let data = new FormData();
      data.append('username', username);
      data.append('email', email);
      data.append('password', password);
      let res = await fetch('/newuser', {method: 'POST', body: data});
      await statusCheck(res);
      res = await res.text();
      updateProfilePage(res);
    } catch (err) {
      handleError(err);
    }
  }

  function updateProfilePage(res) {
    id('profile').textContent = res;
    loadProfilePage();
  }



  /**
   * returns user to the main page of the website
   * No paramaters, returns nothing
   */
  function loadMainPage() {
    id("home-page").classList.remove("hidden");
    id("profile-page").classList.add("hidden");
  }

  /**
   * descrip
   * @param {response} resp - response json object from backend
   * No paramaters, returns nothing
   */
  function initializeHomePage(resp) {
    let item = null;
    for (let i = 0; i < (resp.length() / 4); i++) {
      let div = gen('div');
      for (let j = i; j < i+4; j++ ) {
        item = makeImg(resp[0]["shortname"] + '.png', 'image of ' + resp[0]["shortname"]);
      }
      div.appendChild(item);
    }
    loadMainPage();
  }

  /**
   *
   * No paramaters, returns nothing
   */
  function fetchAllItems() {
    fetch("/clothes")
      .then(statusCheck)
      .then(resp => resp.json())
      .then(initializeHomePage)
      .catch(handleError);
  }

  /**
   * clears all content on webpage except the website header
   * No paramaters, returns nothing
   */
  function clearPage() {
    id("everything-but-header").classList.add("hidden");
    id("temp-msgs").innerHTML = "";
    id("temp-msgs").classList.remove("hidden");

    // id("everything-but-header").innerHTML = ""; may need later when dynamically adding content
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

  // -------------------------HELPER FUNCTIONS---------------------------

  /**
   * Creates a new image object and sets it's src and alt text
   * @param {string} src - string of the src location of an image
   * @param {string} alt - string of the alt text for an image
   * @returns {object} - DOM img object .
   */
  function makeImg(src, alt) {
    let img = gen('img');
    img.src = 'img/clothes/' + src;
    img.alt = alt;
    return img;
  }

  /**
   * Error handler function takes whatever error message occured and pastes it on the webpage.
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