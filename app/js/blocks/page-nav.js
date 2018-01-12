var pageNav = document.querySelector(".page-nav");
var toogleNav = document.querySelector(".page-nav__toggle");

// var popup = document.querySelector("modal");

pageNav.classList.remove("page-nav--nojs");

toogleNav.addEventListener("click", function() {
  if (pageNav.classList.contains("page-nav--closed")) {
    pageNav.classList.remove("page-nav--closed");
    pageNav.classList.add("page-nav--opened");
  } else {
    pageNav.classList.add("page-nav--closed");
    pageNav.classList.remove("page-nav--opened");
  }
});
