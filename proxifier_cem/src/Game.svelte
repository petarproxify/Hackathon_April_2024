<script>
    import { onMount } from 'svelte';
  
    let canvas, ctx;
//    let roles = ['Backend', 'Frontend', 'Data Science', 'Mobile'];
    let languages = ['Java', 'Kotlin', 'C#'];
    let score = 0;
    let lastRenderTime = 0;
 //   const logoSpeedPerSecond = 300; // Pixels per second
    let currentLogoIndex = 0; // Index to track the current logo
  
    let currentLevel = 0;
    let levels = [
      { 
        logoSpeedPerSecond: 100,
        roles: ['Backend', 'Frontend', 'Mobile'],
        logos: // Mobile Development
              [{
                src: '/assets/logos/Android.png',
                image: new Image(),
                position: { x: 250, y: 0 },
                hasFallen: false,
                roles: ['Mobile'],
                languages: ['Kotlin', 'Java']
              },
              {
                src: '/assets/logos/iOS.png',
                image: new Image(),
                position: { x: 50, y: 0 },
                hasFallen: false,
                roles: ['Mobile'],
                languages: ['Swift', 'Objective-C']
              },
              {
                src: '/assets/logos/Flutter.png',
                image: new Image(),
                position: { x: 120, y: 0 },
                hasFallen: false,
                roles: ['Mobile'],
                languages: ['Dart']
              },
              {
                src: '/assets/logos/React Native.png',
                image: new Image(),
                position: { x: 153, y: 0 },
                hasFallen: false,
                roles: ['Mobile'],
                languages: ['JavaScript']
              },
              // Frontend Development
              {
                src: '/assets/logos/Svelte.png',
                image: new Image(),
                position: { x: 100, y: 100 },
                hasFallen: false,
                roles: ['Frontend']
              },
              {
                src: '/assets/logos/React.js.png',
                image: new Image(),
                position: { x: 300, y: 100 },
                hasFallen: false,
                roles: ['Frontend']
              },
              {
                src: '/assets/logos/Angular.png',
                image: new Image(),
                position: { x: 221, y: 100 },
                hasFallen: false,
                roles: ['Frontend']
              },
              {
                src: '/assets/logos/Vue.js.png',
                image: new Image(),
                position: { x: 270, y: 100 },
                hasFallen: false,
                roles: ['Frontend']
              },
              // Backend Development
              {
                src: '/assets/logos/Node.js.png',
                image: new Image(),
                position: { x: 150, y: 200 },
                hasFallen: false,
                roles: ['Backend'],
                languages: ['JavaScript']
              },
              {
                src: '/assets/logos/Django.png',
                image: new Image(),
                position: { x: 167, y: 200 },
                hasFallen: false,
                roles: ['Backend'],
                languages: ['Python']
              },
              {
                src: '/assets/logos/Spring.png',
                image: new Image(),
                position: { x: 50, y: 200 },
                hasFallen: false,
                roles: ['Backend'],
                languages: ['Java']
              }
            ]
      },
      { 
        logoSpeedPerSecond: 100,
        roles: ['Data Science', 'Backend', 'DevOps', 'Mobile'],
        logos: // Mobile Development
              [
              {
                src: '/assets/logos/AWS.png',
                image: new Image(),
                position: { x: 50, y: 0 },
                hasFallen: false,
                roles: ['DevOps']
              },
              {
                src: '/assets/logos/Swift.png',
                image: new Image(),
                position: { x: 50, y: 0 },
                hasFallen: false,
                roles: ['Mobile']
              },
              {
                src: '/assets/logos/C#.png',
                image: new Image(),
                position: { x: 120, y: 0 },
                hasFallen: false,
                roles: ['Backend']
              },              
              {
                src: '/assets/logos/TensorFlow.png',
                image: new Image(),
                position: { x: 150, y: 200 },
                hasFallen: false,
                roles: ['Data Science']
              },

              {
                src: '/assets/logos/Docker.png',
                image: new Image(),
                position: { x: 153, y: 0 },
                hasFallen: false,
                roles: ['DevOps']
              },
              // Frontend Development
              {
                src: '/assets/logos/Kubernetes.png',
                image: new Image(),
                position: { x: 100, y: 100 },
                hasFallen: false,
                roles: ['DevOps']
              },
              {
                src: '/assets/logos/Laravel.png',
                image: new Image(),
                position: { x: 300, y: 100 },
                hasFallen: false,
                roles: ['Backend']
              },
              {
                src: '/assets/logos/Azure.png',
                image: new Image(),
                position: { x: 250, y: 0 },
                hasFallen: false,
                roles: ['DevOps']
              },
              {
                src: '/assets/logos/Pandas.png',
                image: new Image(),
                position: { x: 221, y: 100 },
                hasFallen: false,
                roles: ['Data Science']
              },
              {
                src: '/assets/logos/Numpy.png',
                image: new Image(),
                position: { x: 270, y: 100 },
                hasFallen: false,
                roles: ['Data Science']
              },
              {
                src: '/assets/logos/Symfony.png',
                image: new Image(),
                position: { x: 167, y: 200 },
                hasFallen: false,
                roles: ['Backend']
              },
              {
                src: '/assets/logos/R.png',
                image: new Image(),
                position: { x: 50, y: 200 },
                hasFallen: false,
                roles: ['Data Science']
              }
            ]
      },
      { 
        logoSpeedPerSecond: 100,
        roles: ['BI', 'Design', 'Backend', 'DevOps', 'Data Engineering', 'Mobile'],
        logos: // Mobile Development
              [
              {
                src: '/assets/logos/Snowflake.png',
                image: new Image(),
                position: { x: 50, y: 0 },
                hasFallen: false,
                roles: ['Data Engineering']
              },
              {
                src: '/assets/logos/Microsoft Power BI.png',
                image: new Image(),
                position: { x: 120, y: 0 },
                hasFallen: false,
                roles: ['BI']
              },        
              {
                src: '/assets/logos/FastAPI.png',
                image: new Image(),
                position: { x: 153, y: 0 },
                hasFallen: false,
                roles: ['Backend']
              },
              {
                src: '/assets/logos/Ionic.png',
                image: new Image(),
                position: { x: 100, y: 100 },
                hasFallen: false,
                roles: ['Mobile']
              },
              {
                src: '/assets/logos/Laravel.png',
                image: new Image(),
                position: { x: 300, y: 100 },
                hasFallen: false,
                roles: ['Backend']
              },
              {
                src: '/assets/logos/PHP.png',
                image: new Image(),
                position: { x: 250, y: 0 },
                hasFallen: false,
                roles: ['Backend']
              },
              {
                src: '/assets/logos/SQL.png',
                image: new Image(),
                position: { x: 221, y: 100 },
                hasFallen: false,
                roles: ['Backend', 'Data Engineering']
              },
              {
                src: '/assets/logos/Tableau.png',
                image: new Image(),
                position: { x: 270, y: 100 },
                hasFallen: false,
                roles: ['BI']
              },
              {
                src: '/assets/logos/Google Cloud.png',
                image: new Image(),
                position: { x: 167, y: 200 },
                hasFallen: false,
                roles: ['DevOps']
              },
              {
                src: '/assets/logos/Figma.png',
                image: new Image(),
                position: { x: 50, y: 200 },
                hasFallen: false,
                roles: ['Design']
              }
            ]
      }

    ]
    let counter = 0;
    let gameFinished = false;
    
      
    function loadLogos(){
      levels[currentLevel].logos.forEach(logo => {
      logo.image.src = logo.src;
      logo.image.onload = () => {
        if (levels[currentLevel].logos.every(logo => logo.image.complete)) {
          requestAnimationFrame(updateAndDraw); // Start the loop when all images are loaded
        }
      };
    });
    }
  
    function handleKeyPress(event) {
      let currentLogo = levels[currentLevel].logos[currentLogoIndex];
      if (event.key === "ArrowLeft") {
        currentLogo.position.x -= 10;
      } else if (event.key === "ArrowRight") {
        currentLogo.position.x += 10;
      }
    }
  
    function updateAndDraw(timestamp) {
      const timeSinceLastRender = (timestamp - lastRenderTime) / 1000; // Convert to seconds
      lastRenderTime = timestamp;
      update(timeSinceLastRender);
      draw();
      requestAnimationFrame(updateAndDraw);
    }
    
    function update(timeDelta) {
    let currentLogo = levels[currentLevel].logos[currentLogoIndex];
    const moveDistance = levels[currentLevel].logoSpeedPerSecond * timeDelta;
    currentLogo.position.y += moveDistance;
  
      if (currentLogo.position.y >= canvas.height - 40) { // Logo reaches the bottom
        // Reset the logo position for simplicity
        currentLogo.position.y = 0;
        currentLogo.hasFallen = true;
  
        let segmentWidth = canvas.width / levels[currentLevel].roles.length; // Divide canvas width by number of roles
        // Determine if the logo landed on its correct role
        let logoLandedInSegment = Math.floor(currentLogo.position.x / segmentWidth);
        if(currentLogo.roles.includes(levels[currentLevel].roles.at(logoLandedInSegment)))
        {
          score++;
        }
  
        // Move to the next logo
        currentLogoIndex = (currentLogoIndex + 1) % levels[currentLevel].logos.length;
        counter++;
        if (counter === levels[currentLevel].logos.length) {
          gameFinished = true;
          canvas.style.display = 'none';
          endLevel();
        }
      }
    }
  
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
  
      // Draw the roles at the bottom
      let segmentWidth = canvas.width / levels[currentLevel].roles.length;
      levels[currentLevel].roles.forEach((role, index) => {
        let x = index * segmentWidth;
        ctx.fillStyle = index % 2 === 0 ? '#ddd' : '#bbb'; // Alternate colors for visual distinction
        ctx.fillRect(x, canvas.height - 30, segmentWidth, 30); // Draw a segment for each role
        ctx.fillStyle = 'black';
        ctx.fillText(role, x + 5, canvas.height - 10); // Adjust text positioning as needed
      });
  
      // Draw the current logo
      let currentLogo = levels[currentLevel].logos[currentLogoIndex];
      if (currentLogo) {
        ctx.drawImage(currentLogo.image, currentLogo.position.x, currentLogo.position.y, 40, 40);
      }
    }

    function showLevelEndPopup() {
      document.getElementById('levelEndPopup').style.display = 'flex';
    }
    function endLevel() {
        if (currentLevel + 1 < levels.length) {
            showLevelEndPopup();
        } else {
            showEndGamePopup();
        }
    }
    
    function showEndGamePopup() {
        document.getElementById('finalScore').innerText = `Your score: ${score}`;
        document.getElementById('endGamePopup').style.display = 'flex';
    }

    function loadNextLevel() {
      gameFinished = false;
      score = 0;
      loadLevel(currentLevel + 1);
      canvas.style.display = '';
      closeLevelEndPopup();
  }

