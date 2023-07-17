class Game {
    constructor() {
        this.initializeValues();
    }
    initializeValues() {
        this.score = 0;
        this.multiplier = 1;
        this.multiplierPrice = 5;
        this.autoclickPrice = 10;
        this.bonusPrice = 20;
        this.pokemonList = [];
        this.autoclickInterval = null;
        this.bonusInterval = null;
        this.bonusActive = false;
        this.autoclickIntervalTime = 10000;
        this.multiplierPurchases = 0;
        this.autoclickPurchases = 0;
        this.bonusPurchases = 0;
        this.bonusClickIncrement = 6;
    }

    refreshPurchaseOptions() {
        ['multiplier', 'autoclick', 'bonus'].forEach(item => {
            if (this.score >= this[item + 'Price'] && this[item + 'Purchases'] < 4) {
                document.querySelector(`.${item} button`).disabled = false;
                document.querySelector(`.${item} button`).style.backgroundColor = '#007BFF';
            } else if (this[item + 'Purchases'] >= 4) {
                document.querySelector(`.${item} button`).disabled = true;
            }
        });
    }

    incrementScore(byValue = 1) {
        if (this.bonusActive) {
            byValue += 2;
        }
        this.score += byValue * this.multiplier;
        console.log(`Le score a augmenté de ${byValue * this.multiplier}. Nouveau score : ${this.score}`)
        this.refreshPurchaseOptions();
    }

    decrementScore(byValue) {
        this.score -= byValue;
        if (this.score < 0) {
            this.score = 0;
        }
        this.refreshScore();
    }

    removePokemon(pokemonToRemove) {
        const index = this.pokemonList.indexOf(pokemonToRemove);
        if (index > -1) {
            this.pokemonList.splice(index, 1);
        }
    }

    buy(item) {
        if (this.canPurchaseItem(item)) {
            this.makePurchase(item);
            this.refreshScore();
        } else {
            this.alertPurchaseLimit(item);
        }
    }

    canPurchaseItem(item) {
        return this.score >= this[item + 'Price'] && this[item + 'Purchases'] < 4;
    }

    makePurchase(item) {
        this.decrementScore(this[item + 'Price']);
        this.removeFromInventory(this[item + 'Price']);
        this[item + 'Purchases'] += 1;
        this.refreshButtonStatus(item);
        this.executeBuyAction(item);
    }

    refreshScore() {
        document.getElementById("score").innerHTML = this.score;
    }

    alertPurchaseLimit(item) {
        if (this[item + 'Purchases'] >= 4) {
            alert(`Vous avez atteint la limite d'achat pour cet(te) ${item}.`);
        } else {
            alert(`Vous n'avez pas assez de points pour acheter cet(te) ${item}.`);
        }
    }

    refreshButtonStatus(item) {
        if (this[item + 'Purchases'] === 4) {
            document.querySelector(`.${item} button`).disabled = true;
            document.querySelector(`.${item} button`).style.backgroundColor = 'grey';
        }
    }

    executeBuyAction(item) {
        if (item === 'autoclick') {
            this.autoclickIntervalTime -= 2000;
            this.buyAutoclick();
        }
        if (item === 'multiplier') {
            this.buyMultiplier();
        }
        if (item === 'bonus') {
            this.buyBonus();
        }
    }

    buyAutoclick() {
        if (this.autoclickPurchases > 0) {
            clearInterval(this.autoclickInterval);
            this.setAutoclickInterval();
        }
        this.updatePrice('autoclick');
    }

    setAutoclickInterval() {
        this.autoclickInterval = setInterval(() => {
            const validPokemons = this.pokemonList.filter(pokemon => !pokemon.malus);
            if (validPokemons.length > 0) {
                this.performAutoClick(validPokemons);
            }
        }, this.autoclickIntervalTime);
    }

    performAutoClick(validPokemons) {
        const randomIndex = Math.floor(Math.random() * validPokemons.length);
        const pokemon = validPokemons[randomIndex];
        this.incrementScore(1);
        this.addToInventory(pokemon);
        this.refreshScore();
        this.removePokemon(pokemon);
        const pokemonDiv = document.getElementById(`pokemon${pokemon.id}`);
        if (pokemonDiv) {
            this.removePokemonDiv(pokemonDiv);
        }
    }

    buyMultiplier() {
        if (this.multiplierPurchases > 0) {
            this.multiplier *= 2;
        }
        this.updatePrice('multiplier');
    }

    buyBonus() {
        if (this.bonusActive) {
            alert('Le bonus est déjà actif. Attendez la fin du compte à rebours pour l\'acheter à nouveau.');
        } else {
            if (this.bonusPurchases > 0) {
                this.executeBonus();
            }
            this.updatePrice('bonus');
        }
    }

    executeBonus() {
        this.score += 200;
        this.bonusActive = true;
        document.querySelector(".bonus").disabled = true;

        const bonusButton = document.querySelector(".bonus button");
        bonusButton.innerHTML = "30";

        let countdown = 29;
        const countdownInterval = setInterval(() => {
            bonusButton.innerHTML = countdown.toString();
            countdown--;

            if (countdown < 0) {
                clearInterval(countdownInterval);
                this.resetBonus();
            }
        }, 1000);

        bonusButton.style.backgroundColor = "#ef594f";
    }

    resetBonus() {
        this.bonusActive = false;
        document.querySelector(".bonus").disabled = false;
        const bonusButton = document.querySelector(".bonus button");
        bonusButton.innerHTML = "<div class='pokemon-ball'></div> <a> Bonus <span class='bonus-price' data-letters='500'></span><span class='bonus-price' data-letters='500'></span></a>";
    }

    updatePrice(item) {
        this[item + "Price"] *= 2;
        const priceElements = document.querySelectorAll(`.${item}-price`);
        priceElements.forEach(element => {
            element.textContent = this[item + "Price"];
        });
    }
}

