
document.addEventListener("DOMContentLoaded", function () {
    

    const imageContainer = document.querySelector(".image-container");
    const resume = document.getElementById("resume");
    const sections = document.querySelectorAll(".section");

    let scale = 1.0;
    const zoomSpeed = 0.3;
    const rotateSpeed = 0.03;

    window.addEventListener("wheel", function (event) {
        scale += event.deltaY > 0 ? -zoomSpeed : zoomSpeed;
        scale = Math.max(1.0, scale);

        updateTransform();
    });

    window.addEventListener("mousemove", function () {
        updateTransform();
    });
    

    function updateTransform() {
        const rotationX = getRotationX();
        const rotationY = getRotationY();

        imageContainer.style.transform = `scale(${scale}) rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
    }

    function getRotationX() {
        const boundingRect = resume.getBoundingClientRect();
        const centerY = boundingRect.top + boundingRect.height / 2;

        return ((event.clientY - centerY) / boundingRect.height) * 180 * rotateSpeed;
    }

    function getRotationY() {
        const boundingRect = resume.getBoundingClientRect();
        const centerX = boundingRect.left + boundingRect.width / 2;

        return ((event.clientX - centerX) / boundingRect.width) * 180 * rotateSpeed;
    }
});
