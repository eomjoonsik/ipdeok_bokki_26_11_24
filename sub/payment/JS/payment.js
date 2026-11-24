
const productList = document.querySelector(".payment-products");

const popup = document.querySelector("#cancel-popup");
const yesButton = document.querySelector("#cancel-yes");
const noButton = document.querySelector("#cancel-no");

const coupons = document.querySelectorAll(".coupon-card");
const orderButton = document.querySelector(".final-order-btn");

let deleteIndex = null;
let selectedCoupon = -1;

let products = [
    {
        name: "로제 떡볶이",
        price: 16000,
        quantity: 1,
        spicy: "보통맛",
        toppings: [],
        image: "product2"
    }
];

const savedProduct = sessionStorage.getItem("selectedProduct");

if (savedProduct) {
    try {
        products.push(JSON.parse(savedProduct));
    } catch (error) {
        sessionStorage.removeItem("selectedProduct");
    }
}

function formatPrice(price) {
    return price.toLocaleString("ko-KR") + "원";
}

function renderProducts() {

    productList.innerHTML = "";

    if (products.length === 0) {

        productList.innerHTML = `
            <div class="empty-cart">
                <p>담긴 상품이 없어요</p>
                <a href="../lists/lists.html">
                    메뉴 보러 가기
                </a>
            </div>
        `;

        updateTotal();
        return;

    }

    products.forEach((product, index) => {

        const card = document.createElement("div");
        card.className = "payment-product";

        const image = document.createElement("div");
        image.className = "payment-img " + product.image;

        const info = document.createElement("div");
        info.className = "product-info";

        const name = document.createElement("h3");
        name.textContent = product.name;

        const description = document.createElement("p");

        description.textContent =
            product.spicy + " / " +
            (product.toppings.length > 0
                ? product.toppings.join(", ")
                : "추가 토핑 없음");

        const bottom = document.createElement("div");
        bottom.className = "product-bottom";

        bottom.innerHTML = `
            <strong>
                ${formatPrice(product.price * product.quantity)}
            </strong>

            <div class="quantity">
                <button type="button">−</button>
                <span>${product.quantity}</span>
                <button type="button">+</button>
            </div>
        `;

        info.append(name, description, bottom);
        card.append(image, info);
        productList.appendChild(card);

        const minus = card.querySelector(
            ".quantity button:first-child"
        );

        const plus = card.querySelector(
            ".quantity button:last-child"
        );

        plus.addEventListener("click", () => {

            products[index].quantity++;
            renderProducts();

        });

        minus.addEventListener("click", () => {

            if (products[index].quantity > 1) {

                products[index].quantity--;
                renderProducts();

            } else {

                deleteIndex = index;
                popup.classList.add("show");

            }

        });

    });

    updateTotal();

}

yesButton.addEventListener("click", () => {

    if (deleteIndex !== null) {

        products.splice(deleteIndex, 1);
        renderProducts();

    }

    deleteIndex = null;
    popup.classList.remove("show");

});

noButton.addEventListener("click", () => {

    deleteIndex = null;
    popup.classList.remove("show");

});

function updateTotal() {

    const menuTotal = products.reduce((sum, product) => {

        return sum + product.price * product.quantity;

    }, 0);

    const deliveryFee = products.length > 0 ? 3000 : 0;

    const couponAvailable = [
        menuTotal >= 20000,
        menuTotal >= 50000
    ];

    if (
        selectedCoupon !== -1 &&
        !couponAvailable[selectedCoupon]
    ) {
        selectedCoupon = -1;
    }

    coupons.forEach((coupon, index) => {

        coupon.classList.toggle(
            "unavailable",
            !couponAvailable[index]
        );

        coupon.classList.toggle(
            "selected",
            selectedCoupon === index
        );

        let status = coupon.querySelector(".coupon-status");

        if (!status) {

            status = document.createElement("span");
            status.className = "coupon-status";

            coupon.querySelector(".coupon-info")
                .appendChild(status);

        }

        const minimumPrice = index === 0 ? 20000 : 50000;

        if (couponAvailable[index]) {

            status.textContent =
                selectedCoupon === index
                    ? "적용 완료"
                    : "사용 가능";

        } else {

            status.textContent =
                formatPrice(minimumPrice - menuTotal) +
                " 더 담으면 사용 가능";

        }

    });

    let discount = 0;

    if (selectedCoupon === 0) {
        discount = 5000;
    }

    if (selectedCoupon === 1) {
        discount = deliveryFee;
    }

    const finalPrice = menuTotal + deliveryFee - discount;

    document.querySelector("#menu-total").textContent =
        formatPrice(menuTotal);

    document.querySelector("#delivery-fee").textContent =
        formatPrice(deliveryFee);

    document.querySelector("#coupon-discount").textContent =
        discount > 0
            ? "-" + formatPrice(discount)
            : "0원";

    document.querySelector("#final-price").textContent =
        formatPrice(finalPrice);

    orderButton.classList.toggle(
        "disabled",
        products.length === 0
    );

    orderButton.setAttribute(
        "aria-disabled",
        products.length === 0
    );

}

coupons.forEach((coupon, index) => {

    coupon.addEventListener("click", () => {

        if (coupon.classList.contains("unavailable")) {
            return;
        }

        selectedCoupon =
            selectedCoupon === index ? -1 : index;

        updateTotal();

    });

});

const paymentOptions = document.querySelectorAll(
    'input[name="payment-method"]'
);

const methodButtons = document.querySelectorAll(".method-btn");

function updatePaymentMethods() {

    const generalPayment = paymentOptions[1].checked;

    methodButtons.forEach(button => {

        button.disabled = !generalPayment;

        if (!generalPayment) {
            button.classList.remove("selected");
        }

    });

}

paymentOptions.forEach(option => {

    option.addEventListener(
        "change",
        updatePaymentMethods
    );

});

methodButtons.forEach(button => {

    button.addEventListener("click", () => {

        methodButtons.forEach(item => {
            item.classList.remove("selected");
        });

        button.classList.add("selected");

    });

});

orderButton.addEventListener("click", event => {

    if (products.length === 0) {

        event.preventDefault();
        return;

    }

    sessionStorage.removeItem("selectedProduct");

});

renderProducts();
updatePaymentMethods();
