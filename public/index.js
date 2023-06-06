/*
 * Name: Suzanne Piver and Miya
 * Date: 5/4/2023
 * Section: CSE 154 AA
 *
 * This is the index.js file for our e-commerce final project webpage. It is in charge of all the
 * functionalities and user-interactions of the webpage specifically containing navigation of a
 * home-page, cart, user, transaction, and review page
 * All included clothing images are from the Free People clothing company's website: https://www.freepeople.com/?ref=logo
 */

"use strict";

/**
 * encapsulates js functions and runs when script is used
 */
(function() {
  window.addEventListener("load", init);

  /**
   * runs once the window has loaded and DOM is ready to access
   * contains the eventlisteners and page setup details
   */
  function init() {
    initializeHomePage();
    setupPageChangeEventListeners();
    let signedIn = window.localStorage.getItem('username');
    if (signedIn) {
      id('profile').textContent = signedIn;
    } else {
      id('profile').textContent = 'Log in/Sign up';
    }
    qsa(".scroll-button").forEach(button => button.addEventListener('click', scrollBehavior));
    id("add-to-cart").addEventListener("click", addToCart);
    id("checkout-button").addEventListener("click", checkout);
    id("confirm-button").addEventListener("click", () => {
      id("confirm-button").classList.add("confirmed");
      updateCheckoutStatus();
    });
    qsa("#size-buttons button").forEach(button => {
      button.addEventListener("click", toggleChecked);
    });
    id("rating").addEventListener("submit", (evt) => {
      evt.preventDefault();
    });
    id("post-review").addEventListener("click", addReview);
  }

  /**
   * ----------------------------------------------------------------------------------------------
   * ------------ PROFILE PAGE SECTION START ------------------------------------------------------
   *  ---------------------------------------------------------------------------------------------
   */

  /**
   * Takes the user to their profile page
   * No paramaters, returns nothing
   */
  function loadProfilePage() {
    uncheckSizes();
    let name = this.textContent;
    if (name === 'Log in/Sign up') {
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
    } else {
      hideOtherPages("history-page");
      id('logout-btn').addEventListener('click', logout);
      id('history-box').innerHTML = '';
      getUserInfoForHistory();
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
   * Gets the log in info a user inputs in the webpage
   */
  function getLoginInfo() {
    let username = id('log-name').value;
    let password = id('log-password').value;
    id('log-name').value = '';
    id('log-password').value = '';
    performLogin(username, password);
  }

  /**
   * Gets the sign in info a user inputs in the webpage
   */
  function getSignInInfo() {
    let username = id('sign-name').value;
    let email = id('sign-email').value;
    let password = id('sign-password').value;
    performSignUp(username, email, password);
  }

  /**
   * API post request to sign an existing user in
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
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * API post request to create a new user
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
   * Updates the profile of the now logged-in or signed-up user.
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

  /**
   * Gets the user information from local storage
   */
  function getUserInfoForHistory() {
    let username = window.localStorage.getItem('username');
    let password = window.localStorage.getItem('password');
    getPurchaseHistory(username, password);
  }

  /**
   * Gets the purchase history of the current user from the API
   * @param {string} username - username of current user on the webpage
   * @param {string} password - password of current user on the webpage
   */
  async function getPurchaseHistory(username, password) {
    try {
      let data = new FormData();
      data.append('username', username);
      data.append('password', password);
      let res = await fetch('/user/history', {method: 'POST', body: data});
      await statusCheck(res);
      let history = await res.json();
      displayHistory(history);
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * Displays a user's transaction history on the webpage
   * @param {APIObject} history - all the data on all the items a user has previously purchased
   */
  function displayHistory(history) {
    if (history['transaction-history'].length === 0) {
      let noHistory = gen('h3');
      noHistory.textContent = 'No purchases yet';
      id('history-box').appendChild(noHistory);
    } else {
      for (let i = 0; i < history['transaction-history'].length; i++) {
        let arr = makeHistoryArr(history['transaction-history'][i]);
        let card = makeCard(arr, 'review-button', 'Leave Review');
        id('history-box').appendChild(card);
      }
    }
  }

  /**
   * Generates the transaction history of a single item
   * @param {JSONObject} itemInfo - the information of a single item provided by the API
   * @returns {array} arr - array of a single item's information
   */
  function makeHistoryArr(itemInfo) {
    let imgSrc = 'imgs/clothes/' + itemInfo['shortname'] + '.png';
    let imgAlt = '' + itemInfo['shortname'];
    let webname = '' + itemInfo['name'];
    let shortname = itemInfo['shortname'];
    let price = itemInfo['price'];
    let size = itemInfo['size'];
    let date = itemInfo['date-purchased'];
    let code = itemInfo['confirmation'];
    let arr = [imgSrc, imgAlt, webname, shortname, price, size, date, code];
    return arr;
  }

  /**
   * Logs the current user out of the webpage
   */
  function logout() {
    window.localStorage.clear();
    hideOtherPages('home-page');
    id('profile').textContent = 'Log in/Sign up';
  }

  /**
   *---------------------------------------------------------------------------------------------
   *------------ PROFILE PAGE SECTION END --------------------------------------------------------
   *---------------------------------------------------------------------------------------------
   */

  /**
   * ----------------------------------------------------------------------------------------------
   * ------------ HOME PAGE SECTION START --------------------------------------------------------
   *-----------------------------------------------------------------------------------------------
   */

  /**
   * Adds event listeners and configuration to the icons that redirect pages
   * runs only once at page startup
   * no params, returns nothing
   */
  function setupPageChangeEventListeners() {
    id("profile").addEventListener("click", loadProfilePage);
    id("logo").addEventListener("click", () => {
      hideOtherPages("home-page");
      uncheckSizes();
      handleError("You clicked marina's favorite!");
    });
    id("cart").addEventListener("click", setupCartPage);
    id("search-bar").addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        getSearchItems();
      }
    });
    qsa(".home-switch-buttons").forEach(button => {
      button.addEventListener("click", toggleViews);
    });
    id("top-filter").addEventListener("click", toggleFilter);
    id("bottom-filter").addEventListener("click", toggleFilter);
    id("dress-filter").addEventListener("click", toggleFilter);
  }

  /**
   * requests items and their details from the server as a json
   * if search is the shortname of an item, a specific item is returned. Otherwise
   * all items are returned
   * @param {string} search - filter for search
   * @returns {response} items - json of items
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
   * fetches each top, bottom, and dress, and adds it to the home page for viewing
   * in a compact scroll format, then calls the fillGridView function to fill the items into
   * an alternate view. Also adds event listener for image click behavior
   * images in the scrollbar are grouped by 4's for even viewing
   * No paramaters, returns nothing
   */
  async function initializeHomePage() {
    hideOtherPages("home-page");
    ["top", "bottom", "dress"].forEach(async cat => {
      let resp = await fetchItems(cat);
      for (let i = 0; i < Math.ceil(resp.length / 4); i++) {
        let div = gen('div');
        div.classList.add("imageDiv");
        for (let j = i * 4; j < i * 4 + 4; j++) { // four images in each scroll
          let div2 = gen('div');
          div2.classList.add('scrollImage');
          if (j < resp.length) {
            let item = makeImg("imgs/clothes/" + resp[j]["name"] + '.png', resp[j]["webname"]);
            let ptag = gen('p');
            let name = resp[j]["name"];
            let price = resp[j]["price"];
            let webname = resp[j]["webname"];
            ptag.textContent = resp[j]["webname"];
            div2.addEventListener("click", () => itemView(name, price, webname));
            div2.append(item, ptag);
          }
          div.appendChild(div2);
        }
        id(cat).appendChild(div);
      }
    });
    let resp = await fetchItems(null);
    fillGridView(resp, "grid-home-page");
  }

  /**
   * Inserts items in rows by formatting the image and name and
   * adding click behvaior to view the items in the item-page
   * A specific section can be specified to add the grid to.
   * @param {Response} resp - list of items from server as json
   * @param {string} section - id of section being appended too
   */
  function fillGridView(resp, section) {
    if (!(resp.length === 0)) {
      for (let i = 0; i < resp.length; i++) {
        let div = gen('div');
        div.classList.add("griditem", resp[i]["type"]);
        let ptag = gen('p');
        ptag.textContent = resp[i]["webname"];
        let item = makeImg("imgs/clothes/" + resp[i]["name"] + '.png', resp[i]["webname"]);
        div.append(item, ptag);
        let name = resp[i]["name"];
        let price = resp[i]["price"];
        let webname = resp[i]["webname"];
        div.addEventListener("click", () => itemView(name, price, webname));
        id(section).append(div);
      }
    } else {
      let ptag = gen('p');
      ptag.textContent = "No Items Match this Search";
      id(section).append(ptag);
    }
  }

  /**
   * Toggles between a compact view with scroll bars or a grid view
   * by switch pages and toggle buttons
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
   * When a filter button is selected, the unfiltered items are hidden
   * if no filter is selected, all items are shown
   * no parameters, returns nothing
   */
  function toggleFilter() {
    if (this.classList.contains("filtered")) {
      this.classList.remove("filtered");
    } else {this.classList.add("filtered");}
    if (!(qsa(".filtered").length === 0)) {
      qsa(".filtered").forEach(bt => {
        let scroller = bt.id.split('-')[0] + '-scroll';
        id(scroller).classList.remove('hidden');
        id(scroller).previousSibling.previousSibling.classList.remove("hidden");
        qsa("." + bt.id.split('-')[0]).forEach(item => {
          item.classList.remove("hidden");
        });
      });
      qsa(".filter:not(.filtered)").forEach(bt => {
        id(bt.id.split('-')[0] + '-scroll').classList.add('hidden');
        id(bt.id.split('-')[0] + '-scroll').previousSibling.previousSibling.classList.add("hidden");
        qsa("." + bt.id.split('-')[0]).forEach(item => {
          item.classList.add("hidden");
        });
      });
    } else {
      qsa(".scroller").forEach(scroll => {
        scroll.classList.remove("hidden");
        scroll.previousSibling.previousSibling.classList.remove("hidden");
      });
      qsa(".griditem").forEach(item => {
        item.classList.remove("hidden");
      });
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

  /**
   *----------------------------------------------------------------------------------------------
   * ------------ HOME PAGE SECTION END --------------------------------------------------------
   * ----------------------------------------------------------------------------------------------
   */

  /**
   * ----------------------------------------------------------------------------------------------
   * ------------ SEARCH PAGE SECTION START -------------------------------------------------------
   * ----------------------------------------------------------------------------------------------
   */

  /**
   * When a user inputs a value into the search bar, a request to the server for
   * matching item is made and displayed. The search trims trailing whitespace and
   * seperates words with commas instead of spaces
   * No paramaters, returns nothing
   */
  async function getSearchItems() {
    id("search-page").innerHTML = '';
    hideOtherPages("search-page");
    let search = id("search-bar").value.trim();
    search = search.split(' ').join(',');
    let resp = await fetchItems(search);
    fillGridView(resp, "search-page");
    id("search-bar").value = '';
  }

  /**
   * ----------------------------------------------------------------------------------------------
   * ------------ SEARCH PAGE SECTION END --------------------------------------------------------
   * ----------------------------------------------------------------------------------------------
   */

  /**
   * ----------------------------------------------------------------------------------------------
   * ------------ ITEM PAGE SECTION START --------------------------------------------------------
   * ----------------------------------------------------------------------------------------------
   */

  /**
   * Fills in the item page with the item information the user clicked on
   * then checks the inventory to disable any sizes that are out of stock
   * @param {string} name - db name of the item
   * @param {string} price - price of the item
   * @param {string} webname - the web offical name of an item
   * No paramaters, returns nothing
   */
  async function itemView(name, price, webname) {
    hideOtherPages("item-page");
    id("item-name").textContent = webname;
    qs("#item-page img").src = "/imgs/clothes/" + name + '.png';
    qs("#item-page img").id = name;
    qs("#item-page img").alt = 'image of ' + webname;
    id("item-price").textContent = "$" + price + ".00";
    checkInventory();
    let reviews = await fetchReviews(name);
    attachReviews(reviews);
  }

  /**
   * Fetches inventory from the server with an option query of an item
   * if shortname is set to null instead of an item, all items are returned
   * @param {string} shortname - name of item you want inventory for
   * @returns {response} stock - json of inventory for selected items
   */
  async function fetchInventory(shortname) {
    try {
      let resp = null;
      if (shortname) {
        resp = await fetch("/inventory?shortname=" + shortname);
      } else {
        resp = await fetch("/inventory");
      }
      await statusCheck(resp);
      let stock = await resp.json();
      return stock;
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * Toggles the size buttons within the item-page so that only
   * one is checked at any time
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
   * Clears any checked sizes to reset buttons
   * No paramaters, returns nothing
   */
  function uncheckSizes() {
    if (qs(".checked")) {
      qs(".checked").classList.remove("checked");
    }
    isSizeSelected();
  }

  /**
   * enables or disables size selection for an item based
   * on what is available in the inventory
   * No paramaters, returns nothing
   */
  async function checkInventory() {
    let shortname = qs("#item-page img").id;
    let inv = await fetchInventory(shortname);
    let sizebuttons = qsa("#size-buttons button");
    for (let i = 0; i < sizebuttons.length; i++) {
      let size = sizebuttons[i].textContent.toUpperCase();
      if (inv[size] === 0) {
        sizebuttons[i].disabled = true;
      } else {sizebuttons[i].disabled = false;}
    }
  }

  /**
   * Fetches the reviews for a specific item based on the shortname passed in
   * and returns them as json
   * @param {string} shortname - name of item you want inventory for
   * @returns {response} reveiws - json
   */
  async function fetchReviews(shortname) {
    try {
      let resp = await fetch("/getreviews/" + shortname);
      await statusCheck(resp);
      let reviews = await resp.json();
      return reviews;
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * Attaches all reviews for a specific itme to the item page as well as computes
   * the average rating of the item
   * @param {json} resp - json of all reveiws for an item
   */
  function attachReviews(resp) {
    let total = null;
    id("reviews").innerHTML = '';
    for (let i = 0; i < resp.length; i++) {
      let review = gen('div');
      review.classList.add("review");
      let user = gen('p');
      let details = gen('div');
      user.textContent = resp[i]["user"];
      let rating = gen('p');
      rating.textContent = "stars: " + resp[i]["stars"] + "\\5";
      total = total + resp[i]["stars"];
      let comments = gen("p");
      comments.textContent = "Comments: " + resp[i]["comments"];
      details.append(rating, comments);
      review.append(user, details);
      id("reviews").append(review);
    }
    let avg = gen("p");
    if (resp.length === 0) {
      avg.textContent = "Average Rating: No Reviews Yet";
    } else {avg.textContent = "Average Rating: " + (total / resp.length).toFixed(1) + " stars";}
    id("reviews").prepend(avg);
  }

  /**
   * ----------------------------------------------------------------------------------------------
   * ------------ ITEM PAGE SECTION END ----------------------------------------------------------
   * --------------------------------------------------------------------------------------------
   */

  /**
   * ----------------------------------------------------------------------------------------------
   *  ------------ CHECKOUT PAGE SECTION START ----------------------------------------------------
   * --------------------------------------------------------------------------------------------
   */

  /**
   * configures cart whenever the cart icon is clicked by switching pages
   * and updating the checkout button status
   */
  function setupCartPage() {
    if (qs("#checkout-page > p")) {
      qs("#checkout-page > p").remove();
    }
    hideOtherPages("checkout-page");
    updateCheckoutStatus();
    uncheckSizes();
  }

  /**
   * The checkout button is only enabled if a user is logged in
   * there are items in the cart, and it has been confirmed
   * otherwise messages indicating the user to login, fill the cart, or confirm
   * are displayed on the buttons
   */
  function updateCheckoutStatus() {
    if (!window.localStorage.getItem('username')) {
      id("confirm-button").disabled = true;
      id("checkout-button").disabled = true;
      id("checkout-button").textContent = "Please sign in to checkout";
    } else if (!qs("#checkout-page div")) {
      id("confirm-button").disabled = true;
      id("checkout-button").disabled = true;
      id("checkout-button").textContent = "Cart is Empty";
    } else if (id("confirm-button").classList.contains("confirmed")) {
      id("confirm-button").disabled = true;
      id("confirm-button").classList.remove("confirmed");
      id("checkout-button").disabled = false;
      id("checkout-button").textContent = "Checkout";
    } else {
      id("confirm-button").disabled = false;
      id("checkout-button").textContent = "Confirm to Checkout";
    }
  }

  /**
   * Called when the user selects the checkout button
   * Checkout button is only enabled if a user is logged in, confirmed and there are items
   * in the cart
   * Formats cart items into a json string and request transaction from server
   * No paramaters, returns nothing
   */
  async function checkout() {
    try {
      let data = new FormData();
      let username = window.localStorage.getItem('username');
      data.append('username', username);
      let cart = [];
      let items = qsa("#checkout-page > div");
      for (let i = 0; i < items.length; i++) {
        let shortname = items[i].classList[0];
        let size = items[i].childNodes[1].childNodes[2].textContent;
        cart.push({"shortname": shortname, "size": size});
      }
      data.append("items", JSON.stringify(cart));
      let res = await fetch('/checkout', {method: 'POST', body: data});
      await statusCheck(res);
      res = await res.text();
      let ptag = gen('p');
      ptag.textContent = "Items purchased! Your Confirmation code is: " + res;
      qsa("#checkout-page > div").forEach(el => {
        el.remove();
      });
      updateCheckoutStatus();
      id("checkout-page").prepend(ptag);
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * Takes information about a users selection and inserts a formatted
   * layout into the checkout page. Creates a remove button for each
   * item in the cart
   * No paramaters, returns nothing
   */
  function addToCart() {
    let src = qs("#item-page img").src;
    let alt = qs("#item-page img").alt;
    let webname = id("item-name").textContent;
    let shortname = qs("#item-page img").id;
    let price = id("item-price").textContent;
    let size = qs(".checked").textContent;
    let params = [src, alt, webname, shortname, price, size];
    let card = makeCard(params, "remove-button", "Remove Item");
    id("checkout-page").prepend(card);
    uncheckSizes();
  }

  /**
   * ----------------------------------------------------------------------------------------------
   * ------------ CHECKOUT PAGE SECTION END ----------------------------------------------------
   * --------------------------------------------------------------------------------------------
   */

  /**
   * ----------------------------------------------------------------------------------------------
   * ------------ REVIEW PAGE SECTION START ------------------------------------------------------
   * --------------------------------------------------------------------------------------------
   */

  /**
   * Adds a review to the server using the current logged in user and their
   * entry into the text boxes. Ensures the rating is between 0 and 5.
   * no parameters returns nothing
   */
  async function addReview() {
    try {
      let url = '/review';
      let confirmation = qs("#review-page p").textContent.split(':')[1].trim();
      let input = parseInt(id("rating").value);
      if (input > 5 || input < 1 || isNaN(input)) {
        handleError("Please enter a value between 1 and 5");
      } else {
        if (!(id("comments").value === '')) {
          url = '/review?comment=' + id("comments").value;
        }
        let data = new FormData();
        data.append('username', window.localStorage.getItem('username'));
        data.append('confirmation', confirmation);
        data.append('rating', id("rating").value);
        let res = await fetch(url, {method: 'POST', body: data});
        await statusCheck(res);
        let review = await res.text();
        handleError(review);
        id("comments").value = '';
        id("rating").value = '';
        hideOtherPages("home-page");
      }
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * opens reveiw page and appends in the confirmation code to prove purchase
   * really only needed due to line length of other function
   * @param {string} code - confirmation code for a specific purchased item
   */
  function setupReview(code) {
    qs("#review-page p").textContent = "Confirmation Code: " + code;
    hideOtherPages("review-page");
  }

  /**
   * --------------------------------------------------------------------------------------------
   * ------------ REVIEW PAGE SECTION END ----------------------------------------------------
   * --------------------------------------------------------------------------------------------
   */

  /**
   * ----------------------------------------------------------------------------------------------
   * ------------ HELPER FUNCTIONS ----------------------------------------------------------------
   * ----------------------------------------------------------------------------------------------
   */

  /**
   * Creates a card containing a specific item's information
   * used to keep all item information formatted and styled the same
   * @param {Array} itemArray - array containg item img.src, img.alt, webname, shortname, price,
   * and size (and confirmation code if it is for displaying transaction history)
   * @param {string} buttonClass -  class of button to add
   * @param {string} buttonLabel - containing button text
   * @returns {object} card - a formated card with item information
   */
  function makeCard(itemArray, buttonClass, buttonLabel) {
    let card = gen('div');
    card.classList.add(itemArray[3]);
    let img = makeImg(itemArray[0], itemArray[1]);
    let text = gen('div');
    let nameText = gen('p');
    nameText.textContent = itemArray[2];
    let priceText = gen('p');
    priceText.textContent = itemArray[4];
    let sizeText = gen('p');
    sizeText.textContent = itemArray[5];
    let cardButton = gen('button');
    cardButton.textContent = buttonLabel;
    cardButton.classList.add(buttonClass);
    if (buttonClass === "remove-button") {
      cardButton.addEventListener("click", () => {
        cardButton.parentNode.parentNode.remove(); // remove item
        updateCheckoutStatus(); // check if the cart is empty
      });
      text.append(nameText, priceText, sizeText, cardButton);
    } else {
      let extra = historyCardExtra(itemArray);
      cardButton.addEventListener('click', () => {
        setupReview(itemArray[7]);
      });
      text.append(nameText, priceText, sizeText, extra[0], extra[1], cardButton);
    }
    card.append(img, text);
    return card;
  }

  /**
   * Adds the extra p tags to the card of an item that has been previously purchased by a user
   * @param {array} itemArray - array containg item img.src, img.alt, webname, shortname, price,
   * and size (and confirmation code if it is for displaying transaction history)
   * @returns {array} extra - array of the extra p tags
   */
  function historyCardExtra(itemArray) {
    let dateText = gen('p');
    dateText.textContent = 'Date purchased: ' + itemArray[6];
    let codeText = gen('p');
    codeText.textContent = 'Confirmation code: ' + itemArray[7];
    let extra = [dateText, codeText];
    return extra;
  }

  /**
   * Hides all other pages besides the one that will be displayed
   * @param {string} displayPage - id of the page that will be displayed
   */
  function hideOtherPages(displayPage) {
    let pages = ["home-page", "item-page", "checkout-page",
                  "login-page", "review-page", "search-page", "history-page"];
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
   * Creates a new image object and sets it's src and alt text to reduce
   * line usage
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
    id('error-msg').innerHTML = '';
    let error = gen('p');
    error.textContent = err;
    error.id = 'error-content';
    id('error-msg').appendChild(error);
    setTimeout(() => {
      let errEl = qs('body p');
      errEl.parentElement.removeChild(errEl);
    }, 5000);
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