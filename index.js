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
    id("cart").addEventListener("click", loadCartPage);
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
    clearPage();
    let profileMsg = gen('p');
    profileMsg.textContent = "We're still building your profile, check back later";
    id("temp-msgs").appendChild(profileMsg);

    // need to add profile page details
  }

  /**
   * returns user to the main page of the website
   * No paramaters, returns nothing
   */
  function loadMainPage() {
    id("temp-msgs").classList.add("hidden");
    id("everything-but-header").classList.remove("hidden");

    // need to add dynamically added products
  }

  /**
   * clears all content on webpage except the website header
   * No paramaters, returns nothing
   */
  function clearPage() {
    id("everything-but-header").classList.add("hidden");
    id("temp-msgs").innerHTML = "";
    id("temp-msgs").classList.remove("hidden");

    // id("everything-but-header").innerHTML = ""; may need later when we are dynamically adding content
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