
function getSystem(){
    let secOne = document.getElementById("secOne")
    let secTwo = document.getElementById("secTwo")
    let secThree = document.getElementById("secThree")
    let system = document.getElementById("system")
    let it = document.getElementById("it")
    let shift = document.getElementById("shift")

    secOne.style.display = "initial"
    secTwo.style.display = "none"
    secThree.style.display = "none"

    system.style.borderLeft = "2px solid var(--accent)"
    it.style.borderLeft = "2px solid transparent"
    shift.style.borderLeft = "2px solid transparent"
}

function getIt(){
    let secOne = document.getElementById("secOne")
    let secTwo = document.getElementById("secTwo")
    let secThree = document.getElementById("secThree")
    let system = document.getElementById("system");
    let it = document.getElementById("it");
    let shift = document.getElementById("shift");

    secOne.style.display = "none"
    secTwo.style.display = "initial"
    secThree.style.display = "none"
    system.style.borderLeft = "2px solid transparent"
    it.style.borderLeft = "2px solid var(--accent)"
    shift.style.borderLeft = "2px solid transparent"
}

function getShift(){
    let secOne = document.getElementById("secOne")
    let secTwo = document.getElementById("secTwo")
    let secThree = document.getElementById("secThree")
    let system = document.getElementById("system");
    let it = document.getElementById("it");
    let shift = document.getElementById("shift");

    secOne.style.display = "none"
    secTwo.style.display = "none"
    secThree.style.display = "initial"
    system.style.borderLeft = "2px solid transparent"
    it.style.borderLeft = "2px solid transparent"
    shift.style.borderLeft = "2px solid var(--accent)"
}

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
    circle.style.left = "68px"
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
    circle.style.left = "30px";
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

function getMode(){
    let clicked = localStorage['clicked'];
  
    let img = document.getElementById("image");
    let body = document.getElementById("body");
    let circle = document.getElementById("circle");
    let p = document.getElementById("p");
    let root = document.querySelector(":root");
    let system = document.getElementById("system");

    system.style.borderLeft = "2px solid var(--accent)";
  
    if(clicked == "true"){
      img.setAttribute('src', "images/toggle1.png");
      body.style.backgroundColor = "#fff";
      circle.style.backgroundColor = "#fff";
      circle.style.left = "68px";
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
      circle.style.left = "30px";
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