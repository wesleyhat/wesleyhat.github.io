let slide=1;
let amount = 34.3;

console.log("Slide: " + slide);


function goRight(){

  let scroll = document.getElementById("scroll");

  switch(slide){
    case 1:
      scroll.style.transform = "translateX(0)";
      slide = 2;
      break;
    case 2:
      scroll.style.transform = "translateX(-33.5%)";
      slide = 3;
      break;
    case 3:
      break;
  }
}

function goLeft(){

  let scroll = document.getElementById("scroll");

  switch(slide){
    case 1:
     break;
    case 2:
     scroll.style.transform = "translateX(33.5%)";
     slide = 1;
     break;
    case 3:
     scroll.style.transform = "translateX(0)";
     slide = 2;
     break;
  }
}

function getOne(){
  let scroll = document.getElementById("scroll");

  scroll.style.transform = "translateX(33.5%)";
}

function getTwo(){
  let scroll = document.getElementById("scroll");

  scroll.style.transform = "translateX(0)";
}

function getThree(){
  let scroll = document.getElementById("scroll");

  scroll.style.transform = "translateX(-33.5%)";
}

let hov = false;

function setHover(){
  let itemOne = document.getElementById("item1");
  let mercerHeading = document.getElementById("mercerHeading");
  let mercerImage = document.getElementById("mercerImage");
  let mercerText = document.getElementById("mercerText");
  let mercerDeg = document.getElementById("mercerDeg");
  let mercerYear = document.getElementById("mercerYear");
  let itemTwo = document.getElementById("item2");
  let cgtcHeading = document.getElementById("cgtcHeading");
  let cgtcImage = document.getElementById("cgtcImage");
  let cgtcText = document.getElementById("cgtcText");
  let cgtcDeg = document.getElementById("cgtcDeg");
  let cgtcYear = document.getElementById("cgtcYear");

  itemOne.addEventListener("mouseover", (event) => {

    itemOne.style.backgroundColor = "#28d59c";
    mercerImage.style.display = "none";
    mercerText.style.display = "initial";
    mercerHeading.style.color= "#fff";
    mercerDeg.style.color= "#fff";
    mercerYear.style.color= "#fff";
  })

  itemOne.addEventListener("mouseleave", (event) => {

    itemOne.style.backgroundColor = "#fff";
    mercerImage.style.display = "initial";
    mercerText.style.display = "none";
    mercerHeading.style.color= "initial";
    mercerDeg.style.color= "initial";
    mercerYear.style.color= "initial";
  })

  itemTwo.addEventListener("mouseover", (event) => {

    itemTwo.style.backgroundColor = "#28d59c";
    cgtcImage.style.display = "none";
    cgtcText.style.display = "initial";
    cgtcHeading.style.color= "#fff";
    cgtcDeg.style.color= "#fff";
    cgtcYear.style.color= "#fff";
  })

  itemTwo.addEventListener("mouseleave", (event) => {

    itemTwo.style.backgroundColor = "#fff";
    cgtcImage.style.display = "initial";
    cgtcText.style.display = "none";
    cgtcHeading.style.color= "initial";
    cgtcDeg.style.color= "initial";
    cgtcYear.style.color= "initial";
  })
}
