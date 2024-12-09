(function () {
    let tiles = [];
    let emptyPos;
    let moveCount = 0;
    let gameMode = "numbers";
    let gameImage = null;
    let gridSize = 4;
    let tileCount;

    document
        .getElementById("difficulty")
        .addEventListener("change", changeDifficulty);

    document.getElementById("cross").addEventListener("click", closeModal);

    document.getElementById("btnNewGame").addEventListener("click", newGame);

    document
        .getElementById("imageInput")
        .addEventListener("change", handleImageUpload);

    document
        .getElementById("modeSwitch")
        .addEventListener("change", function () {
            const mode = this.checked ? "image" : "numbers";
            switchMode(mode);
        });

    function changeDifficulty() {
        gridSize = parseInt(document.getElementById("difficulty").value);
        createBoard();
        newGame();
    }

    function createBoard() {
        const board = document.querySelector(".board");
        board.innerHTML = "";

        tileCount = gridSize * gridSize - 1;
        board.className = `board grid-${gridSize}`;

        tiles = Array.from({ length: tileCount }, (_, i) => i + 1);
        tiles.push(null);

        const tileSize = 400 / gridSize;

        const fontSize =
            gridSize === 5 ? "1.5em" : gridSize === 3 ? "2.5em" : "2em";

        tiles.forEach((num, index) => {
            const tile = document.createElement("div");
            tile.className = num ? "tile" : "tile empty";
            tile.style.fontSize = fontSize;

            if (gameMode === "numbers" && num) {
                tile.textContent = num;
            } else if (gameMode === "image" && num && gameImage) {
                tile.style.backgroundImage = `url(${gameImage})`;
                const row = Math.floor((num - 1) / gridSize);
                const col = (num - 1) % gridSize;
                tile.style.backgroundSize = `${gridSize * 100}%`;
                tile.style.backgroundPosition = `${-col * tileSize}px ${
                    -row * tileSize
                }px`;
            }
            tile.addEventListener("click", () => moveTile(index));
            board.appendChild(tile);
        });
    }

    function shuffle() {
        do {
            for (let i = tiles.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
            }
        } while (!isSolvable());
    }

    function isSolvable() {
        let inversions = 0;
        for (let i = 0; i < tiles.length - 1; i++) {
            if (!tiles[i]) continue;
            for (let j = i + 1; j < tiles.length; j++) {
                if (!tiles[j]) continue;
                if (tiles[i] > tiles[j]) inversions++;
            }
        }
        emptyPos = tiles.indexOf(null);
        const emptyRow = Math.floor(emptyPos / gridSize);

        if (gridSize % 2 === 0) {
            return (inversions + emptyRow) % 2 === 0;
        } else {
            return inversions % 2 === 0;
        }
    }

    function updateBoard() {
        requestAnimationFrame(() => {
            const tileElements = document.querySelectorAll(".tile");
            const tileSize = 400 / gridSize;

            tiles.forEach((num, index) => {
                const tile = tileElements[index];
                tile.className = num ? "tile" : "tile empty";
                if (gameMode === "numbers") {
                    tile.textContent = num || "";
                    tile.style.backgroundImage = "";
                } else if (gameMode === "image" && gameImage) {
                    tile.textContent = "";
                    if (num) {
                        tile.style.backgroundImage = `url(${gameImage})`;
                        const row = Math.floor((num - 1) / gridSize);
                        const col = (num - 1) % gridSize;
                        tile.style.backgroundSize = `${gridSize * 100}%`;
                        tile.style.backgroundPosition = `${-col * tileSize}px ${
                            -row * tileSize
                        }px`;
                    } else {
                        tile.style.backgroundImage = "";
                    }
                }
            });
        });
    }

    function showWinModal(message) {
        document.getElementById("winMessage").textContent = message;
        document.getElementById("winModal").style.display = "block";
    }

    function closeModal() {
        document.getElementById("winModal").style.display = "none";
    }

    function moveTile(index) {
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;
        const emptyIndex = tiles.indexOf(null);
        const emptyRow = Math.floor(emptyIndex / gridSize);
        const emptyCol = emptyIndex % gridSize;

        if (
            (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
            (Math.abs(col - emptyCol) === 1 && row === emptyRow)
        ) {
            [tiles[index], tiles[emptyIndex]] = [
                tiles[emptyIndex],
                tiles[index],
            ];
            updateBoard();
            moveCount++;
            document.getElementById("moveCount").textContent = moveCount;
            checkWin();
        }
    }

    function checkWin() {
        const win = tiles.slice(0, -1).every((num, index) => num === index + 1);
        if (win) {
            const message = `Вы решили головоломку за ${moveCount} ходов!`;
            setTimeout(() => showWinModal(message), 300);
        }
    }

    function newGame() {
        moveCount = 0;
        document.getElementById("moveCount").textContent = moveCount;
        shuffle();
        updateBoard();
    }

    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                gameImage = e.target.result;
                if (gameMode === "image") {
                    newGame();
                }
            };
            reader.readAsDataURL(file);
        }
    }

    function switchMode(mode) {
        gameMode = mode;
        if (mode === "image" && !gameImage) {
            alert("Пожалуйста, сначала загрузите картинку");
            document.querySelector(".switch input").checked = false;
            gameMode = "numbers";
            return;
        }
        createBoard();
        newGame();
    }

    createBoard();
    newGame();

    // Close modal when clicking outside
    window.addEventListener("click", function (event) {
        const modal = document.getElementById("winModal");
        if (event.target === modal) {
            closeModal();
        }
    });
})();