class Pokemon {
    constructor(pokemonData) {
        this.initializeValues(pokemonData);
    }
    initializeValues(pokemonData) {
        this.id = pokemonData.id;
        this.name = pokemonData.name;
        this.image = pokemonData.sprites.front_default;
        this.speed = 0.05;
        this.value = 1;
        this.malus = Math.random() < 0.1;
        this.initializePosition();
    }

    initializePosition() {
        const initialPos = this.getRandomPosition();
        this.x = initialPos.left;
        this.y = initialPos.top;
        const destPos = this.getRandomPosition();
        this.destX = destPos.left;
        this.destY = destPos.top;
    }

    getRandomPosition() {
        const randomPosLeft = Math.floor(Math.random() * window.innerWidth);
        const randomPosTop = Math.floor(Math.random() * window.innerHeight);
        return {
            left: randomPosLeft,
            top: randomPosTop
        };
    }

    update() {
        const dx = this.destX - this.x;
        const dy = this.destY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        this.updatePositionOrDest(dist, dx, dy);
    }

    updatePositionOrDest(dist, dx, dy) {
        if (dist > 1) {
            this.x += dx * this.speed;
            this.y += dy * this.speed;
        } else {
            this.setNewDest();
        }
    }

    setNewDest() {
        const newDest = this.getRandomPosition();
        this.destX = newDest.left;
        this.destY = newDest.top;
    }
}

class WebGame extends Game {
    constructor() {
        super();
        this.gameStarted = false;
        document.getElementById('generate').addEventListener('click', this.playGame.bind(this));
        document.getElementById('reset').addEventListener('click', this.resetGame.bind(this));
    }

    async generatePokemon() {
        const randomId = Math.floor(Math.random() * 1010) + 1;
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
        const pokemonData = await response.json();

        const pokemon = new Pokemon(pokemonData);

        this.pokemonList.push(pokemon);
        this.displayPokemon(pokemon);
    }

    createPokemonDiv(pokemon) {
        let pokemonDiv = document.createElement('div');
        pokemonDiv.id = `pokemon${pokemon.id}`;
        pokemonDiv.className = "pokemon";
        pokemonDiv.style.position = "absolute";
        pokemonDiv.style.left = `${pokemon.x}px`;
        pokemonDiv.style.top = `${pokemon.y}px`;
        return pokemonDiv;
    }

