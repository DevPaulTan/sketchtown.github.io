const canvas = document.getElementById('drawing-canvas');
const context = canvas.getContext('2d');
const brushSizeInput = document.getElementById('brush-size');
const colorInput = document.getElementById('color');
const submitDrawingButton = document.getElementById('submit-drawing');
const clearButton = document.getElementById('clear');
const undoButton = document.getElementById('undo');
const redoButton = document.getElementById('redo');

function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let drawing = false;
let brushSize = brushSizeInput.value;
let brushColor = colorInput.value;

context.lineWidth = brushSize;
context.strokeStyle = brushColor;

let drawingHistory = [];
let historyIndex = -1;

function saveDrawingState() {
  if (historyIndex < drawingHistory.length - 1) {
    drawingHistory.splice(historyIndex + 1);
  }
  drawingHistory.push(canvas.toDataURL());
  historyIndex++;
}

function restoreDrawingState(imageDataUrl) {
  const image = new Image();
  image.src = imageDataUrl;
  image.onload = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0);
  };
}

canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  context.beginPath();
  context.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
  saveDrawingState();
});

canvas.addEventListener('mousemove', (e) => {
  if (drawing) {
    context.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    context.stroke();
  }
});

canvas.addEventListener('mouseup', () => {
  drawing = false;
});

brushSizeInput.addEventListener('input', () => {
  brushSize = brushSizeInput.value;
  context.lineWidth = brushSize;
});

colorInput.addEventListener('input', () => {
  brushColor = colorInput.value;
  context.strokeStyle = brushColor;
});

clearButton.addEventListener('click', () => {
  saveDrawingState();
  context.clearRect(0, 0, canvas.width, canvas.height);
});

undoButton.addEventListener('click', () => {
  if (historyIndex > 0) {
    historyIndex--;
    restoreDrawingState(drawingHistory[historyIndex]);
  }
});

redoButton.addEventListener('click', () => {
  if (historyIndex < drawingHistory.length - 1) {
    historyIndex++;
    restoreDrawingState(drawingHistory[historyIndex]);
  }
});

// Replace with your own GitHub Personal Access Token (PAT)
const githubToken = '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';

// Replace with your own GitHub repo information
const repoOwner = 'DevPaulTan';
const repoName = 'SketchTown';
const repoBranch = 'main';

async function pushImageToGitHub(imageDataUrl) {
  const imageBase64 = imageDataUrl.split(',')[1];
  const fileName = 'sketch.jpeg';

  // Get the file's current commit SHA
  let commitSHA;
  try {
    const fileResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${fileName}`, {
      headers: {
        'Authorization': `token ${githubToken}`,
      },
    });

    const fileData = await fileResponse.json();
    commitSHA = fileData.sha;
  } catch (error) {
    console.error('Error fetching file SHA:', error);
  }

  const contentResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${fileName}`, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${githubToken}`,
    },
    body: JSON.stringify({
      message: 'Update sketch',
      content: imageBase64,
      branch: repoBranch,
      sha: commitSHA,
    }),
  });

  const contentData = await contentResponse.json();
  console.log('Image uploaded to GitHub:', contentData.content.html_url);
}

submitDrawingButton.addEventListener('click', async () => {
  const imageData = canvas.toDataURL('image/jpg', 9.0);
  await pushImageToGitHub(imageData);
  alert('Sketch uploaded to GitHub successfully!');
});
