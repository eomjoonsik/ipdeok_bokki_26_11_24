const questions = [
    {
        title: "평범한 어느 날, 길을 걷다가 완전히 내 취향인 노래를 발견했다!",
        answers: [
            ["당장 플레이리스트에 넣고 무한 반복한다.", "A"],
            ["신나는 비트에 나도 모르게 리듬을 탄다.", "C"],
            ["이 가수의 다른 노래까지 찾아본다.", "D"],
            ["마음에 드는 가사를 저장해 둔다.", "B"]
        ]
    },
    {
        title: "기분 좋게 노래를 들으며 걷던 중, 이상형을 마주쳤다. 어떤 사람일까?",
        answers: [
            ["웃는 모습이 귀여운 강아지상", "B"],
            ["무표정일 땐 차갑지만 웃으면 귀여운 사람", "D"],
            ["시대를 타지 않는 정석 미남", "A"],
            ["지나가다가도 뒤돌아보게 되는 핫한 사람", "C"]
        ]
    },
    {
        title: "집에 돌아와 드라마를 틀었다. 주인공보다 더 눈길이 가는 캐릭터는?",
        answers: [
            ["등장할 때마다 레전드를 찍는 캐릭터", "C"],
            ["결국 모든 사람이 좋아하게 되는 정석 주인공", "A"],
            ["어딘가 허술해서 자꾸 챙겨주고 싶은 캐릭터", "B"],
            ["처음엔 별로였는데 어느새 최애가 된 캐릭터", "D"]
        ]
    },
    {
        title: "그렇게 취향으로 가득 찬 하루, 나에게 작은 선물을 사준다면?",
        answers: [
            ["좋아하는 간식을 종류별로 잔뜩!", "D"],
            ["쓸모는 없지만 너무 귀여운 인형", "B"],
            ["뭐가 나올지 모르는 랜덤박스", "C"],
            ["예전부터 장바구니에 담아둔 물건", "A"]
        ]
    },
    {
        title: '마침 친구에게 연락이 왔다. "야, 떡볶이 먹으러 갈래?" 메뉴를 고르는 방법은?',
        answers: [
            ["실패 없는 인기 메뉴로!", "A"],
            ["평소에 안 먹어본 메뉴로!", "C"],
            ["친구와 취향을 맞춰서!", "B"],
            ["다양한 맛을 즐길 수 있는 조합으로!", "D"]
        ]
    }
];

const results = {

    A: {
        id: "set1",
        name: "근본 세트",
        type: "TYPE A / ORIGINAL",
        color: "#EA4028",
        text: "#FCF2E3",
        description: "돌고 돌아 결국 근본!",
        menu: "오리지널 떡볶이 + 김말이 + 튀김만두",
        price: 18000,
        image: "../lists/img/set1.png"
    },

    B: {
        id: "set2",
        name: "말랑 세트",
        type: "TYPE B / SOFT",
        color: "#FFB2C1",
        text: "#392520",
        description: "부드럽고 말랑한 게 좋아!",
        menu: "로제 떡볶이 + 치즈볼 + 감자튀김",
        price: 22000,
        image: "../lists/img/set2.png"
    },

    C: {
        id: "set3",
        name: "얼얼 세트",
        type: "TYPE C / SPICY",
        color: "#762E28",
        text: "#FCF2E3",
        description: "강렬한 맛은 참을 수 없어!",
        menu: "마라 떡볶이 + 중국당면 + 순살치킨",
        price: 23000,
        image: "../lists/img/set3.png"
    },

    D: {
        id: "set4",
        name: "단짠 세트",
        type: "TYPE D / SWEET",
        color: "#FFD45C",
        text: "#392520",
        description: "달콤하고 짭짤한 완벽한 조합!",
        menu: "치즈 떡볶이 + 설탕 듬뿍 핫도그 + 주먹밥",
        price: 19500,
        image: "../lists/img/set4.png"
    }
};

const $ = id => document.getElementById(id);

let current = 0;
let answers = [];
let result = null;
let revealTimer;

function showScreen(id) {

    document.querySelectorAll(".test-screen").forEach(screen => {
        screen.hidden = screen.id !== id;
    });

    window.scrollTo(0, 0);
}

function showQuestion() {

    const question = questions[current];

    $("progress-number").textContent =
        String(current + 1).padStart(2, "0") + " / 05";

    $("progress-bar").style.width =
        ((current + 1) / questions.length * 100) + "%";

    $("question-number").textContent =
        "Q." + String(current + 1).padStart(2, "0");

    $("question-title").textContent = question.title;

    $("prev-btn").hidden = current === 0;

    $("answer-list").innerHTML = "";

    question.answers.forEach(([text, type], index) => {

        const button = document.createElement("button");

        button.className = "answer-btn";

        if (answers[current] === type) {
            button.classList.add("selected");
        }

        button.innerHTML = `
            <span class="answer-index">
                ${String(index + 1).padStart(2, "0")}
            </span>
            <span>${text}</span>
        `;

        button.onclick = () => {

            answers[current] = type;

            current++;

            if (current < questions.length) {
                showQuestion();
            } else {
                calculateResult();
            }
        };

        $("answer-list").appendChild(button);
    });
}

