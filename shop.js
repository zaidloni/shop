let productDiv = document.getElementById("productsWrapper");

//=====>>>>>>>card function<<<<<=========//

function createProductCard(product) {
  return `
      <div class="prdt_card">
        <div class="prdt_img" id="prdtImg">
          <img src="${product.image}" alt="" class="image" id="IMAGE">
        </div>
        <div class="prdt_contents" id="prdtContents">
          <p class="prdt_title" id="prdtTitle">${product.title
            .split(" ")
            .splice(0, 3)
            .join(" ")}</p>
          <p class="price" id="PRICE">Price: ${product.price}</p>
          <p class="rating" id="rate">Rating: ${product.rating["rate"]}</p>
          <p class="count" id="COUNT">Count: ${product.rating["count"]}</p>
        </div>
        <div class="btn" id="BTN">
          <button class="add_tocart" data-product-id=${
            product.id
          } id="addToCart">ADD TO CART</button>
        </div>
      </div>
    `;
}

//===>>>>>fetching the data<<<<===//

let productCards;
let tofilterData;
let products;

fetch("https://fakestoreapi.com/products") //=========>>>>>>>>> fetching the data
  .then((res) => res.json())
  .then((data) => {
    let sizes = ["S", "M", "L", "XL"];
    let colours = ["red", "blue", "black"];

    data = data.map((product) => {
      //==============>>>>>>>>>>> randomly assigning size and color to every item in the object array of fetched data
      return {
        ...product,
        sizes: sizes[Math.round(Math.random() * 4)],
        colours: colours[Math.round(Math.random() * 3)],
      };
    });

    products = data;
    tofilterData = data;

    productCards = products.map((product) => {
      //===========>>>>> mapping every product and adding it in the html .i.e displaying on the page
      return createProductCard(product);
    });
    productDiv.innerHTML = productCards.join("");

    //=======>>>>>>>adding to cart<<<<<<<<============//

    const cart = JSON.parse(localStorage.getItem("cart")) || []; //=======>>>>>> creating cart array to store the added to cart product to display them on the cart page

    productDiv.addEventListener("click", (event) => {
      const addToCartBtn = event.target.closest("#addToCart"); //======>>>>>> accessing hte button of the cards

      if (addToCartBtn) {
        const id = addToCartBtn.getAttribute("data-product-id"); //=======>>>>>> finding the data id and matching with the product id to send that particular id
        const product = data.find((product) => product.id == id); //=======>>>>>> closest is used so that the functionality works when products are filtred

        if (product) {
          addToCartBtn.style.backgroundColor = "green";
          cart.push(product);
          localStorage.setItem("cart", JSON.stringify(cart));
        }
      }
    });
  });

//=====>>>>>>>>filtering Button filter function<<<<<<========//

const allButton = document.getElementById("searchCatBtn");
allButton.addEventListener("click", () => showProducts());

const mensButton = document.getElementById("searchCatBtnM");
mensButton.addEventListener("click", () => showProducts("men's clothing"));

const womensButton = document.getElementById("searchCatBtnW");
womensButton.addEventListener("click", () => showProducts("women's clothing"));

const jewelleryButton = document.getElementById("searchCatBtnJ");
jewelleryButton.addEventListener("click", () => showProducts("jewelery"));

const electronicsButton = document.getElementById("searchCatBtnE");
electronicsButton.addEventListener("click", () => showProducts("electronics"));

//--------->>>>> filter functionality for buttons below searhc bar<<<<<<<<---------//
function showProducts(category) {
  productDiv.innerHTML = "";

  if (category) {
    products = tofilterData.filter((product) => {
      //-------->>>> filtering the products according to category  if found else showing al data
      return product.category === category;
    });
  } else {
    products = tofilterData;
  }
  productCards = products.map((product) => createProductCard(product));
  productDiv.innerHTML = productCards.join("");
}
//======>>>>>>>>filter functions (side bar filter) <<<<<<<<<=========//

const filterArray = document.querySelectorAll("[type=checkbox]"); //------->>>>>>>>  accessing all the checkboxes
let filterValues = [];

