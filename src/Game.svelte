<script>
  import { onMount } from 'svelte';

  let canvas, ctx;
  let score = 0;
  let totalScore = 0;
  let lastRenderTime = 0;
  let currentLogoIndex = 0; // Index to track the current logo
  let currentLevel = 0;
  let currentGuess = '';
  let levels = [
    {
      logoSpeedPerSecond: 100,
      roles: ['Backend', 'Frontend', 'Mobile'],
      logos: // Mobile Development
        [{
          src: '/assets/logos/Android.png',
          name: 'Android',
          image: new Image(),
          position: { x: 250, y: 0 },
          hasFallen: false,
          roles: ['Mobile'],
          languages: ['Kotlin', 'Java']
        },
          {
            src: '/assets/logos/iOS.png',
            name: 'iOS',
            image: new Image(),
            position: { x: 150, y: 0 },
            hasFallen: false,
            roles: ['Mobile'],
            languages: ['Swift', 'Objective-C']
          },
          {
            src: '/assets/logos/Flutter.png',
            name: 'Flutter',
            image: new Image(),
            position: { x: 120, y: 0 },
            hasFallen: false,
            roles: ['Mobile'],
            languages: ['Dart']
          },
          {
            src: '/assets/logos/React Native.png',
            name: 'React Native',
            image: new Image(),
            position: { x: 153, y: 0 },
            hasFallen: false,
            roles: ['Mobile'],
            languages: ['JavaScript']
          },
          // Frontend Development
          {
            src: '/assets/logos/Svelte.png',
            name: 'Svelte',
            image: new Image(),
            position: { x: 100, y: 0 },
            hasFallen: false,
            roles: ['Frontend']
          },
          {
            src: '/assets/logos/React.js.png',
            name: 'React.js',
            image: new Image(),
            position: { x: 300, y: 0 },
            hasFallen: false,
            roles: ['Frontend']
          },
          {
            src: '/assets/logos/Angular.png',
            name: 'Angular',
            image: new Image(),
            position: { x: 221, y: 0 },
            hasFallen: false,
            roles: ['Frontend']
          },
          {
            src: '/assets/logos/Vue.js.png',
            name: 'Vue.js',
            image: new Image(),
            position: { x: 270, y: 0 },
            hasFallen: false,
            roles: ['Frontend']
          },
          // Backend Development
          {
            src: '/assets/logos/Node.js.png',
            name: 'Node.js',
            image: new Image(),
            position: { x: 150, y: 0 },
            hasFallen: false,
            roles: ['Backend'],
            languages: ['JavaScript']
          },
          {
            src: '/assets/logos/Django.png',
            name: 'Django',
            image: new Image(),
            position: { x: 167, y: 0 },
            hasFallen: false,
            roles: ['Backend'],
            languages: ['Python']
          },
          {
            src: '/assets/logos/Spring.png',
            name: 'Spring',
            image: new Image(),
            position: { x: 50, y: 0 },
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
            name: 'AWS',
            image: new Image(),
            position: { x: 50, y: 0 },
            hasFallen: false,
            roles: ['DevOps']
          },
          {
            src: '/assets/logos/Swift.png',
            name: 'Swift',
            image: new Image(),
            position: { x: 50, y: 0 },
            hasFallen: false,
            roles: ['Mobile']
          },
          {
            src: '/assets/logos/CSharp.png',
            name: 'C#',
            image: new Image(),
            position: { x: 120, y: 0 },
            hasFallen: false,
            roles: ['Backend']
          },
          {
            src: '/assets/logos/TensorFlow.png',
            name: 'TensorFlow',
            image: new Image(),
            position: { x: 150, y: 0 },
            hasFallen: false,
            roles: ['Data Science']
          },

          {
            src: '/assets/logos/Docker.png',
            name: 'Docker',
            image: new Image(),
            position: { x: 153, y: 0 },
            hasFallen: false,
            roles: ['DevOps']
          },
          // Frontend Development
          {
            src: '/assets/logos/Kubernetes.png',
            name: 'Kubernetes',
            image: new Image(),
            position: { x: 100, y: 0 },
            hasFallen: false,
            roles: ['DevOps']
          },
          {
            src: '/assets/logos/Laravel.png',
            image: new Image(),
            position: { x: 300, y: 0 },
            hasFallen: false,
            roles: ['Backend']
          },
          {
            src: '/assets/logos/Azure.png',
            name: 'Azure',
            image: new Image(),
            position: { x: 250, y: 0 },
            hasFallen: false,
            roles: ['DevOps']
          },
          {
            src: '/assets/logos/Pandas.png',
            image: new Image(),
            position: { x: 221, y: 0 },
            hasFallen: false,
            roles: ['Data Science']
          },
          {
            src: '/assets/logos/Numpy.png',
            image: new Image(),
            position: { x: 270, y: 0 },
            hasFallen: false,
            roles: ['Data Science']
          },
          {
            src: '/assets/logos/Symfony.png',
            name: 'Symfony',
            image: new Image(),
            position: { x: 167, y: 0 },
            hasFallen: false,
            roles: ['Backend']
          },
          {
            src: '/assets/logos/R.png',
            name: 'R',
            image: new Image(),
            position: { x: 50, y: 0 },
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
            name: 'Snowflake',
            image: new Image(),
            position: { x: 50, y: 0 },
            hasFallen: false,
            roles: ['Data Engineering']
          },
          {
            src: '/assets/logos/Microsoft Power BI.png',
            name: 'Microsoft Power BI',
            image: new Image(),
            position: { x: 120, y: 0 },
            hasFallen: false,
            roles: ['BI']
          },
          {
            src: '/assets/logos/FastAPI.png',
            name: 'FastAPI',
            image: new Image(),
            position: { x: 153, y: 0 },
            hasFallen: false,
            roles: ['Backend']
          },
          {
            src: '/assets/logos/Ionic.png',
            name: 'Ionic',
            image: new Image(),
            position: { x: 100, y: 0 },
            hasFallen: false,
            roles: ['Mobile']
          },
          {
            src: '/assets/logos/Laravel.png',
            name: 'Laravel',
            image: new Image(),
            position: { x: 300, y: 0 },
            hasFallen: false,
            roles: ['Backend']
          },
          {
            src: '/assets/logos/PHP.png',
            name: 'PHP',
            image: new Image(),
            position: { x: 250, y: 0 },
            hasFallen: false,
            roles: ['Backend']
          },
          {
            src: '/assets/logos/SQL.png',
            name: 'SQL',
            image: new Image(),
            position: { x: 221, y: 0 },
            hasFallen: false,
            roles: ['Backend', 'Data Engineering']
          },
          {
            src: '/assets/logos/Tableau.png',
            name: 'Tableau',
            image: new Image(),
            position: { x: 270, y: 0 },
            hasFallen: false,
            roles: ['BI']
          },
          {
            src: '/assets/logos/Google Cloud.png',
            name: 'Google Cloud',
            image: new Image(),
            position: { x: 167, y: 0 },
            hasFallen: false,
            roles: ['DevOps']
          },
          {
            src: '/assets/logos/Figma.png',
            name: 'Figma',
            image: new Image(),
            position: { x: 50, y: 0 },
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
    currentGuess = currentLogo.name;
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
    totalScore += score;
    score = 0;
    lastRenderTime = 0;
    counter = 0;
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
    currentLevel = levelIndex;
    loadLogos();

    requestAnimationFrame(updateAndDraw); // Added to start the game loop
  }

  onMount(() => {
    ctx = canvas.getContext('2d');
    loadLogos();
    window.addEventListener('keydown', handleKeyPress);
  });
</script>

<style>
  canvas {
    border: 1px solid black;
  }

  #endGamePopup, #levelEndPopup {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .popup-content {
    background-color: white;
    padding: 20px;
    border-radius: 5px;
    text-align: center;
  }

  button {
    padding: 10px 20px;
    margin: 10px;
    border: none;
    background-color: #007bff;
    color: white;
    border-radius: 5px;
    cursor: pointer;
  }

  button:hover {
    background-color: #0056b3;
  }

  .container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    flex-direction: column;
  }

  .center-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .game-info {
    flex-direction: row;
    display: flex;
  }

  .info {
    margin: 16px;
  }
</style>

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

<div class="page">
  {#if gameFinished}
    <h1>Game Over!</h1>
    <h2>Your score: {score}</h2>
  {:else}
    <h1>Match the Frameworks!</h1>
    <p>Use the arrow keys to move the logos to the correct role at the bottom.</p>
    <p>Current: {currentGuess}</p>
    <div class="game-info">
      <p class="info">Score: {score}</p>
      <p class="info">Level: {currentLevel + 1}</p>
      <p class="info">Frameworks: {counter}/{levels[currentLevel].logos.length}</p>
    </div>
  {/if}

  <div class="container">
    <div class="center-column">
      <canvas bind:this={canvas} width="600" height="400"></canvas>
    </div>
  </div>
</div>

