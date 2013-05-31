// Date Slider
$(document).ready(function(){
  $("#upClick").click(updateEndYear);
});

function updateEndYear() {
  var endYear = document.getElementById("yearField").value;
  document.getElementById('lateTimeSlider').value = endYear;
  endDate = endYear;
}

function playForward(){
  if(playing==false){
    playing = true;
    nodeslen = currentTree.nodes.length;
    document.getElementById('playButton').value = "Pause";

    playInterval = setInterval(function(){
      document.getElementById('lateTimeSlider').value = minYear;
      updateLabelFromEndSlider();
      minYear = minYear+1;
      if(minYear==2014){
        clearInterval(playInterval);
        document.getElementById('playButton').value = "Play";
        minYear = 2013;
        playing = false;
      }
      force.start();
    }, 50);
  }
  else{f
    clearInterval(playInterval);
    document.getElementById('playButton').value = "Play";
    playing = false;
  }
}

function stopAnimation(){
  if(playing ==true){
    playing = false;
    clearInterval(playInterval);
    document.getElementById('playButton').value = "Play";
  }
  minYear = 2013;
  document.getElementById('lateTimeSlider').value = minYear;
  updateLabelFromEndSlider();

}

function fromBeginning(){
  minYear=2013;
  playing = true;
  nodeslen = currentTree.nodes.length;
  document.getElementById("playButton").value = "Pause";
  if(minYear == 2013){
    for(i=0; i<nodeslen; i++){
      if(currentTree.nodes[i].year != null && currentTree.nodes[i].year<minYear){
        minYear = currentTree.nodes[i].year;
      }  
    }
  }

  playInterval = setInterval(function(){
    document.getElementById('lateTimeSlider').value = minYear;
    updateLabelFromEndSlider();
    minYear = minYear+1;
    if(minYear==2014){
      clearInterval(playInterval);
      document.getElementById('playButton').value = "Play";
      minYear = 2013;
      playing = false;
    }
    force.start();
  }, 50);
}

function updateLabelFromEndSlider(){
  document.getElementById("yearField").value = document.getElementById('lateTimeSlider').value;
  updateEndYear();
}

function rerootAtCurrentNode(e) {
  document.getElementById("TSNField").value = selected.tsn;
  reroot(e);
}

