var nodeslen;
var minYear = getInitialMinYear();
var upInterval;
var playInterval;
var playing = false;
var lateSlider = document.getElementById('lateTimeSlider');
var fromStartButton = document.getElementById('fromStartButton');
var yearField = document.getElementById('yearField');
var playButton = document.getElementById('playButton');

/*
$(document).ready(function(){
    //$('#upClick').click(year);
    $('#yearField').keypress(function(e) {
        if(e.which == 13) {
            alert('You pressed enter!');
        }
    });
});
*/

$('#update-year-field').click(function(e) {
    updateYearFromYearField();
});
$('#yearField').keypress(function(e) {
    if(e.which == 13) {
        console.log('You pressed enter!');
        updateYearFromYearField();
    }
});

// var lateSlider = document.getElementById('lateTimeSlider');
//lateSlider.addEventListener('mousemove',updateLabelFromEndSlider, false); 
lateSlider.addEventListener('mousedown', function(){
    //clearInterval(playInterval);
    playOff();
    console.log('mousedown lateSlider');
    upInterval = setInterval(function(){
        force.start()}
        , 50);
    //playOff();
});
lateSlider.addEventListener('mousemove', updateYearFromSlider, false); 
lateSlider.addEventListener('mouseup', function(){
    console.log('mouseup lateSlider');
    updateYearFromSlider();
    clearInterval(upInterval);
    force.start();
    //clearInterval(upInterval);
});

fromStartButton.addEventListener('click', function() {
    if(!playing) {
        minYear = getInitialMinYear();
        fromBeginning();
    }
});
playButton.addEventListener('click', function() {
    minYear = getInitialMinYear();
    if(!playing) {
        // Play the animation
        //minYear = getInitialMinYear();
        playDate();
    } else {
        // Pause the Animation
        playOff();
    }
});

function playDate() {
    minYear = getInitialMinYear();
    //minYear = curYear;
    //playing = true;
    playOn();
    //setCurrentMinYear();
    //endYear = minYear;
    //var currenEndYear = minYear;
    //nodeslen = currentTree.nodes.length;
    //playButton.value = 'Pause';
    //if(minYear == curYear){
        // Find the node in the current tree with the earliest date
        //for(i=0; i<nodeslen; i++){
            //  if(currentTree.nodes[i].year != null && currentTree.nodes[i].year < minYear) {
                //        minYear = currentTree.nodes[i].year;
                //    }  
                // }
                //}
    playInterval = setInterval( function() {
        //lateSlider.value = minYear;
        //yearField.value = minYear;
        //minYear = minYear+1;
        //console.log('playInterval' + endYear);
        endYear += 1;
        updateEndYear();
        if (endYear >= curYear){
            //console.log('playInterval');
            //clearInterval(playInterval);
            //document.getElementById('playButton').value = 'Play';
            endYear = curYear;
            //playing = false;
            playOff();
            //stopPlaying();
        }
        force.start();
    }, 50);
}

/*
function setCurrentMinYear() {
    // Find the node in the current tree with the earliest date
    minYear = getInitialMinYear();
    yearField.value = minYear;
}
*/

function getInitialMinYear() {
    //nodeslen = currentTree.nodes.length;
    var initialMinYear = curYear;
    for(i=0; i<nodeslen; i++){
        if(currentTree.nodes[i].year != null && currentTree.nodes[i].year < initialMinYear) {
            initialMinYear = currentTree.nodes[i].year;
        }  
    }
    return initialMinYear;
}

function playOn() {
    console.log('playing...');
    if (!playing) {
        playing = true;
        playButton.value = 'Pause';
    }
}
function playOff() {
    console.log('stop playing.');
    if (playing) {
        playing = false;
        playButton.value = 'Play';
        clearInterval(playInterval);
    }
}

/*
function stopPlaying(){
    if(playing){
        clearInterval(playInterval);
    }
}
*/

function resetSlider() {
    endYear = curYear;
    updateEndYear();
    //lateSlider.value = endYear;
    //lateSliderupdateYearFromSlider();
}

function fromBeginning(){
    endYear = minYear;
//    minYear = getInitialMinYear();
    playDate();
}


function updateEndYear() {
    //var endYear = yearField.value;
    //endYear = yearField.value;
    lateSlider.value = endYear;
    yearField.value = endYear;
    //endDate = endYear;
}

function updateYearFromSlider(){
    //yearField.value = lateSlider.value;
    var attemptedYear = parseInt(lateSlider.value);
    if (1700 < attemptedYear && attemptedYear < curYear) {
        endYear = attemptedYear;
        updateEndYear();
    } else {
        yearField.value = endYear; // if invalid year, restore original value of endYear
    }
    //updateEndYear();
    //document.getElementById('yearField').value = document.getElementById('lateTimeSlider').value;
}

function updateYearFromYearField() {
    var attemptedYear = parseInt(yearField.value);
    //console.log('Year Field: ' + attemptedYear);
    if (1700 < attemptedYear && attemptedYear < curYear) {
        console.log('Year Field: ' + attemptedYear);
        endYear = attemptedYear;
        updateEndYear();
    } else {
        yearField.value=endYear; // if invalid year, restore original value of endYear
    }
}

function rerootAtCurrentNode(e) {
    if (selected) {
        document.getElementById('TSNField').value = selected.tsn;
    }
    reroot(e);
}

function rootAtDefault(e) {
    document.getElementById('TSNField').value = defaultTsn;
    reroot(e);
}
