// Get the carousel elements
const carousel = document.querySelector('.carousel');
const carouselInner = carousel.querySelector('.carousel-inner');
const carouselItems = carouselInner.querySelectorAll('.carousel-item');
const carouselPrev = carousel.querySelector('.carousel-prev');
const carouselNext = carousel.querySelector('.carousel-next');

// Set the active carousel item
let activeIndex = 0;
carouselItems[activeIndex].classList.add('active');

// Add event listeners to the navigation buttons
carouselPrev.addEventListener('click', () => {
  carouselItems[activeIndex].classList.remove('active');
  activeIndex = (activeIndex - 1 + carouselItems.length) % carouselItems.length;
  carouselItems[activeIndex].classList.add('active');
});

carouselNext.addEventListener('click', () => {
  carouselItems[activeIndex].classList.remove('active');
  activeIndex = (activeIndex + 1) % carouselItems.length;
  carouselItems[activeIndex].classList.add('active');
});
