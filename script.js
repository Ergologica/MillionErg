let minToRaise = 1000000000; // 1000 ERG in nanoERG
let deadlineBlock = 500000;  // Un blocco di esempio
let raisedAmount = 0;        // Totale raccolto
let currentHeight = 0;       // Altezza corrente del blocco

// Inizializzazione Ergo SDK e wallet
async function loadErgo() {
    await ergoConnector.nautilus.connect();
    const address = await ergoConnector.nautilus.getContext().get_change_address();
    console.log("Indirizzo del wallet:", address);
    return address;
}

// Aggiorna lo stato della campagna
async function updateCampaignStatus() {
    const explorerUrl = "https://api.ergoplatform.com/api/v1";
    const heightResponse = await fetch(`${explorerUrl}/blocks`);
    const heightData = await heightResponse.json();
    currentHeight = heightData.total - 1; // Blocco corrente
    document.getElementById('currentHeight').textContent = currentHeight;

    // Simulazione fondi raccolti
    document.getElementById('raisedAmount').textContent = (raisedAmount / 1e9).toFixed(2);
    document.getElementById('minGoal').textContent = (minToRaise / 1e9).toFixed(2);

    if (currentHeight >= deadlineBlock) {
        document.getElementById('campaignStatus').textContent = 'Fallito (deadline raggiunta)';
    } else if (raisedAmount >= minToRaise) {
        document.getElementById('campaignStatus').textContent = 'Successo (obiettivo raggiunto)';
    } else {
        document.getElementById('campaignStatus').textContent = 'In corso (contribuisci ora!)';
    }
}

// Invia una transazione di contributo
async function sendContribution() {
    const amountInput = document.getElementById('amount');
    const amount = parseFloat(amountInput.value) * 1e9; // Converti ERG in nanoERG

    if (isNaN(amount) || amount <= 0) {
        alert('Inserisci un importo valido.');
        return;
    }

    // Ottieni contesto dal wallet connesso
    const ctx = await ergoConnector.nautilus.getContext();

    // Costruzione di una transazione
    const changeAddr = await ctx.get_change_address();
    const utxos = await ctx.get_utxos(amount); // Ottieni UTXO sufficienti per coprire l'importo

    const tx = await ctx.sign_tx({
        inputs: utxos,
        dataInputs: [],
        outputs: [
            {
                value: amount,
                address: "indirizzo_smart_contract", // L'indirizzo del contratto smart
                additionalRegisters: {}
            }
        ],
        fee: 1000000, // 0.001 ERG di fee
        changeAddress: changeAddr
    });

    // Invia la transazione alla rete Ergo
    const txId = await ctx.submit_tx(tx);
    console.log("ID transazione inviata:", txId);

    raisedAmount += amount;
    currentHeight += 10; // Simula il progresso della blockchain
    updateCampaignStatus();
    amountInput.value = ''; // Resetta l'input
    alert(`Hai contribuito con ${(amount / 1e9).toFixed(2)} ERG!`);
}

// Carica lo stato della campagna al caricamento della pagina
document.addEventListener('DOMContentLoaded', async function () {
    await loadErgo();
    updateCampaignStatus();
});
