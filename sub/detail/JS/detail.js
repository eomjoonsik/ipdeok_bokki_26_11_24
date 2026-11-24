
const products = {
    1: {
        name: "오리지널 떡볶이",
        description: "입덕볶이의 시그니처 메뉴,\n매콤달콤한 중독적인 맛!",
        price: 14000,
        image: "../lists/img/list1.png",
        paymentImage: "product1",
        badge: "BEST MENU"
    },

    2: {
        name: "로제 떡볶이",
        description: "부드러운 크림과 매콤한 소스의 만남,\n꾸덕하고 고소한 로제 떡볶이!",
        price: 16000,
        image: "../lists/img/list2.png",
        paymentImage: "product2",
        badge: "NEW MENU"
    },

    3: {
        name: "마라 떡볶이",
        description: "얼얼한 마라와 쫄깃한 떡의 조합,\n한 번 먹으면 멈출 수 없는 맛!",
        price: 17000,
        image: "../lists/img/list3.png",
        paymentImage: "product3",
        badge: "IPDEOK MENU"
    },

    4: {
        name: "짜장 떡볶이",
        description: "달콤하고 고소한 짜장 소스,\n부담 없이 즐기는 맛있는 떡볶이!",
        price: 14000,
        image: "../lists/img/list4.png",
        paymentImage: "product4",
        badge: "IPDEOK MENU"
    },

    5: {
        name: "크림 떡볶이",
        description: "진하고 부드러운 크림 소스,\n고소한 풍미가 가득한 떡볶이!",
        price: 16000,
        image: "../lists/img/list5.png",
        paymentImage: "product5",
        badge: "IPDEOK MENU"
    },

    6: {
        name: "치즈 떡볶이",
        description: "쭉 늘어나는 풍부한 치즈,\n매콤함과 고소함을 한 번에!",
        price: 15000,
        image: "../lists/img/list6.png",
        paymentImage: "product6",
        badge: "IPDEOK MENU"
    }
};

const params = new URLSearchParams(window.location.search);
const productId = params.get("id") || "1";

const selectedProduct = Object.hasOwn(products, productId)
    ? products[productId]
    : products[1];

const basePrice = selectedProduct.price;

let quantity = 1;

const minus = document.querySelector("#minus");
const plus = document.querySelector("#plus");
const quantityText = document.querySelector("#quantity");
const totalPrice = document.querySelector("#total-price");
const toppings = document.querySelectorAll(".topping");
const orderButton = document.querySelector(".detail-order-btn");

document.querySelector("#product-name").textContent =
    selectedProduct.name;

document.querySelector("#product-description").textContent =
    selectedProduct.description;

document.querySelector("#base-price").textContent =
    basePrice.toLocaleString("ko-KR") + "원";

document.querySelector("#detail-badge").textContent =
    selectedProduct.badge;

document.querySelector("#detail-img").style.backgroundImage =
    `url("${selectedProduct.image}")`;

document.querySelector("#detail-img").setAttribute(
    "role", "img"
);

document.querySelector("#detail-img").setAttribute(
    "aria-label", selectedProduct.name
);

document.title = "입덕볶이 | " + selectedProduct.name;

function getToppingPrice() {

    let price = 0;

    toppings.forEach(topping => {
        if (topping.checked) {
            price += Number(topping.value);
        }
    });

    return price;
}

function updatePrice() {

    const total = (basePrice + getToppingPrice()) * quantity;

    quantityText.textContent = quantity;

    totalPrice.textContent =
        total.toLocaleString("ko-KR") + "원";

    minus.disabled = quantity === 1;
}

plus.addEventListener("click", () => {
    quantity++;
    updatePrice();
});

minus.addEventListener("click", () => {
    if (quantity > 1) {
        quantity--;
        updatePrice();
    }
});

toppings.forEach(topping => {
    topping.addEventListener("change", updatePrice);
});

orderButton.addEventListener("click", () => {

    const spicy = document.querySelector(
        'input[name="spicy"]:checked'
    ).value;

    const selectedToppings = [];

    toppings.forEach(topping => {
        if (topping.checked) {
            selectedToppings.push(
                topping.parentElement.querySelector("span").textContent
            );
        }
    });

    const product = {
        name: selectedProduct.name,
        price: basePrice + getToppingPrice(),
        quantity: quantity,
        spicy: spicy,
        toppings: selectedToppings,
        image: selectedProduct.paymentImage
    };

    sessionStorage.setItem(
        "selectedProduct",
        JSON.stringify(product)
    );

});

updatePrice();
