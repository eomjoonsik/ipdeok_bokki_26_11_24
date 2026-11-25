const cupidStage = document.getElementById("cupid-stage");

if (cupidStage) {

    let completedOrder = null;

    try {

        completedOrder = JSON.parse(
            sessionStorage.getItem("ipdeokOrder") || "null"
        );

    } catch {}

    if (completedOrder && Array.isArray(completedOrder.products)) {

        cupidStage.classList.add("play");

    } else {

        cupidStage.hidden = true;

    }
}