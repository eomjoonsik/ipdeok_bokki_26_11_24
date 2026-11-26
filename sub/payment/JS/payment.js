const $ = id => document.getElementById(id);

const productList = document.querySelector(".payment-products");
const coupons = document.querySelectorAll(".coupon-card");
const methods = document.querySelectorAll(".method-btn");

let products = [];
let deleteIndex = null;
let selectedCoupon = -1;
let selectedMethod = "";
let finalPrice = 0;

try {
    products = JSON.parse(
        localStorage.getItem("ipdeokCart") || "[]"
    );

    if (!Array.isArray(products)) {
        products = [];
    }

} catch {
    products = [];
}

function money(price) {
    return price.toLocaleString("ko-KR") + "원";
}

function saveCart() {
    localStorage.setItem(
        "ipdeokCart",
        JSON.stringify(products)
    );
}

function renderProducts() {

    productList.innerHTML = "";

    if (products.length === 0) {

        productList.innerHTML = `
            <div class="empty-cart">
                <p>아직 담은 메뉴가 없어요.</p>
                <a href="../lists/lists.html">
                    최애 메뉴 찾기 ↗
                </a>
            </div>
        `;

        updateTotal();
        return;
    }

    products.forEach((product, index) => {

        const options = [];

        if (product.portion) {
            options.push(product.portion + "인분");
        }

        if (product.spicy) {
            options.push(product.spicy);
        }

        if (product.toppings.length > 0) {
            options.push(product.toppings.join(", "));
        }

        const item = document.createElement("article");

        item.className = "payment-product";

        item.innerHTML = `
            <div class="payment-img"></div>

            <div class="product-info">

                <h3></h3>

                <p class="product-options"></p>

                <div class="product-bottom">

                    <strong>
                        ${money(product.price * product.quantity)}
                    </strong>

                    <div class="quantity">
                        <button class="minus">−</button>
                        <span>${product.quantity}</span>
                        <button class="plus">+</button>
                    </div>

                </div>

                <button class="delete-product">
                    상품 삭제
                </button>

            </div>
        `;

        item.querySelector("h3").textContent = product.name;

        item.querySelector(".product-options").textContent =
            options.join(" / ") || "기본 구성";

        item.querySelector(".payment-img").style.backgroundImage =
            `url("../lists/img/${product.image}")`;

        item.querySelector(".plus").onclick = () => {

            if (product.quantity < 99) {
                product.quantity++;
            }

            saveCart();
            renderProducts();
        };

        item.querySelector(".minus").onclick = () => {

            if (product.quantity > 1) {

                product.quantity--;

                saveCart();
                renderProducts();

            } else {

                openDeletePopup(index);
            }
        };

        item.querySelector(".delete-product").onclick = () => {
            openDeletePopup(index);
        };

        productList.appendChild(item);
    });

    updateTotal();
}

function openDeletePopup(index) {
    deleteIndex = index;
    $("cancel-popup").classList.add("show");
}

$("cancel-yes").onclick = () => {

    if (deleteIndex !== null) {
        products.splice(deleteIndex, 1);
    }

    deleteIndex = null;

    $("cancel-popup").classList.remove("show");

    saveCart();
    renderProducts();
};

$("cancel-no").onclick = () => {
    deleteIndex = null;
    $("cancel-popup").classList.remove("show");
};

function getMenuTotal() {

    return products.reduce(
        (sum, product) =>
            sum + product.price * product.quantity,
        0
    );
}

