let deckId;
let totaalPunten = 0;
let dealerpunten = 0;
let azenInHand = 0;
let dealerAzen = 0;
let inzet = 0;
let drawData = {};
let spelGestopt = false;
let dealButtonClicked = false;
const tekst = document.getElementById("tekst");
const deal = document.getElementById("deal");
deal.disabled = true;

let bankSaldo = localStorage.getItem("bankSaldo");
if (bankSaldo === "0") {
    bankSaldo = 1000;
}

function updateBankSaldo() {
    localStorage.setItem("bankSaldo", bankSaldo);
    document.getElementById("banksaldo").innerHTML = `Banksaldo: ${bankSaldo}`;
}

function fetchDeckAndDrawCards() {
    fetch("https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1")
        .then((response) => response.json())
        .then((data) => {
            deckId = data.deck_id;
            drawDealerCards(1);
            drawCards(2);
        });
}

function getdealerKaartWaarde(kaart) {
    const waarde = parseInt(kaart.value, 10);
    if (!Number.isNaN(waarde)) {
        return waarde;
    } else if (["KING", "QUEEN", "JACK"].includes(kaart.value)) {
        return 10;
    } else if (kaart.value === "ACE") {
        dealerAzen++;
        return 11;
    } else {
        return 10;
    }
}
function checkdealerAzen() {
    if (dealerpunten > 21 && dealerAzen > 0) {
        dealerpunten -= 10;
        dealerAzen--;
    }
}
function drawDealerCards(count) {
    fetch(`https://www.deckofcardsapi.com/api/deck/${deckId}/draw/?count=${count}`)
        .then((response) => response.json())
        .then((data) => {
            const dealerKaartenElement = document.getElementById('dealerKaarten');
            data.cards.forEach((kaart) => {
                const kaartAfbeelding = document.createElement('img');
                kaartAfbeelding.src = kaart.image;
                kaartAfbeelding.alt = kaart.code;
                dealerKaartenElement.appendChild(kaartAfbeelding);
                dealerpunten += getdealerKaartWaarde(kaart);
                checkdealerAzen();
                document.getElementById("dealerpunten").innerHTML = dealerpunten;
            });
            if (dealerpunten > 21) {
                tekst.innerHTML = `Dealer bust! you won`;
                tekst.style.visibility = "visible";
                bankSaldo = parseInt(bankSaldo, 10) + inzet;
                updateBankSaldo();
            }
        });
}

function getKaartWaarde(kaart) {
    const waarde = parseInt(kaart.value, 10);
    if (!Number.isNaN(waarde)) {
        return waarde;
    } else if (["KING", "QUEEN", "JACK"].includes(kaart.value)) {
        return 10;
    } else if (kaart.value === "ACE") {
        azenInHand++;
        return 11;
    } else {
        return 10;
    }
}

function checkAzen() {
    if (totaalPunten > 21 && azenInHand > 0) {
        totaalPunten -= 10;
        azenInHand--;
    }
}

function checkBlackjack() {
    if (totaalPunten === 21 && drawData.cards.length === 2) {
        tekst.innerHTML = `blackjack you won`;
        tekst.style.visibility = "visible";
        bankSaldo = parseInt(bankSaldo, 10) + inzet * 2.5;
        updateBankSaldo();
        drawDealerCards(1);
        setTimeout(function () {
            document.getElementById("again").style.visibility = "visible";
        }, 1500);
    }
}

function drawCards(count) {
    fetch(`https://www.deckofcardsapi.com/api/deck/${deckId}/draw/?count=${count}`)
        .then((response) => response.json())
        .then((data) => {
            drawData = data;
            const kaartenElement = document.getElementById('kaarten');
            drawData.cards.forEach((kaart) => {
                const kaartAfbeelding = document.createElement('img');
                kaartAfbeelding.src = kaart.image;
                kaartAfbeelding.alt = kaart.code;
                kaartenElement.appendChild(kaartAfbeelding);
                totaalPunten += getKaartWaarde(kaart);
                checkAzen();
                document.getElementById("punten").innerHTML = totaalPunten;
            });
            checkBlackjack();
            if (totaalPunten > 21) {
                disableTrekKaartButton();
                tekst.innerHTML = `bust! you lose`;
                tekst.style.visibility = "visible";
                document.getElementById("stand").disabled = true;
                drawDealerCards(1);
                bankSaldo -= inzet;
                updateBankSaldo();
                setTimeout(function () {
                    document.getElementById("again").style.visibility = "visible";
                }, 500);
            }
        });
}

