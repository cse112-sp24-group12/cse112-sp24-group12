/**
 * @jest-environment jsdom
 */
const results = require("../results");

/**
 * Test if next and previous buttons' visibility are correctly updated
 */
describe("updateButtonVisibility", function () {
  let prevButton;
  let nextButton;
  let chosenCards;

  beforeEach(function () {
    chosenCards = ["card1", "card2", "card3", "card4"];

    // Create a container element to hold the buttons
    const container = document.createElement("div");
    container.innerHTML = `
      <button id="prev-button" style="display: flex;">Previous</button>
      <button id="next-button" style="display: flex;">Next</button>
    `;
    document.body.appendChild(container);

    // Get references to the buttons
    prevButton = document.getElementById("prev-button");
    nextButton = document.getElementById("next-button");
  });

  afterEach(function () {
    document.body.innerHTML = "";
  });

  it("should hide the buttons when screen width is above 600", function () {
    global.innerWidth = 800;
    results.updateButtonVisibility(chosenCards, 0);

    // Expect the buttons to be hidden because the screen size is above 600
    expect(prevButton.style.display).toBe("none");
    expect(nextButton.style.display).toBe("none");
  });

  it("should show the next button and hide the previous button when screen width is below 600 when idx is 0", function () {
    global.innerWidth = 500;
    results.updateButtonVisibility(chosenCards, 0);

    // Expect that only the next button to be visible because index is at 0
    expect(prevButton.style.display).toBe("none");
    expect(nextButton.style.display).toBe("flex");
  });

  it("should hide the next button and show the previous button when screen width is below 600 and when idx is 3", function () {
    global.innerWidth = 500;
    results.updateButtonVisibility(chosenCards, 3);

    // Expect that only the previous button to be visible because idx is 3
    expect(prevButton.style.display).toBe("flex");
    expect(nextButton.style.display).toBe("none");
  });

  it("should show the next and previous buttons when screen width is below 600 and when idx is 2", function () {
    global.innerWidth = 500;
    results.updateButtonVisibility(chosenCards, 2);

    // Expect that only the previous button to be visible because idx is 2
    expect(prevButton.style.display).toBe("flex");
    expect(nextButton.style.display).toBe("flex");
  });
});

/**
 * Test if screenWith changes are correctly updated
 */
describe("handleWindowSizeChange", function () {
  let originalWindow;
  let prevButton;
  let nextButton;

  beforeAll(function () {
    // Store the original window object
    originalWindow = global.window;

    // Create a container element to hold the buttons
    const container = document.createElement("div");
    container.innerHTML = `
       <button id="prev-button" style="display: flex;">Previous</button>
       <button id="next-button" style="display: flex;">Next</button>
     `;
    document.body.appendChild(container);

    // Get references to the buttons
    prevButton = document.getElementById("prev-button");
    nextButton = document.getElementById("next-button");
  });

  it("should update the screenWidth variable when window size changes to 800", function () {
    results.screenWidth = 1024;
    global.innerWidth = 800;
    results.handleWindowSizeChange();

    // Assert that the screenWidth variable is updated correctly
    expect(results.screenWidth).toBe(800);
  });

  it("should not update the screenWidth variable when window size doesn't change", function () {
    results.screenWidth = 1024;
    global.innerWidth = 1024;
    results.handleWindowSizeChange();

    // Assert that the screenWidth variable remains the same
    expect(results.screenWidth).toBe(1024);
  });
});

/**
 * Test if updateMobileCard correctly updates the mobile card
 */
describe("updateMobileCard", function () {
  let mobileCard;
  let cardContainers;
  let cardImg;
  let cardDesc;
  let chosenCards;
  let fortuneTellings;
  let tarotMap;
  let idx;

  beforeAll(function () {
    document.body.innerHTML = `
    <div id="card-1" class="card">
    <img id="image-1" src="assets/images/blank-card.png" alt="Blank Card" height="269" width="220" />
    <div id="text-1" class="text-portion">
      <p id="description-1">Card Description</p>
    </div>
    `;

    cardContainers = document.getElementsByClassName("card");
    mobileCard = cardContainers[0];
    cardImg = mobileCard.querySelector("img");
    cardDesc = mobileCard.querySelector("p");
    chosenCards = ["card1", "card2", "card3", "card4"];
    fortuneTellings = ["fortune1", "fortune2", "fortune3", "fortune4"];
    tarotMap = {
      card1: { image: "1.jpeg" },
      card2: { image: "2.jpeg" },
      card3: { image: "3.jpeg" },
      card4: { image: "4.jpeg" },
    };
  });

  it("mobileCard should be updated with contents at idx 0 of chosenCards", function () {
    idx = 0;

    const [card, imgSrc, desc] = results.updateMobileCard(
      chosenCards,
      idx,
      mobileCard,
      tarotMap,
      fortuneTellings
    );
    expect(card).toBe("card1");
    expect(imgSrc).toContain("1.jpeg"); //to account for localpath
    expect(desc).toBe("fortune1");
  });

  it("mobileCard should be updated with contents at idx 1 of chosenCards", function () {
    idx = 1;

    const [card, imgSrc, desc] = results.updateMobileCard(
      chosenCards,
      idx,
      mobileCard,
      tarotMap,
      fortuneTellings
    );
    expect(card).toBe("card2");
    expect(imgSrc).toContain("2.jpeg"); //to account for localpath
    expect(desc).toBe("fortune2");
  });

  it("mobileCard should be updated with contents at idx 2 of chosenCards", function () {
    idx = 2;

    const [card, imgSrc, desc] = results.updateMobileCard(
      chosenCards,
      idx,
      mobileCard,
      tarotMap,
      fortuneTellings
    );
    expect(card).toBe("card3");
    expect(imgSrc).toContain("3.jpeg"); //to account for localpath
    expect(desc).toBe("fortune3");
  });

  it("mobileCard should be updated with contents at idx 3 of chosenCards", function () {
    idx = 3;

    const [card, imgSrc, desc] = results.updateMobileCard(
      chosenCards,
      idx,
      mobileCard,
      tarotMap,
      fortuneTellings
    );
    expect(card).toBe("card4");
    expect(imgSrc).toContain("4.jpeg"); //to account for localpath
    expect(desc).toBe("fortune4");
  });
});
