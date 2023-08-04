// First we get the viewport height and we multiple it by 1% to get a value for a vh unit
let vh = window.innerHeight * 0.01;
// Then we set the value in the --vh custom property to the root of the document
document.documentElement.style.setProperty('--vh', `${vh}px`);

function changeImage()
{
  let img = document.getElementById("image");
  let body = document.getElementById("body");
  let circle = document.getElementById("circle");
  let p = document.getElementById("p");
  let root = document.querySelector(":root");

  if(img.getAttribute('src') === "images/toggle.png"){
    img.setAttribute('src', "images/toggle1.png");
    body.style.backgroundColor = "#fff";
    circle.style.backgroundColor = "#fff";
    circle.style.left = "62px"
    circle.style.transition = ".5s";
    root.style.setProperty("--main", '#1f1f1f');
    root.style.setProperty("--accent", '#6200ee');
    root.style.setProperty("--filter1", 'invert(11%) sepia(89%) saturate(7220%) hue-rotate(269deg) brightness(86%) contrast(122%)');
    root.style.setProperty("--filter2", 'blur(10px) invert(11%) sepia(89%) saturate(7220%) hue-rotate(269deg) brightness(86%) contrast(122%)');
    root.style.setProperty("--p", 'rgba(0,0,0,.75)');
    root.style.setProperty("--menu", '#1f1f1f');
    root.style.setProperty("--back", '#fff');
    localStorage['clicked'] = 'true';

    console.log(localStorage['clicked']);
  }
  else {
    img.setAttribute('src', "images/toggle.png");
    body.style.backgroundColor = "#121212";
    circle.style.backgroundColor = "#1f1f1f";
    circle.style.left = "27px";
    circle.style.transition = ".5s";
    root.style.setProperty("--main", '#fff');
    root.style.setProperty("--accent", '#bb86fc');
    root.style.setProperty("--filter1", 'none');
    root.style.setProperty("--filter2", 'blur(10px)');
    root.style.setProperty("--p", 'rgba(255,255,255,.75)');
    root.style.setProperty("--menu", '#202020');
    root.style.setProperty("--back", '#121212');
    localStorage['clicked'] = 'false';

    console.log(localStorage['clicked']);
  }

  return false;
}

function changeMenu(){
  let ul = document.getElementById("ul");
  let menu = document.getElementById("menu");
  let right = document.getElementById("right");

  ul.style.width = "175px";
  right.style.width = "175px";
  menu.style.display = "none";
  ul.style.transition = ".5s";
  right.style.transition = ".5s";

  return false;
}

function closeMenu(){
  let ul = document.getElementById("ul");
  let right = document.getElementById("right");
  let menu = document.getElementById("menu");


  ul.style.width = "0%";
  right.style.width = "0%";
  menu.style.display = "initial";

  return false;
}

function go(){
  let ul = document.getElementById("ul");
  let right = document.getElementById("right");
  let menu = document.getElementById("menu");
  let width = window.innerWidth;
  let currentWidth = document.getElementById("ul").clientWidth;

  let perc = currentWidth / width * 100;

  if(width > 1300){
    console.log(width);
    ul.style.width = "100%";
    right.style.width = "initial";
    menu.style.display = "none";
    ul.style.transition = "none";
    right.style.transition = "none";
  } else {
    ul.style.width = "0%";
    right.style.width = "0%";
    menu.style.display = "initial";
  }
  return false;
}

window.addEventListener('resize', go);

go();

function getMode(){
  let clicked = localStorage['clicked'];

  let img = document.getElementById("image");
  let body = document.getElementById("body");
  let circle = document.getElementById("circle");
  let p = document.getElementById("p");
  let root = document.querySelector(":root");

  if(clicked == "true"){
    img.setAttribute('src', "images/toggle1.png");
    body.style.backgroundColor = "#fff";
    circle.style.backgroundColor = "#fff";
    circle.style.left = "62px";
    circle.style.transition = "0s";
    root.style.setProperty("--main", '#1f1f1f');
    root.style.setProperty("--accent", '#6200ee');
    root.style.setProperty("--filter1", 'invert(11%) sepia(89%) saturate(7220%) hue-rotate(269deg) brightness(86%) contrast(122%)');
    root.style.setProperty("--filter2", 'blur(10px) invert(11%) sepia(89%) saturate(7220%) hue-rotate(269deg) brightness(86%) contrast(122%)');
    root.style.setProperty("--p", 'rgba(0,0,0,.75)');
    root.style.setProperty("--menu", '#1f1f1f');
    root.style.setProperty("--back", '#fff');
    console.log("light mode");
  } else if(clicked == "false"){
    img.setAttribute('src', "images/toggle.png");
    body.style.backgroundColor = "#121212";
    circle.style.backgroundColor = "#1f1f1f";
    circle.style.left = "27px";
    circle.style.transition = "0s";
    root.style.setProperty("--main", '#fff');
    root.style.setProperty("--accent", '#bb86fc');
    root.style.setProperty("--filter1", 'none');
    root.style.setProperty("--filter2", 'blur(10px)');
    root.style.setProperty("--p", 'rgba(255,255,255,.75)');
    root.style.setProperty("--menu", '#202020');
    root.style.setProperty("--back", '#121212');
    console.log("dark mode");
  } else{
    console.log("error");
  }
  return false;
}
