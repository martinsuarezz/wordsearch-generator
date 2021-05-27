var canvas = document.getElementById('my-canvas');
var ctx = canvas.getContext('2d');
ctx.fillStyle = "#FFFFFF";
ctx.fillRect(0,0,canvas.width, canvas.height);
var HORIZONTAL = 1;
var VERTICAL = 2;
var TRIES = 150;
var globalWordSearch = [];
var globalFilledSlots = [];
var tooLongWords = [];
var couldntFitWords = [];
var tooBigAlert = false;

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function drawWordSearch(){
    tooBigAlert = false;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0,0,canvas.width, canvas.height);
    let size = parseInt(document.getElementById("sizeRange").value);

    let x = size, y = size;
    let xStep = size, yStep = size;
    ctx.font = size + "px Arial"
    for (let i = 0; i < globalWordSearch.length; i++){
        for (let j = 0; j < globalWordSearch[i].length; j++){
            if (document.getElementById("colorCheck").checked && globalFilledSlots[i][j])
                ctx.fillStyle = "#FF0000";
            else
                ctx.fillStyle = "#000000";
            ctx.fillText(globalWordSearch[i][j], x, y);
            x += xStep;
            if (x + size / 2> canvas.width)
                tooBigAlert = true;
        }
        x = size;
        y += yStep;
        if (y + size / 2> canvas.height)
            tooBigAlert = true;
    }
}

function availableSpace(word, wordSearch, wordColIndex, wordRowIndex, wordOrientation){
    if (wordOrientation == HORIZONTAL){
        for (let i = 0; i < word.length; i++){
            if (wordSearch[wordRowIndex][wordColIndex + i] == " " || word[i] == wordSearch[wordRowIndex][wordColIndex + i])
                continue;
            else   
                return false;
        }
    }
    else{
        for (let i = 0; i < word.length; i++){
            if (wordSearch[wordRowIndex + i][wordColIndex] == " " || word[i] == wordSearch[wordRowIndex + i][wordColIndex])
                continue;
            else   
                return false;
        }
    }
    return true;
}

function insertWord(word, wordSearch, filledSlots, wordColIndex, wordRowIndex, wordOrientation){
    if (wordOrientation == HORIZONTAL){
        for (let i = 0; i < word.length; i++){
            wordSearch[wordRowIndex][wordColIndex + i] = word[i];
            filledSlots[wordRowIndex][wordColIndex + i] = true;
        }
    }
    else{
        for (let i = 0; i < word.length; i++){
            wordSearch[wordRowIndex + i][wordColIndex] = word[i];
            filledSlots[wordRowIndex + i][wordColIndex] = true;
        }
    }
}

function colocateWord(word, wordSearch, filledSlots, width, height, tries){
    if (word.length > width && word.length > height){
        console.log("Word " + word + " too long!");
        tooLongWords.push(word);
        return;
    }
    for (let i = 0; i < tries; i++){
        wordOrientation = getRandomInt(1, 3);
        if ((wordOrientation == HORIZONTAL && width < word.length) || 
            (wordOrientation == VERTICAL && height < word.length))
            continue;

        if (wordOrientation == HORIZONTAL){
            wordColIndex = getRandomInt(0, width - word.length + 1);
            wordRowIndex = getRandomInt(0, height);
        }
        else{
            wordRowIndex = getRandomInt(0, height - word.length + 1);
            wordColIndex = getRandomInt(0, width);
        }

        if (availableSpace(word, wordSearch, wordColIndex, wordRowIndex, wordOrientation)){
            insertWord(word, wordSearch, filledSlots, wordColIndex, wordRowIndex, wordOrientation);
            return;
        }
    }
    couldntFitWords.push(word);
}

function fillRandomLetters(wordSearch){
    for (let i = 0; i < wordSearch.length; i++){
        for (let j = 0; j < wordSearch[i].length; j++){
            if (wordSearch[i][j] == " ")
                wordSearch[i][j] = String.fromCharCode(getRandomInt(65, 91));
        }
    }
}