filterArray.forEach((filter) => {
  filter.addEventListener("change", (e) => {
    //--------adding value of the checked button in an array on chagne in checkbox
    if (e.target.checked) {
      let value = filter.value;
      filterValues.push(value); //---------adding
      filterShowCategory(filterValues); //---calling the flter function for filter purpose
    } else {
      const index = filterValues.indexOf(e.target.value); //---if unchecked finding the index of the unchecked box if not found deleting that from the array and calling the filter function again
      if (index !== -1) {
        //-------condtion if not found
        filterValues.splice(index, 1); //-------removing the value
        filterShowCategory(filterValues); //-----calling the filter function
      }
    }
  });
});

//--------- Actual filter function ----------//
function filterShowCategory(filter_values) {
  productDiv.innerHTML = "";
  let filteredproducts = tofilterData.slice(); //------assining all the data to a new variable so that original data does not get destroyed and products gets filtered for multiple values

  if (filterValues.length === 0) {
    //--------- if a no checkbox is selected
    products = tofilterData.slice();
  } else {
    //--------creating array of values of sizes and filtering product according to that ---------//
    const sizeArray = filter_values.filter((values) => {
      return (
        values === "S" || values === "M" || values === "L" || values === "XL"
      );
    });

    if (sizeArray && sizeArray.length > 0) {
      filteredproducts = filteredproducts.filter((product) => {
        return sizeArray.includes(product.sizes);
      });
    }

    //--------creating array of values of prices and filtering product according to that ---------//
    const priceRangeArray = filter_values.filter((values) => {
      return values.includes("-");
    });

    if (priceRangeArray && priceRangeArray.length > 0) {
      filteredproducts = filteredproducts.filter((product) => {
        return priceRangeArray.some((range) => {
          const min = parseFloat(range.split("-")[0]);
          const max = parseFloat(range.split("-")[1]);
          return product.price >= min && product.price <= max;
        });
      });
    }

    //--------creating array of values of colours and filtering product according to that ---------//
    const colourArray = filter_values.filter((values) => {
      return values === "red" || values === "blue" || values === "black";
    });
    if (colourArray && colourArray.length > 0) {
      filteredproducts = filteredproducts.filter((product) => {
        return colourArray.includes(product.colours);
      });
    }
  }

  products = filteredproducts;
  productCards = products.map((product) => createProductCard(product)); //--------mapping the filtered products
  productDiv.innerHTML = productCards.join("");
}

//========>>>> searchbar functionality<<<<========//
let searchBarFilter = document.getElementById("searchIcon");
let searchInputValueFunction = document.getElementById("searchBar");

let newProducts;
searchInputValueFunction.addEventListener("keyup", () => {
  //--------- using keyup function to filter data in real time
  let searchInputValue = document.getElementById("searchBar");
  productDiv.innerHTML = "";
  let searchValue = searchInputValue.value; //------------------- accessing the searched value
  products = tofilterData;
  products = products.filter((product) => {
    //-------- filtering data according to name
    return product.title.toLowerCase().includes(searchValue.toLowerCase());
  });
  products.sort(); //-----------------sorting the data
  newProducts = products.map((product) => createProductCard(product));
  productDiv.innerHTML = newProducts.join("");
});

//======>>>>>>>>navbar navigation<<<<<<<<=========//

const home = document.getElementById("listItemHome");
const login = document.getElementById("listItemLogIn");
const signup = document.getElementById("listItemSignUp");
const myprofile = document.getElementById("listItemProfile");
const mycart = document.getElementById("listItemMyCart");

const shop = document.getElementById("listItemShop");

home.addEventListener("click", () => {
  location.reload();
});

login.addEventListener("click", () => {
  alert("Logout first");
});
signup.addEventListener("click", () => {
  alert("Logout First to sign up");
});

const user = JSON.parse(localStorage.getItem("currentUser"));
myprofile.addEventListener("click", () => {
  if (user) {
    window.location.href = "../MyProfile/myprofile.html";
  } else {
    alert("LogIn first");
  }
});
mycart.addEventListener("click", () => {
  if (user) {
    window.location.href = "../MyCart/mycart.html";
  } else {
    alert("LogIn first");
  }
});

shop.addEventListener("click", () => {
  location.reload();
});
