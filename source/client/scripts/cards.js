import tarotConfig from "../tarot.js";

/**
 * Create a hashmap for all tarot cards that can be indexed by card name
 * @return {Map} a hashmap of all the cards and their information paresed from json
 */
const tarotMap = tarotConfig.tarot.reduce((map, card) => {
  map[card.name] = {
    suite: card.suite,
    image: card.image,
    light: card.meanings.light,
    shadow: card.meanings.shadow,
    fortune: card.fortune_telling,
    keywords: card.keywords,
  };
  return map;
}, {});


// Get all tarot cards, display them in slider
document.addEventListener("DOMContentLoaded", function () {
  for (const tarotCardName in tarotMap) {
    const card = tarotMap[tarotCardName];
    const wrapper = document.getElementById("wrapper");
    const slide = document.createElement("div");
    slide.className = "card swiper-slide";

    const imageContent = document.createElement("div");
    imageContent.className = "image-content";

    const overlay = document.createElement("span");
    overlay.className = "overlay";

    const cardImage = document.createElement("div");
    cardImage.className = "card-image";
    const img = document.createElement("img");
    
    img.src = card.image;
    img.alt = "";
    img.className = "card-img";

    const cardContent = document.createElement("div");
    cardContent.className = "card-content";

    const cardName = document.createElement("h2");
    cardName.className = "name";
    cardName.textContent = tarotCardName;

    const cardDescription = document.createElement("p");
    cardDescription.className = "description";
    cardDescription.textContent = card.keywords.join(", ");

    cardImage.appendChild(img);
    imageContent.appendChild(overlay);
    imageContent.appendChild(cardImage);
    cardContent.appendChild(cardName);
    cardContent.appendChild(cardDescription);
    slide.appendChild(imageContent);
    slide.appendChild(cardContent);
    wrapper.appendChild(slide);
  }
});

// From Responsive Slider by CodingLab
var swiper = new Swiper(".slide-content", {
  slidesPerView: 3,
  spaceBetween: 25,
  loop: true,
  centerSlide: "true",
  fade: "true",
  grabCursor: "true",
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
    dynamicBullets: true,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },

  breakpoints: {
    0: {
      slidesPerView: 1,
    },
    520: {
      slidesPerView: 2,
    },
    950: {
      slidesPerView: 3,
    },
  },
});