function disableTrekKaartButton() {
    const trekKaartBtn = document.getElementById('trekKaartBtn');
    trekKaartBtn.disabled = true;
}

const trekKaartBtn = document.getElementById('trekKaartBtn');
trekKaartBtn.addEventListener('click', () => {
    drawCards(1);
});

document.getElementById("deal").addEventListener('click', () => {
    fetchDeckAndDrawCards();
    document.getElementById("chips").style.visibility = "hidden";
    document.getElementById("deal").style.visibility = "hidden";
    document.getElementById("stand").style.visibility = "visible";
    document.getElementById("trekKaartBtn").style.visibility = "visible";
    document.getElementById("img").style.visibility = "hidden";
    document.getElementById("inzet").style.top = "25px";
    document.getElementById("banksaldo").style.marginTop = "50px";
    dealButtonClicked = true;
    updateBankSaldo();
});

document.getElementById("stand").addEventListener('click', () => {
    spelGestopt = true;
    disableTrekKaartButton();
    function drawDealerCardsUntil17() {
        if (dealerpunten < 17) {
            drawDealerCards(1);
            setTimeout(drawDealerCardsUntil17, 1000);
        } if (totaalPunten < dealerpunten && dealerpunten < 22) {
            tekst.innerHTML = `you lose`;
            tekst.style.visibility = "visible";
            bankSaldo -= inzet;
            updateBankSaldo();
        } else if (totaalPunten == dealerpunten && dealerpunten > 16) {
            tekst.innerHTML = `draw`;
            tekst.style.visibility = "visible";
        } else if (totaalPunten > dealerpunten && dealerpunten > 16) {
            tekst.innerHTML = `you won`;
            tekst.style.visibility = "visible";
            bankSaldo = parseInt(bankSaldo, 10) + inzet;
            updateBankSaldo();
        }
    }
    drawDealerCardsUntil17();
    setTimeout(function () {
        document.getElementById("again").style.visibility = "visible";
    }, 1500);
});
function updateInzetButtonAvailability() {
    const twintigBtn = document.getElementById('twintig');
    const vijftigBtn = document.getElementById('vijftig');
    const honderdBtn = document.getElementById('honderd');

    twintigBtn.disabled = inzet + 20 > bankSaldo;
    vijftigBtn.disabled = inzet + 50 > bankSaldo;
    honderdBtn.disabled = inzet + 100 > bankSaldo;
}

document.getElementById("twintig").addEventListener('click', () => {
    if (inzet + 20 <= bankSaldo) {
        inzet += 20;
        document.getElementById("inzet").innerHTML = `inzet: ${inzet}`;
        updateInzetButtonAvailability();
        deal.disabled = false;
    }
});

document.getElementById("vijftig").addEventListener('click', () => {
    if (inzet + 50 <= bankSaldo) {
        inzet += 50;
        document.getElementById("inzet").innerHTML = `inzet: ${inzet}`;
        updateInzetButtonAvailability();
        deal.disabled = false;
    }
});

document.getElementById("honderd").addEventListener('click', () => {
    if (inzet + 100 <= bankSaldo) {
        inzet += 100;
        document.getElementById("inzet").innerHTML = `inzet: ${inzet}`;
        updateInzetButtonAvailability();
        deal.disabled = false;
    }
});

document.getElementById("inzet").addEventListener("click", () => {
    if (!dealButtonClicked) {
        inzet = 0;
        document.getElementById("inzet").innerHTML = `inzet: ${inzet}`;
        deal.disabled = true;
    }
});

document.getElementById("again").addEventListener("click", () => {
    window.location.reload();
});

window.onload = function () {
    document.getElementById("banksaldo").innerHTML = `Banksaldo: <b>${bankSaldo}</b>`;
};