function updateTotal() {

    const menuTotal = getMenuTotal();

    const deliveryFee = products.length > 0
        ? 3000
        : 0;

    const conditions = [
        !!Auth.user() && !Auth.get("welcomeUsed") && Date.now()-Auth.user().joined < 30*86400000 && menuTotal >= 20000,
        !!Auth.user() && menuTotal >= 50000,
        !!Auth.user() && Collection.available() > 0 && menuTotal >= 5000
    ];

    if (
        selectedCoupon !== -1 &&
        !conditions[selectedCoupon]
    ) {
        selectedCoupon = -1;
    }

    coupons.forEach((coupon, index) => {

        coupon.classList.toggle(
            "unavailable",
            !conditions[index]
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

        if (!Auth.user()) {
            status.textContent = "회원 전용 · 로그인 필요";
        } else if (index === 0 && (Auth.get("welcomeUsed") || Date.now()-Auth.user().joined >= 30*86400000)) {
            status.textContent = "사용 완료 또는 기간 만료";
        } else if (index === 2 && !Collection.available()) {
            status.textContent = "5회 주문 달성 시 지급";
        } else if (selectedCoupon === index) {

            status.textContent = "적용 완료";

        } else if (conditions[index]) {

            status.textContent = "사용 가능";

        } else {

            const required = index === 0
                ? 20000
                : index === 1 ? 50000 : 5000;

            status.textContent =
                money(required - menuTotal) +
                " 더 담으면 사용 가능";
        }
    });

    let discount = 0;

    if (selectedCoupon === 0 || selectedCoupon === 2) {
        discount = 5000;
    }

    if (selectedCoupon === 1) {
        discount = deliveryFee;
    }

    finalPrice = menuTotal + deliveryFee - discount;

    $("menu-total").textContent = money(menuTotal);

    $("delivery-fee").textContent = money(deliveryFee);

    $("coupon-discount").textContent =
        discount > 0 ? "-" + money(discount) : "0원";

    $("final-price").textContent = money(finalPrice);

    $("order-btn").textContent =
        money(finalPrice) + " 주문하기";

    $("order-btn").disabled = products.length === 0;
}

coupons.forEach((coupon, index) => {

    coupon.onclick = () => {

        const menuTotal = getMenuTotal();

        const required = index === 0
            ? 20000
            : index === 1 ? 50000 : 5000;

        if (!Auth.user()) { if(confirm("회원 쿠폰을 사용하려면 로그인해 주세요.")) Auth.login(); return; }
        if (index === 0 && (Auth.get("welcomeUsed") || Date.now()-Auth.user().joined >= 30*86400000)) return;
        if (menuTotal < required || (index === 2 && !Collection.available())) return;

        selectedCoupon = selectedCoupon === index
            ? -1
            : index;

        updateTotal();
    };
});

function updatePaymentMethods() {

    const paymentType = document.querySelector(
        'input[name="payment-method"]:checked'
    ).value;

    const isGeneral = paymentType === "일반 결제";

    selectedMethod = isGeneral ? "" : "입덕페이";

    methods.forEach(button => {

        button.disabled = !isGeneral;

        button.classList.remove("selected");
    });
}

document.querySelectorAll(
    'input[name="payment-method"]'
).forEach(input => {

    input.onchange = updatePaymentMethods;
});

methods.forEach(button => {

    button.onclick = () => {

        selectedMethod = button.dataset.method;

        methods.forEach(method => {
            method.classList.toggle(
                "selected",
                method === button
            );
        });
    };
});

$("delivery-address").value =
    (Auth.user() ? Auth.get("ipdeokAddress") : "") || "";

$("delivery-detail").value =
    (Auth.user() ? Auth.get("ipdeokAddressDetail") : "") || "";

$("delivery-address").onchange = () => {

    if (Auth.user()) Auth.save(
        "ipdeokAddress",
        $("delivery-address").value.trim()
    );
};

$("delivery-detail").onchange = () => {

    if (Auth.user()) Auth.save(
        "ipdeokAddressDetail",
        $("delivery-detail").value.trim()
    );
};

$("delivery-request").onchange = () => {

    $("custom-request").hidden =
        $("delivery-request").value !== "custom";
};

$("order-btn").onclick = () => {

    if (products.length === 0) return;

    const address = $("delivery-address").value.trim();

    const detail = $("delivery-detail").value.trim();

    let request = $("delivery-request").value;

    if (request === "custom") {
        request = $("custom-request").value.trim();

        if (!request) {
            alert("배달 요청사항을 입력해 주세요.");
            $("custom-request").focus();
            return;
        }
    }

    if (!address) {

        alert("배달 주소를 입력해 주세요.");

        $("delivery-address").focus();

        return;
    }

    if (!selectedMethod) {

        alert("결제 수단을 선택해 주세요.");

        document.querySelector(".method-section")
            .scrollIntoView({
                behavior: "smooth"
            });

        return;
    }

    const order = {
        memberName: Auth.user()?.name || "",
        number: String(Date.now()),
        products: products,
        address: address,
        detail: detail,
        request: request,
        method: selectedMethod,
        total: finalPrice,
        time: "40~50분"
    };

    updateTotal();
    order.total = finalPrice;
    order.memberId = Auth.user()?.id || null;
    order.collection = Collection.award(order, selectedCoupon === 2);
    $("order-btn").disabled = true;
    sessionStorage.setItem(
        "ipdeokOrder",
        JSON.stringify(order)
    );

    if (Auth.user()) { Auth.save("ipdeokAddress", address); Auth.save("ipdeokAddressDetail", detail); if(selectedCoupon===0) Auth.save("welcomeUsed","1"); }

    localStorage.removeItem("ipdeokCart");

    location.href =
        "../payment_finish/payment_finish.html";
};

renderProducts();
updatePaymentMethods();