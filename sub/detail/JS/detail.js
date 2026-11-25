const products = {

    list1: {
        name: "오리지널 떡볶이",
        price: 9000,
        large: 14000,
        category: "떡볶이",
        description: "입덕볶이의 시그니처!\n매콤달콤한 정석의 맛.",
        color: "#FFBC85",
        badge: "BEST MENU"
    },

    list2: {
        name: "로제 떡볶이",
        price: 11000,
        large: 16000,
        category: "떡볶이",
        description: "부드러운 크림과 매콤한 소스의 만남.",
        color: "#FFB2C1",
        badge: "POPULAR MENU"
    },

    list3: {
        name: "마라 떡볶이",
        price: 12000,
        large: 17000,
        category: "떡볶이",
        description: "한 번 빠지면 헤어 나올 수 없는 얼얼한 맛!",
        color: "#D99780"
    },

    list4: {
        name: "짜장 떡볶이",
        price: 9000,
        large: 14000,
        category: "떡볶이",
        description: "달콤하고 고소한 짜장 소스.",
        color: "#E7C79D"
    },

    list5: {
        name: "크림 떡볶이",
        price: 11000,
        large: 16000,
        category: "떡볶이",
        description: "부드럽고 진한 크림의 풍미.",
        color: "#F5DDB0"
    },

    list6: {
        name: "치즈 떡볶이",
        price: 10000,
        large: 15000,
        category: "떡볶이",
        description: "쭉 늘어나는 치즈와 매콤달콤한 소스.",
        color: "#FFD45C"
    },

    set1: {
        name: "근본 세트",
        price: 18000,
        category: "세트메뉴",
        description: "돌고 돌아 결국 근본!\n오리지널 떡볶이 2인분 + 김말이 + 튀김만두",
        color: "#EA4028",
        badge: "TYPE A / ORIGINAL"
    },

    set2: {
        name: "말랑 세트",
        price: 22000,
        category: "세트메뉴",
        description: "귀여운 게 세상을 구한다!\n로제 떡볶이 2인분 + 치즈볼 + 감자튀김",
        color: "#FFB2C1",
        badge: "TYPE B / SOFT"
    },

    set3: {
        name: "얼얼 세트",
        price: 23000,
        category: "세트메뉴",
        description: "강렬할수록 빠져드는 나의 취향!\n마라 떡볶이 2인분 + 중국당면 + 순살치킨",
        color: "#762E28",
        badge: "TYPE C / SPICY"
    },

    set4: {
        name: "단짠 세트",
        price: 19500,
        category: "세트메뉴",
        description: "반전 매력에 약한 편입니다.\n치즈 떡볶이 2인분 + 설탕 듬뿍 핫도그 + 주먹밥",
        color: "#FFD45C",
        badge: "TYPE D / SWEET"
    },

    side1: {
        name: "김말이",
        price: 3000,
        category: "사이드",
        description: "겉은 바삭하고 속은 촉촉한 김말이."
    },

    side2: {
        name: "튀김만두",
        price: 3000,
        category: "사이드",
        description: "떡볶이 소스에 찍어 먹으면 더 맛있는 만두."
    },

    side3: {
        name: "치즈볼",
        price: 4000,
        category: "사이드",
        description: "한입 베어 물면 쭉 늘어나는 치즈!"
    },

    side4: {
        name: "감자튀김",
        price: 4000,
        category: "사이드",
        description: "바삭하고 짭짤한 감자튀김."
    },

    side5: {
        name: "순살치킨",
        price: 6000,
        category: "사이드",
        description: "한입에 쏙 들어가는 맛있는 순살치킨."
    },

    side6: {
        name: "설탕 듬뿍 핫도그",
        price: 3000,
        category: "사이드",
        description: "달콤한 설탕과 바삭한 핫도그의 조합."
    },

    side7: {
        name: "주먹밥",
        price: 3500,
        category: "사이드",
        description: "매콤한 떡볶이와 잘 어울리는 고소한 주먹밥."
    },

    side8: {
        name: "모둠튀김",
        price: 5000,
        category: "사이드",
        description: "다양한 튀김을 한 번에 즐겨보세요."
    },

    side9: {
        name: "중국당면",
        price: 2000,
        category: "사이드",
        description: "쫄깃하고 넓적한 중국당면."
    }
};

