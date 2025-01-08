let words = [];
let meanings = [];
let currentCard = 0;
let timerInterval;
let gameTimer = 3;
let displayTime = 3;
let cardFlippedByClick = false;
let shuffleMode = false;


document.getElementById("checkboxInput").addEventListener("change", function() {
    shuffleMode = this.checked; // Verifica se o checkbox foi marcado
    if (shuffleMode) {
        shuffleCards(); // Embaralha os cards se o modo aleatório estiver ativado
    }
});

function shuffleCards() {
    // Combina palavras e significados em um único array de objetos
    const combined = words.map((word, index) => ({
        word: word,
        meaning: meanings[index]
    }));

    // Função para embaralhar algoritmo de Fisher-Yates
    for (let i = combined.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [combined[i], combined[j]] = [combined[j], combined[i]];
    }

    words = combined.map(item => item.word);
    meanings = combined.map(item => item.meaning);

    console.log('Palavras embaralhadas:', words);
    console.log('Significados embaralhados:', meanings);
}

function startGame() {
    // Captura os valores dos inputs
    gameTimer = parseInt(document.getElementById('timer').value);
    displayTime = parseInt(document.getElementById('display-time').value);

    if (words.length === 0 || meanings.length === 0) {
        alert("Carregue um arquivo Excel primeiro!");
        return;
    }

    document.getElementById("start-game").style.display = "none";

    currentCard = 0;
    document.getElementById("game-board").innerHTML = ""; // Limpar o tabuleiro do jogo

    if (shuffleMode) {
        shuffleCards(); // Se o modo aleatório estiver ativado, embaralha as cartas
    }

    displayCard();
    startTimer();
}



document.getElementById("file-input").addEventListener("change", handleFile);
document.getElementById("start-game").addEventListener("click", startGame);

function handleFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Lê como uma matriz, sem mapear para objetos

        // Verificar se o arquivo possui 2 colunas e o mesmo número de linhas
        if (rows[0].length !== 2) {
            alert("O arquivo precisa ter exatamente 2 colunas.");
            return;
        }

        const numRows = rows.length;
        if (numRows === 1) {
            alert("O arquivo precisa ter mais de uma linha de dados.");
            return;
        }

        // Verifica se todas as linhas possuem 2 colunas
        for (let i = 0; i < numRows; i++) {
            if (rows[i].length !== 2) {
                alert("Todas as linhas do arquivo precisam ter exatamente 2 colunas.");
                return;
            }
        }

        // Se tudo estiver certo, preencher as listas de palavras e significados
        words = rows.map(row => row[0]); // Primeira coluna (palavras)
        meanings = rows.map(row => row[1]); // Segunda coluna (significados)
        
        console.log('Palavras:', words);
        console.log('Significados:', meanings);
    };
    
    reader.readAsBinaryString(file);
}



function handleEndOfCard() {
    setTimeout(function() {
        flipCard(false); // Volta a mostrar a palavra
        currentCard++;
        const gameBoard = document.getElementById("game-board");

        if (currentCard < words.length) {
            displayCard(); // Exibe a próxima carta
            startTimer(); // Reinicia o cronômetro
        } else {
            // Limpa o conteúdo do game-board antes de exibir a mensagem
            gameBoard.innerHTML = ""; 

            // Cria uma nova div para a mensagem "Jogo terminado"
            const gameOverMessage = document.createElement('div');
            gameOverMessage.id = 'game-over-message';
            gameOverMessage.textContent = "Fim de Jogo!";
            
            // Adiciona a nova div no game-board
            gameBoard.appendChild(gameOverMessage);

            // Exibe o botão "Iniciar Jogo" novamente
            document.getElementById("start-game").style.display = "block";
        }
    }, displayTime * 1000); // Aguarda o tempo de exibição antes de avançar
}



function startTimer() {
    let timeLeft = gameTimer;
    const existingTimer = document.getElementById('timer-display');
    if (existingTimer) existingTimer.remove(); // Remove o cronômetro anterior

    const timerDisplay = document.createElement('div');
    timerDisplay.id = 'timer-display';
    timerDisplay.textContent = `${timeLeft}`;
    document.getElementById("game-board").appendChild(timerDisplay); // Adiciona o cronômetro logo abaixo da carta

    cardFlippedByClick = false; // Reseta o estado do clique

    timerInterval = setInterval(function() {
        timeLeft--;
        timerDisplay.textContent = `${timeLeft}`;

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
        } else {
            currentCardElement.classList.remove('flipped');
            currentCardElement.textContent = words[currentCard]; // Retorna à palavra
        }
    }
}

document.getElementById("file-input").addEventListener("change", function(event) {
    const fileName = event.target.files[0] ? event.target.files[0].name : "Escolha um arquivo";
    document.getElementById("file-label").textContent = fileName;
});




function toggleShuffleMode() {
    shuffleMode = !shuffleMode; // Alterna entre verdadeiro e falso

    if (shuffleMode) {
        shuffleCards(); // Se estiver no modo aleatório, embaralha as cartas
        document.getElementById("shuffle-cards").textContent = "Desativar Modo Aleatório"; // Altera o texto do botão
    } else {
        document.getElementById("shuffle-cards").textContent = "Ativar Modo Aleatório"; // Restaura o texto do botão
    }
}

