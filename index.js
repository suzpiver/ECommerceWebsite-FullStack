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