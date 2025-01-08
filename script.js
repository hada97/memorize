let words = [];
let meanings = [];
let currentCard = 0;
let timerInterval;
let gameTimer = 5;
let displayTime = 3; // Tempo para exibir o significado
let cardFlippedByClick = false;

document.getElementById("file-input").addEventListener("change", handleFile);
document.getElementById("start-game").addEventListener("click", startGame);

function handleFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        
        const rows = XLSX.utils.sheet_to_json(sheet);
        words = rows.map(row => row['Palavra']); // Coluna de palavras
        meanings = rows.map(row => row['Significado']); // Coluna de significados
    };
    
    reader.readAsBinaryString(file);
}

function startGame() {
    // Captura os valores dos inputs
    gameTimer = parseInt(document.getElementById('timer').value);
    displayTime = parseInt(document.getElementById('display-time').value);

    if (words.length === 0 || meanings.length === 0) {
        alert("Carregue um arquivo Excel primeiro!");
        return;
    }

    currentCard = 0;
    document.getElementById("game-board").innerHTML = ""; // Limpar o tabuleiro do jogo

    displayCard(); // Exibe a primeira carta
    startTimer(); // Inicia o cronômetro
}

function startTimer() {
    let timeLeft = gameTimer;
    const existingTimer = document.getElementById('timer-display');
    if (existingTimer) existingTimer.remove(); // Remove o cronômetro anterior

    const timerDisplay = document.createElement('div');
    timerDisplay.id = 'timer-display';
    timerDisplay.textContent = `Tempo restante: ${timeLeft}s`;
    document.getElementById("game-board").appendChild(timerDisplay); // Adiciona o cronômetro logo abaixo da carta

    cardFlippedByClick = false; // Reseta o estado do clique

    timerInterval = setInterval(function() {
        timeLeft--;
        timerDisplay.textContent = `Tempo restante: ${timeLeft}s`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            if (!cardFlippedByClick) {
                flipCard(true); // Vira a carta automaticamente
                handleEndOfCard();
            }
        }
    }, 1000);
}

function displayCard() {
    const gameBoard = document.getElementById("game-board");
    gameBoard.innerHTML = ""; // Remove o conteúdo anterior (carta + cronômetro)

    const card = document.createElement('div');
    card.classList.add('card');
    card.textContent = words[currentCard]; // Exibe a palavra
    card.setAttribute("data-meaning", meanings[currentCard]); // Armazena o significado no atributo

    card.addEventListener("click", function() {
        if (!cardFlippedByClick) {
            clearInterval(timerInterval); // Para o cronômetro
            flipCard(true); // Vira a carta
            cardFlippedByClick = true;
            handleEndOfCard();
        }
    });
    
    gameBoard.appendChild(card); // Adiciona a carta ao tabuleiro
}

function flipCard(showMeaning) {
    const currentCardElement = document.querySelector(".card");
    if (currentCardElement) {
        if (showMeaning) {
            currentCardElement.classList.add('flipped');
            currentCardElement.textContent = currentCardElement.getAttribute('data-meaning'); // Exibe o significado
            currentCardElement.style.backgroundColor = "green"; // Muda a cor da carta para verde
        } else {
            currentCardElement.classList.remove('flipped');
            currentCardElement.textContent = words[currentCard]; // Retorna à palavra
            currentCardElement.style.backgroundColor = ""; // Reseta a cor da carta
        }
    }
}

function handleEndOfCard() {
    setTimeout(function() {
        flipCard(false); // Volta a mostrar a palavra
        currentCard++;
        if (currentCard < words.length) {
            displayCard(); // Exibe a próxima carta
            startTimer(); // Reinicia o cronômetro
        } else {
            const gameBoard = document.getElementById("game-board");
            gameBoard.innerHTML = "Jogo terminado!"; // Mensagem final
        }
    }, displayTime * 1000); // Aguarda o tempo de exibição antes de avançar
}