function reloadLevel() {
    loadLevel(currentLevel);
    closeLevelEndPopup();
}

function closeLevelEndPopup() {
    document.getElementById('levelEndPopup').style.display = 'none';
}

function loadLevel(levelIndex) {
    loadLogos();
    currentLevel = levelIndex;

    requestAnimationFrame(updateAndDraw); // Added to start the game loop
}
  
    onMount(() => {
      ctx = canvas.getContext('2d');
      loadLogos();
      window.addEventListener('keydown', handleKeyPress);
    });
  </script>
  <div id="endGamePopup" style="display: none;">
        <div class="popup-content">
            <h2>Game Over!</h2>
            <p id="finalScore">Your score: 0</p>
            <button onclick="startNewGame()">Play Again</button>
        </div>
    </div>
    <!-- Level End Popup -->
<div id="levelEndPopup" style="display: none;">
  <div class="popup-content">
      <h2>Level Complete!</h2>
      <button on:click="{loadNextLevel}">Next Level</button>
      <button on:click="{reloadLevel}">Replay</button>
  </div>
</div>
{#if gameFinished}
  <h1>Game Over!</h1>
  <h2>Your score: {score}</h2>
{:else}
  <h2>Your score: {score}</h2>
{/if}

<canvas bind:this={canvas} width="600" height="400"></canvas>