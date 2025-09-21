// Wait till everything loads
document.addEventListener('DOMContentLoaded', function() {
    // Grab all the elements we need
    let player = document.getElementById('audio-player');
    let playBtn = document.getElementById('play-pause-btn');
    let prevButton = document.getElementById('prev-btn');
    let nextButton = document.getElementById('next-btn');
    let progress = document.querySelector('.progress');
    let progressCont = document.querySelector('.progress-bar');
    let currTime = document.getElementById('current-time');
    let totalTime = document.getElementById('duration');
    let volSlider = document.querySelector('.volume-slider');
    let volProgress = document.querySelector('.volume-progress');
    let nowPlayingImg = document.getElementById('current-track-img');
    let songTitle = document.getElementById('current-track-title');
    let artistName = document.getElementById('current-track-artist');
    let cards = document.querySelectorAll('.music-card');
    
    // My music collection
    let songs = [
        {
            title: 'Reflections Laughing',
            artist: 'The Weeknd',
            file: './src/music/weeknd.mp3',
            image: './src/img/weeknd.png'
        },
        {
            title: 'Like Him',
            artist: 'Tyler the Creator',
            file: './src/music/tyler.mp3',
            image: './src/img/tyler.png'
        },
        {
            title: 'Saint Pablo',
            artist: 'Kanye West',
            file: './src/music/kanye.mp3',
            image: './src/img/kanye.png'
        },
        {
            title: 'Luther',
            artist: 'Kendrick Lamar & SZA',
            file: './src/music/luther.mp3',
            image: './src/img/gnx.png'
        }
    ];
    
    // Track what's happening
    let currentSong = 0;
    let playing = false;
    
    // Helper functions
    function loadSong(index) {
        // console.log("Loading song: " + index); // Commented-out debug code
        let song = songs[index];
        player.src = song.file;
        nowPlayingImg.src = song.image;
        songTitle.textContent = song.title;
        artistName.textContent = song.artist;
        
        updateButtons();
        resetProgressBar();
    }
    
    // Play the current track
    function playSong() {
        player.play();
        playing = true;
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }
    
    // Pause it
    function pauseSong() {
        player.pause();
        playing = false;
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
    
    // Go back one song
    function prevSong() {
        currentSong--;
        if (currentSong < 0) {
            currentSong = songs.length - 1; // Loop back to end
        }
        loadSong(currentSong);
        playSong();
    }
    
    // Skip to next song
    function nextSong() {
        currentSong = (currentSong + 1) % songs.length;
        loadSong(currentSong);
        playSong();
    }
    
    // Update the progress bar as song plays
    function updateProgressBar(e) {
        if (e.srcElement.duration) {
            let percent = (e.srcElement.currentTime / e.srcElement.duration) * 100;
            progress.style.width = percent + '%';
            
            // Show times
            let mins = Math.floor(e.srcElement.currentTime / 60);
            let secs = Math.floor(e.srcElement.currentTime % 60);
            currTime.textContent = mins + ':' + (secs < 10 ? '0' + secs : secs);
            
            // Total duration
            let totalMins = Math.floor(e.srcElement.duration / 60);
            let totalSecs = Math.floor(e.srcElement.duration % 60);
            if(e.srcElement.duration) {
                totalTime.textContent = totalMins + ':' + (totalSecs < 10 ? '0' + totalSecs : totalSecs);
            }
        }
    }
    
    // Let user click on progress bar to skip
    function skipTo(e) {
        let width = this.clientWidth;
        let clickPos = e.offsetX;
        let skipToTime = (clickPos / width) * player.duration;
        
        player.currentTime = skipToTime;
    }
    
    // Reset progress when loading new song
    function resetProgressBar() {
        progress.style.width = '0%';
        currTime.textContent = '0:00';
        totalTime.textContent = '0:00';
    }
    
    // Volume control
    function changeVolume(e) {
        let width = this.clientWidth;
        let clickX = e.offsetX;
        let vol = clickX / width;
        
        // Keep volume between 0 and 1
        if (vol < 0) vol = 0;
        if (vol > 1) vol = 1;
        
        player.volume = vol;
        volProgress.style.width = (vol * 100) + '%';
    }
    
    // Update play buttons on cards
    function updateButtons() {
        // First reset all to play
        let icons = document.querySelectorAll('.play-btn i');
        for (let i = 0; i < icons.length; i++) {
            icons[i].className = 'fas fa-play';
        }
        
        // Then update current if playing
        if (playing) {
            let currentCard = document.querySelector(`.music-card[data-song="${songs[currentSong].file}"]`);
            if (currentCard) {
                let icon = currentCard.querySelector('.play-btn i');
                icon.className = 'fas fa-pause';
            }
        }
    }
    
    // Set up all the buttons
    playBtn.onclick = function() {
        if (playing) {
            pauseSong();
        } else {
            playSong();
        }
        updateButtons();
    };
    
    prevButton.addEventListener('click', prevSong);
    nextButton.addEventListener('click', nextSong);
    
    // Update as song plays
    player.addEventListener('timeupdate', updateProgressBar);
    player.addEventListener('ended', nextSong);
    
    // Controls Interactions
    progressCont.addEventListener('click', skipTo);
    volSlider.addEventListener('click', changeVolume);
    
    // Default volume
    player.volume = 0.5;
    volProgress.style.width = '50%';
    
    // Make all the cards clickable
    for (let i = 0; i < cards.length; i++) {
        let card = cards[i];
        let btn = card.querySelector('.play-btn');
        
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            if (currentSong === i && playing) {
                pauseSong();
            } else {
                currentSong = i;
                loadSong(currentSong);
                playSong();
            }
            updateButtons();
        });
        
        // Set data attribute to identify cards
        card.setAttribute('data-song', songs[i].file);
    }

    loadSong(currentSong);
});

// TODO: Add shuffle and repeat functions later