$("start-btn").onclick = () => {

    current = 0;
    answers = [];

    showScreen("question-screen");
    showQuestion();
};

$("prev-btn").onclick = () => {

    if (current > 0) {
        current--;
        showQuestion();
    }
};

function calculateResult() {

    const scores = {
        A: 0,
        B: 0,
        C: 0,
        D: 0
    };

    answers.forEach(type => {
        scores[type]++;
    });

    const highest = Math.max(...Object.values(scores));

    const candidates = Object.keys(scores).filter(type => {
        return scores[type] === highest;
    });

    const winner = answers.find(type => {
        return candidates.includes(type);
    });

    result = results[winner];

    $("recommended-order").href =
        "../detail/detail.html?id=" + result.id;

    $("result-card").style.background = result.color;

    $("result-card").style.color = result.text;

    $("result-type").textContent = result.type;

    $("result-name").textContent = result.name;

    $("result-description").textContent =
        result.description;

    $("result-img").src = result.image;

    $("result-img").alt = result.name;

    $("result-price").textContent =
        result.price.toLocaleString("ko-KR") + "원";

    $("result-menu").textContent = result.menu;

    $("result-heading").textContent =
        "두근두근 당신의 취향으로 가득찼어요!";

    $("result-guide").textContent =
        "당신이 좋아하는 것들을 모아 취향의 카드팩을 준비했어요.\n과연 당신이 입덕할 메뉴는?";

    $("reveal-stage").classList.remove("opened");

    $("open-pack").disabled = false;

    $("result-actions").hidden = true;

    showScreen("result-screen");
}

$("open-pack").onclick = () => {

    if (!result) return;

    $("open-pack").disabled = true;

    $("reveal-stage").classList.add("opened");

    $("result-heading").textContent =
        "당신의 최애는 " + result.name + "!";

    $("result-guide").textContent =
        result.description;

    revealTimer = setTimeout(() => {
        $("result-actions").hidden = false;
    }, 1100);
};

$("restart-btn").onclick = () => {

    clearTimeout(revealTimer);

    current = 0;

    answers = [];

    result = null;

    $("reveal-stage").classList.remove("opened");

    showScreen("start-screen");
};

$("save-card").onclick = async () => {

    if (!result) return;

    const canvas = document.createElement("canvas");

    canvas.width = 690;
    canvas.height = 1020;

    const ctx = canvas.getContext("2d");

    const image = new Image();

    try {

        image.src = result.image;

        await image.decode();

        if (document.fonts) {
            await document.fonts.ready;
        }

        ctx.fillStyle = result.color;

        ctx.fillRect(0, 0, 690, 1020);

        ctx.strokeStyle = "#392520";

        ctx.lineWidth = 6;

        ctx.strokeRect(3, 3, 684, 1014);

        ctx.fillStyle = result.text;

        ctx.font = 'bold 32px "Noto Sans KR", sans-serif';

        ctx.fillText(result.type, 35, 65);

        ctx.fillStyle = "rgba(255,255,255,.22)";

        ctx.fillRect(35, 100, 620, 620);

        const scale = Math.min(
            620 / image.width,
            620 / image.height
        );

        const width = image.width * scale;

        const height = image.height * scale;

        ctx.drawImage(
            image,
            35 + (620 - width) / 2,
            100 + (620 - height) / 2,
            width,
            height
        );

        ctx.fillStyle = result.text;

        ctx.font = 'bold 25px "Noto Sans KR", sans-serif';

        ctx.fillText("MY FAVORITE MENU", 35, 765);

        ctx.font = 'bold 64px "Noto Sans KR", sans-serif';

        ctx.fillText(result.name, 35, 840);

        ctx.font = '30px "Noto Sans KR", sans-serif';

        ctx.fillText(result.description, 35, 890);

        ctx.font = 'bold 32px "Noto Sans KR", sans-serif';

        ctx.fillText(
            result.price.toLocaleString("ko-KR") + "원",
            35,
            935
        );

        ctx.strokeStyle = result.text;

        ctx.beginPath();

        ctx.moveTo(35, 960);

        ctx.lineTo(655, 960);

        ctx.stroke();

        ctx.font = 'bold 21px "Noto Sans KR", sans-serif';

        ctx.fillText("IPDEOK BOKKI © 2026", 35, 995);

        const link = document.createElement("a");

        link.download = "입덕볶이_" + result.name + ".png";

        link.href = canvas.toDataURL("image/png");

        link.click();

    } catch (error) {

        alert("포토카드를 저장하지 못했어요. 이미지 경로와 실행 환경을 확인해 주세요.");

    }
};