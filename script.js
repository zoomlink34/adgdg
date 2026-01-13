const firebaseConfig = {
    apiKey: "AIzaSyDgLYZLFCF8yiQ-58Z1wmMC-MczxwyItw0",
    authDomain: "m-legacy-5cf2b.firebaseapp.com",
    databaseURL: "https://m-legacy-5cf2b-default-rtdb.firebaseio.com",
    projectId: "m-legacy-5cf2b"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const cv = document.getElementById('mainCanvas'), ctx = cv.getContext('2d');
const mover = document.getElementById('mover'), viewport = document.getElementById('viewport');

// ৫০০০ প্লটের জন্য গ্রিড (৫০ কলাম x ১০০ রো)
const blockW = 60, blockH = 40, cols = 50, rows = 100; 
cv.width = cols * blockW; cv.height = rows * blockH;

let scale = 0.15, pX = 0, pY = 0, pixels = {};
const imgCache = {};

function render() {
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.strokeStyle = "#333"; ctx.lineWidth = 1;
    for (let i = 0; i <= cols; i++) { ctx.beginPath(); ctx.moveTo(i * blockW, 0); ctx.lineTo(i * blockW, cv.height); ctx.stroke(); }
    for (let j = 0; j <= rows; j++) { ctx.beginPath(); ctx.moveTo(0, j * blockH); ctx.lineTo(cv.width, j * blockH); ctx.stroke(); }

    Object.values(pixels).forEach(p => {
        if (p.imageUrl) {
            if (!imgCache[p.imageUrl]) {
                const img = new Image(); img.crossOrigin = "anonymous"; img.src = p.imageUrl;
                img.onload = () => { imgCache[p.imageUrl] = img; ctx.drawImage(img, p.x, p.y, blockW, blockH); };
            } else { ctx.drawImage(imgCache[p.imageUrl], p.x, p.y, blockW, blockH); }
        }
    });
}

function updateUI() {
    // সেন্টার এলাইনমেন্ট এবং স্কেল
    mover.style.transformOrigin = "center center";
    mover.style.transform = `scale(${scale})`;
}

function searchPlot() {
    const id = parseInt(document.getElementById('searchInput').value);
    if (id < 1 || id > 5000) return alert("Enter ID between 1-5000");
    scale = 2.5;
    updateUI();
}

function checkStatus() {
    const id = document.getElementById('trackID').value;
    if(!id) return alert("Enter Order ID");
    db.ref('notifications/' + id).once('value', s => {
        const d = s.val();
        if(!d) alert("Order Pending or Not Found.");
        else alert("STATUS: " + d.status + "\nCEO MESSAGE: " + d.message);
    });
}

db.ref('pixels').on('value', s => {
    pixels = s.val() || {};
    const sold = new Set(Object.values(pixels).map(p => p.plotID)).size;
    document.getElementById('sold-count').innerText = sold;
    document.getElementById('rem-count').innerText = 5000 - sold;
    render();
});

// শুধু জুম চালু থাকবে
viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    scale = Math.min(Math.max(scale * (e.deltaY > 0 ? 0.9 : 1.1), 0.1), 5);
    updateUI();
}, { passive: false });

function copyVal(v) { navigator.clipboard.writeText(v).then(() => alert("Copied: " + v)); }
updateUI();
