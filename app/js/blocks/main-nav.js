var mainNav = document.querySelector(".main-nav");
var toogleNav = document.querySelector(".main-nav__toggle");

// var popup = document.querySelector("modal");

mainNav.classList.remove("main-nav--nojs");

toogleNav.addEventListener("click", function() {
  if (mainNav.classList.contains("main-nav--closed")) {
    mainNav.classList.remove("main-nav--closed");
    mainNav.classList.add("main-nav--opened");
  } else {
    mainNav.classList.add("main-nav--closed");
    mainNav.classList.remove("main-nav--opened");
  }
});