    removePokemonDiv(pokemonDiv) {
        pokemonDiv.remove();
    }

    displayPokemon(pokemon) {
        let pokemonDiv = this.createPokemonDiv(pokemon);

        let img = document.createElement('img');
        img.src = pokemon.image;
        img.alt = pokemon.name;

        pokemonDiv.appendChild(img);
        document.getElementById("result").appendChild(pokemonDiv);

        pokemonDiv.addEventListener('click', async () => {
            this.addToInventory(pokemon);
            this.incrementScore();
            this.refreshScore();
            this.removePokemonDiv(pokemonDiv);
            await this.generatePokemon();
            await this.generatePokemon();
        });
    }

    addToInventory(pokemon) {
        const img = document.createElement('img');
        img.src = pokemon.image;
        img.alt = pokemon.name;
        img.style.width = "25px";
        img.style.height = "25px";
        document.querySelector('#inventory-box').appendChild(img);
    }

    removeFromInventory(count) {
        const inventoryBox = document.querySelector('#inventory-box');
        for (let i = 0; i < count; i++) {
            if (inventoryBox.children.length > 0) {
                inventoryBox.removeChild(inventoryBox.lastChild);
            } else {
                break;
            }
        }
    }

    movePokemon() {
        const animate = () => {
            for (let pokemon of this.pokemonList) {
                pokemon.update();
                const pokemonDiv = document.getElementById(`pokemon${pokemon.id}`);
                if (pokemonDiv) {
                    pokemonDiv.style.left = `${pokemon.x}px`;
                    pokemonDiv.style.top = `${pokemon.y}px`;
                }
            }
            requestAnimationFrame(animate);
        }
        animate();
    }

    async playGame() {
        if (this.gameStarted) {
            document.getElementById('reset').style.display = 'block';
            alert('Vous avez déjà commencé une partie. Voulez-vous la réinitialiser ?');
            return;
        }
        this.gameStarted = true;
        console.log("cliquez sur un pokemon pour le capturer");
        await this.generatePokemon();
        this.movePokemon();
    }

    resetGame() {
        location.reload();
    }
}

class WebGameWithMalus extends WebGame {
    createPokemonDiv(pokemon) {
        let pokemonDiv = super.createPokemonDiv(pokemon);
        let overlay = document.createElement('div');
        overlay.className = "overlay";
        overlay.style.position = "absolute";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.backgroundColor = "red";
        overlay.style.opacity = "0.5";

        pokemonDiv.appendChild(overlay);

        if (pokemon.malus) {
            overlay.style.display = "block";
            pokemonDiv.addEventListener('click', () => {
                if (document.querySelector('#inventory-box').children.length >= 50) {
                    this.decrementScore(50);
                    this.removeFromInventory(50);
                } else {
                    alert(
                        "Vous n'avez pas assez de Pokémon dans votre inventaire pour subir ce malus !"
                    );
                }
                this.removePokemonDiv(pokemonDiv);
            });
        } else {
            overlay.style.display = "none";
        }
        return pokemonDiv;
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const game = new WebGameWithMalus();
    
    const cursor = document.getElementById('custom-cursor');
    document.addEventListener('mousemove', e => {
        cursor.setAttribute("style", "top: " + (e.pageY - 10) + "px; left: " + (e.pageX - 10) + "px;");
    });

    document.addEventListener('click', () => {
        cursor.classList.add("expand");
        setTimeout(() => {
            cursor.classList.remove("expand");
        }, 500);
    });

    function updatePrice(item, newPrice, priceElements) {
        priceElements.forEach(element => {
            element.textContent = newPrice;
            element.dataset.letters = newPrice;
        });
    }

    function createButtonClickHandler(item, priceElements) {
        return () => {
            console.log(`${item.charAt(0).toUpperCase() + item.slice(1)} cliqué !`);
            game.buy(item);
            updatePrice(item, game[item + 'Price'], priceElements);
        }
    }

    ['multiplier', 'autoclick', 'bonus'].forEach(item => {
        const priceElements = document.querySelectorAll(`.${item}-price`);
        document.querySelector(`.${item} button`).addEventListener('click', createButtonClickHandler(item, priceElements));
    });
});