const $ = id => document.getElementById(id);

const money = price =>
    price.toLocaleString("ko-KR") + "원";

const params = new URLSearchParams(location.search);

let productId = params.get("id") || "list1";

if (/^[1-6]$/.test(productId)) {
    productId = "list" + productId;
}

if (!Object.hasOwn(products, productId)) {
    productId = "list1";
}

const product = products[productId];

const isTteokbokki = product.category === "떡볶이";
const isSide = product.category === "사이드";

let quantity = 1;

function getCart() {
    try {
        const cart = JSON.parse(
            localStorage.getItem("ipdeokCart") || "[]"
        );

        return Array.isArray(cart) ? cart : [];

    } catch {
        return [];
    }
}

function updateCartCount() {
    $("cart-count").textContent = getCart().reduce(
        (sum, item) => sum + item.quantity, 0
    );
}

$("product-name").textContent = product.name;
$("product-description").textContent = product.description;

$("detail-badge").textContent =
    product.badge || "IPDEOK MENU";

$("detail-img").style.backgroundImage =
    `url("../lists/img/${productId}.png")`;

$("detail-img").style.backgroundColor =
    product.color || "#FFDDB5";

document.title = "입덕볶이 | " + product.name;

$("portion-section").hidden = !isTteokbokki;
$("spicy-section").hidden = isSide;
$("topping-section").hidden = isSide;

if (isTteokbokki) {
    $("portion-one").textContent = money(product.price);
    $("portion-two").textContent = money(product.large);
}

function getPortion() {
    if (!isTteokbokki) return "";

    return document.querySelector(
        'input[name="portion"]:checked'
    ).value;
}

function getBasePrice() {
    if (isTteokbokki && getPortion() === "2") {
        return product.large;
    }

    return product.price;
}

function getToppings() {

    if (isSide) return [];

    return Array.from(
        document.querySelectorAll(".topping:checked")
    ).map(input => ({
        name: input.parentElement.querySelector("span").textContent,
        price: Number(input.value)
    }));
}

function getUnitPrice() {
    return getBasePrice() + getToppings().reduce(
        (sum, topping) => sum + topping.price, 0
    );
}

function updatePrice() {

    $("base-price").textContent = money(getBasePrice());

    $("total-price").textContent =
        money(getUnitPrice() * quantity);

    $("quantity").textContent = quantity;

    $("minus").disabled = quantity <= 1;
    $("plus").disabled = quantity >= 99;
}

$("plus").onclick = () => {
    if (quantity < 99) quantity++;
    updatePrice();
};

$("minus").onclick = () => {
    if (quantity > 1) quantity--;
    updatePrice();
};

document.querySelectorAll(
    'input[name="portion"], .topping'
).forEach(input => {
    input.addEventListener("change", updatePrice);
});

function addToCart() {

    const toppings = getToppings().map(topping => topping.name);

    const spicy = isSide
        ? ""
        : document.querySelector(
            'input[name="spicy"]:checked'
        ).value;

    const portion = getPortion();

    const item = {
        id: productId,
        name: product.name,
        category: product.category,
        portion: portion,
        spicy: spicy,
        toppings: toppings,
        price: getUnitPrice(),
        quantity: quantity,
        image: productId + ".png"
    };

    const cart = getCart();

    const sameItem = cart.find(saved =>
        saved.id === item.id &&
        saved.portion === item.portion &&
        saved.spicy === item.spicy &&
        saved.price === item.price &&
        JSON.stringify(saved.toppings) ===
        JSON.stringify(item.toppings)
    );

    if (sameItem) {
        sameItem.quantity = Math.min(
            99,
            sameItem.quantity + quantity
        );
    } else {
        cart.push(item);
    }

    localStorage.setItem(
        "ipdeokCart",
        JSON.stringify(cart)
    );

    updateCartCount();
}

$("add-cart").onclick = () => {
    addToCart();
    $("cart-popup").hidden = false;
};

$("buy-now").onclick = () => {
    addToCart();
    location.href = "../payment/payment.html";
};

$("close-popup").onclick = () => {
    $("cart-popup").hidden = true;
};

updatePrice();
updateCartCount();