function createWordSearch(words, width, height){
    wordSearch = [];
    filledSlots = [];
    wordRow = [];
    filledRow = [];
    for (let i = 0; i < width; i++){
        wordRow.push(" ");
        filledRow.push(false);
    }
    for (let j = 0; j < height; j++){
        wordSearch.push(wordRow.slice())
        filledSlots.push(filledRow.slice())
    }
    for (let i = 0; i < words.length; i++){
        colocateWord(words[i], wordSearch, filledSlots, width, height, TRIES);
    }
    fillRandomLetters(wordSearch);
    return [wordSearch, filledSlots];
}

function parseWords(input){
    input = input.toUpperCase().replaceAll(" ", "");
    words = input.split(",");
    return words;
}

function showTooLongWordsAlert(){
    alert = document.createElement("div");
    alert.className = "alert alert-danger";
    alert.id = "too-long-alert";
    let alertMsg = "The following words are too long for this word search:";
    for (let i = 0; i < tooLongWords.length; i++){
        alertMsg = alertMsg + " " + tooLongWords[i];
        if (tooLongWords.length > i + 1)
            alertMsg = alertMsg + ",";
    }
    alert.textContent = alertMsg;
    let firstCol = document.getElementById("canvas-col");
    firstCol.appendChild(alert);
}

function showCouldntFitAlert(){
    alert = document.createElement("div");
    alert.className = "alert alert-danger";
    alert.id = "couldnt-fit-alert";
    let alertMsg = "Couldn't fit the following words in this word search:";
    for (let i = 0; i < couldntFitWords.length; i++){
        alertMsg = alertMsg + " " + couldntFitWords[i];
        if (couldntFitWords.length > i + 1)
            alertMsg = alertMsg + ",";
    }
    alert.textContent = alertMsg;
    let firstCol = document.getElementById("canvas-col");
    firstCol.appendChild(alert);
}

function showTooBigAlert(){
    alert = document.createElement("div");
    alert.className = "alert alert-warning";
    alert.id = "too-big-alert";
    let alertMsg = "The word search is too big, clipping may occur";
    alert.textContent = alertMsg;
    let firstCol = document.getElementById("canvas-col");
    firstCol.appendChild(alert);
}

function showAlerts(){
    if (tooLongWords.length > 0){
        showTooLongWordsAlert();
    }
    if (couldntFitWords.length > 0){
        showCouldntFitAlert();
    }
    if (tooBigAlert){
        showTooBigAlert();
    }
}

function clearAlerts(){
    let tooLongAlertBox = document.getElementById("too-long-alert");
    if (tooLongAlertBox)
        tooLongAlertBox.remove();

    let tooBigAlertBox = document.getElementById("too-big-alert");
    if (tooBigAlertBox)
        tooBigAlertBox.remove();

    let couldntFitAlertBox = document.getElementById("couldnt-fit-alert");
    if (couldntFitAlertBox)
        couldntFitAlertBox.remove();
}

function recalculateWords(){
    tooLongWords = [];
    couldntFitWords = [];
    columns = document.getElementById("columnsRange").value;
    let columnsAmmount = document.getElementById("columnsAmmount");
    columnsAmmount.innerHTML = columns;
    rows = document.getElementById("rowsRange").value;
    let rowsAmmount = document.getElementById("rowsAmmount");
    rowsAmmount.innerHTML = rows;
    words = parseWords(document.getElementById("wordInput").value);
    result = createWordSearch(words, columns, rows);
    globalWordSearch = result[0];
    globalFilledSlots = result[1];
}

function refreshDraw(){
    clearAlerts();
    drawWordSearch();
    showAlerts();
}

function refreshWords(){
    clearAlerts();
    recalculateWords();
    drawWordSearch();
    showAlerts();
}

refreshWords();
