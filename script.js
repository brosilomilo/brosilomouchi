///Navbar aktif dan Scrool Bar

let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header nav a');

window.onscroll = () =>
    sections.forEach(sec => {
        let top = window.scrollY;
        let offset = sec.offsetTop - 150;
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');

        if(top >= offset && top < offset + height){
            navLinks.forEach(links => {
                links.classList.remove('active');
                document.querySelector('header nav a[href*=' + id + ']').classList.add('active');
            })
        }
    })

menuIcon.onclick = () => {
    menuIcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');
}

///Status Toko Update OPEN or CLOSE
///Status Toko & Deskripsi Update Realtime dari Firebase
///admin
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, get, set, update, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Konfigurasi Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDTf3da_pvH0cWCcp3LZlAKo8Byj60BzNU",
    authDomain: "brosilomouchi.firebaseapp.com",
    databaseURL: "https://brosilomouchi-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "brosilomouchi",
    storageBucket: "brosilomouchi.firebasestorage.app",
    messagingSenderId: "553620321746",
    appId: "1:553620321746:web:aec6a279a7e6b2b6f7840b",
    measurementId: "G-FQ6MFKF6BT"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Variabel global status toko
let isStoreOpen = true;

// Ambil referensi ke path 'storeStatus/isOpen'
const statusRef = ref(db, 'storeStatus/isOpen');

// Pantau perubahan secara real-time dari Firebase
onValue(statusRef, (snapshot) => {
    const data = snapshot.val();
    
    // Konversi nilai ke boolean
    const isOpen = (data === true || data === "true");
    
    const statusElement = document.getElementById('status-toko');
    const deskripsiElement = document.getElementById('deskripsi-status');
    
    isStoreOpen = isOpen; // Update status global

    if (isOpen) {
        // Tampilan Saat TOKO BUKA
        if (statusElement) {
            statusElement.innerText = "Now Open!!!";
            statusElement.style.color = ""; // Mengikuti warna default CSS
        }
        if (deskripsiElement) {
            deskripsiElement.innerText = "Kuy Pesan Mochinya";
        }
    } else {
        // Tampilan Saat TOKO TUTUP
        if (statusElement) {
            statusElement.innerText = "Now Close!";
            statusElement.style.color = "red";
        }
        if (deskripsiElement) {
            deskripsiElement.innerText = "Lagi masak mochi!!"; // Atau ubah ke teks tutup sesuai keinginanmu
        }
    }
}, (error) => {
    console.error("Gagal mengambil data dari Firebase:", error);
});
///admnend

/// SISTEM KERANJANG BELANJA & PILIHAN PAKET

let cart = JSON.parse(localStorage.getItem('brosilo_cart')) || [];
let selectedBaseProduct = null;

// Elemen Modal Paket & Keranjang
const packageModal = document.getElementById('package-modal');
const cartModal = document.getElementById('cart-modal');
const selectedProductTitle = document.getElementById('selected-product-title');

// Data dasar produk rasa mochi (Tombol urutan: Coklat, Strawberry, Matcha)
const products = [
    { name: 'Mochi Coklat' },
    { name: 'Mochi Strawberry' },
    { name: 'Mochi Matcha' },
    { name: 'Mochi Mix | Campur' } // <-- Tambahan menu baru
];

// Update badge angka di ikon keranjang navbar
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
        cartCount.innerText = totalItems;
    }
}

// Simpan data keranjang ke localStorage
function saveCart() {
    localStorage.setItem('brosilo_cart', JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
}

// 1. Saat tombol "+Keranjang" diklik -> Munculkan modal pilihan paket
document.querySelectorAll('.services .btn').forEach((btn, index) => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Cek apakah toko sedang tutup
        if (!isStoreOpen) {
            alert("Yah maaf nih lagi tutup, P.O buka dari jam 00:00 - 17:00 yaa!");
            return;
        }

        if (products[index]) {
            selectedBaseProduct = products[index];
            if (selectedProductTitle) {
                selectedProductTitle.innerText = `Pilih Paket - ${selectedBaseProduct.name}`;
            }
            if (packageModal) {
                packageModal.classList.add('active');
            }
        }
    });
});

// Tombol Batal di modal paket
const closePackageBtn = document.getElementById('close-package-btn');
if (closePackageBtn) {
    closePackageBtn.addEventListener('click', () => {
        packageModal.classList.remove('active');
    });
}

// 2. Tombol Konfirmasi "Masukkan ke Keranjang" di modal paket
const confirmAddBtn = document.getElementById('confirm-add-btn');
if (confirmAddBtn) {
    confirmAddBtn.addEventListener('click', () => {
        const selectedRadio = document.querySelector('input[name="package-option"]:checked');
        if (!selectedRadio || !selectedBaseProduct) return;

        const packageName = selectedRadio.value; // Basic / Jumbo / Family
        const packagePrice = parseInt(selectedRadio.getAttribute('data-price'));
        
        // Buat nama item gabungan, contoh: "Mochi Coklat (Jumbo)"
        const fullItemName = `${selectedBaseProduct.name} (${packageName})`;

        // Cek apakah item dengan rasa & paket yang sama sudah ada di keranjang
        const existingItem = cart.find(item => item.name === fullItemName);
        if (existingItem) {
            existingItem.qty += 1;
        } else {
            cart.push({
                name: fullItemName,
                price: packagePrice,
                qty: 1
            });
        }

        saveCart();
        packageModal.classList.remove('active');
        alert(`${fullItemName} berhasil ditambahkan ke keranjang!`);
    });
}

// 3. Render isi keranjang ke dalam modal utama
function renderCartItems() {
    const container = document.getElementById('cart-items-container');
    const totalPriceElement = document.getElementById('cart-total-price');
    
    if (!container || !totalPriceElement) return;

    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align: center; font-size: 1.6rem;">Keranjang masih kosong nih.</p>';
        totalPriceElement.innerText = 'Rp 0';
        return;
    }

    let html = '';
    let totalHarga = 0;

    cart.forEach((item, index) => {
        let subtotal = item.price * item.qty;
        totalHarga += subtotal;
        html += `
            <div class="cart-item-row">
                <div>
                    <strong>${item.name}</strong><br>
                    <small>Rp ${item.price.toLocaleString('id-ID')} x ${item.qty}</small>
                </div>
                <div>
                    <button onclick="changeQty(${index}, 1)" style="padding: 2px 8px; cursor: pointer;">+</button>
                    <span style="margin: 0 8px;">${item.qty}</span>
                    <button onclick="changeQty(${index}, -1)" style="padding: 2px 8px; cursor: pointer;">-</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    totalPriceElement.innerText = 'Rp ' + totalHarga.toLocaleString('id-ID');
}

// Fungsi ubah jumlah item (+ / -) di modal keranjang
window.changeQty = function(index, amount) {
    cart[index].qty += amount;
    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }
    saveCart();
};

// Buka/Tutup Modal Keranjang Utama lewat ikon navbar
const cartIcon = document.getElementById('cart-icon');
if (cartIcon) {
    cartIcon.addEventListener('click', (e) => {
        e.preventDefault();
        cartModal.classList.add('active');
        renderCartItems();
    });
}

const closeCartBtn = document.getElementById('close-cart-btn');
if (closeCartBtn) {
    closeCartBtn.addEventListener('click', () => {
        cartModal.classList.remove('active');
    });
}

/// ===== LOGIN GOOGLE + CHECKOUT + PEMBAYARAN + PESANAN SAYA =====

// ISI DATA PEMBAYARAN KAMU DI SINI
const PAYMENT = {
    qris:  { label: 'QRIS', image: 'assets/pict/QR.jpeg' },
    dana:  { label: 'DANA', number: '083193887278', holder: 'Phanji Arya Baskhara' },
    gopay: { label: 'GoPay', number: '083193887278', holder: 'Phanji Arya Baskhara' },
    bri:   { label: 'BRI', number: '742201026876537', holder: 'Phanji Arya Baskhara' }
};

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rp = n => 'Rp ' + Number(n).toLocaleString('id-ID');
const CANCELABLE = ['Menunggu Pembayaran', 'Verifikasi Pembayaran', 'Menunggu'];

function getSteps(method) {
    const s = ['Menunggu Pembayaran', 'Verifikasi Pembayaran', 'Menunggu', 'Diproses', 'Menunggu Kirim'];
    return method === 'Dijemput' ? [...s, 'Selesai'] : [...s, 'Sedang Dikirim', 'Selesai'];
}
function statusText(status, method) {
    const pickup = method === 'Dijemput';
    return ({
        'Menunggu Pembayaran': 'Menunggu pembayaran',
        'Verifikasi Pembayaran': 'Pembayaran sedang diverifikasi admin',
        'Menunggu': 'Pembayaran valid, menunggu diproses',
        'Diproses': 'Pesanan sedang diproses',
        'Menunggu Kirim': pickup ? 'Pesanan siap, silakan diambil' : 'Pesanan siap, menunggu dikirim',
        'Sedang Dikirim': 'Pesanan sedang dikirim',
        'Selesai': 'Pesanan Selesai',
        'Dibatalkan': 'Pesanan dibatalkan',
        'Ditolak': 'Pesanan ditolak'
    })[status] || status;
}

// ---------- LOGIN GOOGLE ----------
const provider = new GoogleAuthProvider();
let user = null;
const login = () => signInWithPopup(auth, provider).catch(e => {
    if (e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') alert('Login gagal: ' + e.message);
});

// ---------- MODAL "PESANAN SAYA" ----------
const orderModal = document.createElement('div');
orderModal.className = 'cart-modal';
orderModal.id = 'order-modal';
orderModal.innerHTML = `
    <div class="cart-content">
        <h2>Pesanan Saya</h2>
        <div id="track-history" style="text-align:left; font-size:1.3rem;"></div>
        <div id="track-result" style="text-align:left; font-size:1.4rem; margin-top:1.5rem;"></div>
        <button class="btn" id="close-order-btn" style="background:#555; width:100%; margin-top:1.5rem;">Tutup</button>
    </div>`;
document.body.appendChild(orderModal);

const orderLink = document.createElement('a');
orderLink.href = '#'; orderLink.id = 'order-link'; orderLink.innerText = 'Pesanan Saya';
const authLink = document.createElement('a');
authLink.href = '#'; authLink.id = 'auth-link'; authLink.innerText = 'Log In';
const navEl = document.querySelector('header nav');
if (navEl && cartIcon) { navEl.insertBefore(orderLink, cartIcon); navEl.insertBefore(authLink, cartIcon); }

authLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (!user) login();
    else if (confirm('Log Out dari ' + user.email + '?')) signOut(auth);
});

// ---------- DATA PESANAN (hanya milik user yang login) ----------
let myOrders = {}, selected = null, unsubOrders = null;

onAuthStateChanged(auth, (u) => {
    user = u;
    authLink.innerText = u ? 'Keluar' : 'Login';
    const nameInput = $('buyer-name');
    if (u && nameInput && !nameInput.value) nameInput.value = u.displayName || '';
    if (unsubOrders) { unsubOrders(); unsubOrders = null; }
    myOrders = {}; selected = null;
    if (u) {
        unsubOrders = onValue(query(ref(db, 'orders'), orderByChild('uid'), equalTo(u.uid)), (snap) => {
            myOrders = snap.val() || {};
            render();
        }, (err) => { console.error(err); $('track-history').innerHTML = '<p style="color:#d70032;">Gagal memuat pesanan.</p>'; });
    }
    render();
});

const act = (no, data) => update(ref(db, 'orders/' + no), { ...data, updatedAt: Date.now() })
    .catch(e => alert('Gagal: ' + e.message));

function render() {
    const box = $('track-history'), res = $('track-result');
    if (!user) {
        box.innerHTML = '<p>Login dulu untuk melihat pesananmu.</p><button class="btn" id="login-btn" style="margin-top:1rem;">Login dengan Google</button>';
        res.innerHTML = '';
        $('login-btn').onclick = login;
        return;
    }
    const list = Object.values(myOrders).sort((a, b) => b.createdAt - a.createdAt);
    if (!list.length) { box.innerHTML = '<p style="color:#888;">Belum ada pesanan.</p>'; res.innerHTML = ''; return; }
    if (!myOrders[selected]) selected = list[0].orderNo;

    box.innerHTML = '<strong>Daftar Pesanan Saya:</strong>' + list.map(o => `
        <div class="hist-row" data-no="${esc(o.orderNo)}" style="display:flex; justify-content:space-between; gap:1rem; padding:0.9rem 1.1rem; margin-top:0.7rem; border:2px solid ${o.orderNo === selected ? '#d70032' : '#ddd'}; border-radius:0.8rem; cursor:pointer;">
            <strong>${esc(o.orderNo)}</strong>
            <span style="color:${o.status === 'Selesai' ? '#26971b' : (o.status === 'Dibatalkan' || o.status === 'Ditolak') ? '#d70032' : '#b36b00'}; font-weight:bold; text-align:right;">${esc(statusText(o.status, o.method))}</span>
        </div>`).join('');
    box.querySelectorAll('.hist-row').forEach(r => r.onclick = () => { selected = r.dataset.no; render(); });
    renderDetail(myOrders[selected]);
}

function renderDetail(o) {
    const res = $('track-result');
    const final = o.status === 'Dibatalkan' || o.status === 'Ditolak';
    const done = o.status === 'Selesai';
    const steps = getSteps(o.method), idx = steps.indexOf(o.status);
    const items = Object.values(o.items || {}).map(i => `<li>${esc(i.name)} (${esc(i.qty)}x)</li>`).join('');
    const bg = final ? '#ffebee' : done ? '#e8f5e9' : '#fff8e1';
    const fg = final ? '#d70032' : done ? '#26971b' : '#b36b00';

    // TAMBAHAN: Kotak Struk Klaim Pesanan jika status sudah Menunggu Kirim / Sedang Dikirim / Selesai
    const isReadyOrShipping = ['Menunggu Kirim', 'Sedang Dikirim', 'Selesai'].includes(o.status);
    let claimReceiptHTML = '';
    if (isReadyOrShipping) {
        claimReceiptHTML = `
            <div style="margin: 1.5rem 0; padding: 1.5rem; background: #fff3e0; border: 2px dashed #ffb300; border-radius: 1rem; text-align: center;">
                <h3 style="color: #e65100; font-size: 1.6rem; margin-bottom: 0.5rem;">🎫 STRUK KLAIM PESANAN</h3>
                <p style="font-size: 1.2rem; color: #666; margin-bottom: 1rem;">Tunjukkan nomor ini ke kurir / admin saat pengambilan</p>
                <div style="font-size: 2.4rem; font-weight: bold; color: #d70032; background: white; padding: 0.8rem; border-radius: 0.6rem; display: inline-block; letter-spacing: 2px;">
                    ${esc(o.orderNo)}
                </div>
                <p style="font-size: 1.3rem; margin-top: 1rem; font-weight: bold;">Pemesan: ${esc(o.name)}</p>
                <p style="font-size: 1.2rem; color: #444;">Metode: <strong>${esc(o.method)}</strong> | Total: <strong>${rp(o.total)}</strong></p>
            </div>
        `;
    }

    res.innerHTML = `
        <p><strong>No. Pesanan: ${esc(o.orderNo)}</strong></p>
        <p>Nama: ${esc(o.name)} | ${esc(o.method)}</p>
        <ul style="margin:0.8rem 0 0.8rem 2rem;">${items}</ul>
        <p>Total: <strong>${rp(o.total)}</strong></p>
        
        ${claimReceiptHTML}

        <div style="margin:1.2rem 0; padding:1.2rem; border-radius:1rem; text-align:center; font-size:1.6rem; font-weight:bold; background:${bg}; color:${fg};">
            ${done ? '✅ ' : ''}${esc(statusText(o.status, o.method))}
            ${o.rejectReason ? `<br><small>Alasan: ${esc(o.rejectReason)}</small>` : ''}
        </div>
        ${final ? '' : `<div style="font-size:1.3rem;">${steps.map((s, i) => `<div style="padding:0.2rem 0; color:${i <= idx ? '#26971b' : '#aaa'};">${i <= idx ? '●' : '○'} ${esc(s === 'Menunggu' ? 'Pembayaran Valid' : s === 'Menunggu Kirim' && o.method === 'Dijemput' ? 'Siap Diambil' : s)}</div>`).join('')}</div>`}
        <div id="pay-box"></div>
        <div id="cancel-box"></div>`;

    if (o.status === 'Menunggu Pembayaran') renderPayment(o);

    if (CANCELABLE.includes(o.status)) {
        $('cancel-box').innerHTML = `<button class="btn" id="cancel-btn" style="background:#555; width:100%; margin-top:1rem;">Batalkan Pesanan</button>
            ${o.status !== 'Menunggu Pembayaran' ? '<p style="font-size:1.2rem; color:#888; margin-top:0.5rem;">Kalau sudah bayar, hubungi admin untuk pengembalian dana.</p>' : ''}`;
        $('cancel-btn').onclick = () => { if (confirm('Yakin batalkan pesanan ' + o.orderNo + '?')) act(o.orderNo, { status: 'Dibatalkan', cancelledAt: Date.now() }); };
    }
}

function renderPayment(o) {
    const box = $('pay-box');
    const lbl = 'display:flex; align-items:center; gap:0.8rem; padding:0.8rem 1rem; margin-top:0.6rem; border:2px solid #ddd; border-radius:0.8rem; cursor:pointer;';
    box.innerHTML = `
        <div style="margin-top:1.5rem; padding-top:1.2rem; border-top:2px dashed #ddd;">
            <strong>Pilih Metode Pembayaran:</strong>
            ${o.paymentNote ? `<p style="color:#d70032; margin-top:0.6rem;">${esc(o.paymentNote)}</p>` : ''}
            ${Object.entries(PAYMENT).map(([k, p], i) => `<label style="${lbl}"><input type="radio" name="pay-method" value="${k}" ${i ? '' : 'checked'}> ${esc(p.label)}</label>`).join('')}
            <div id="pay-info" style="margin:1rem 0;"></div>
            <input type="text" id="payer-name" placeholder="Nama pengirim / akun pembayar" style="width:100%; padding:1rem; font-size:1.4rem; border:2px solid #ddd; border-radius:0.8rem;">
            <button class="btn" id="paid-btn" style="width:100%; margin-top:1rem;">Saya Sudah Bayar</button>
        </div>`;

    const key = () => document.querySelector('input[name="pay-method"]:checked').value;
    const showInfo = () => {
        const p = PAYMENT[key()];
        $('pay-info').innerHTML = p.image
            ? `<img src="${p.image}" alt="QRIS" style="width:100%; max-width:240px; display:block; margin:0 auto;" onerror="this.outerHTML='<p style=&quot;color:#d70032;&quot;>QR belum tersedia.</p>'">
               <p style="text-align:center; margin-top:0.6rem;">Scan lalu bayar tepat <strong>${rp(o.total)}</strong></p>`
            : `<p>${esc(p.label)}: <strong>${esc(p.number)}</strong> a.n. ${esc(p.holder)}
               <button class="btn" id="copy-btn" style="padding:0.3rem 1rem; font-size:1.2rem; margin:0 0 0 0.5rem;">Salin</button></p>
               <p>Transfer tepat <strong>${rp(o.total)}</strong></p>`;
        const c = $('copy-btn');
        if (c) c.onclick = () => navigator.clipboard.writeText(p.number).then(() => c.innerText = 'Tersalin');
    };
    box.querySelectorAll('input[name="pay-method"]').forEach(r => r.addEventListener('change', showInfo));
    showInfo();

    $('paid-btn').onclick = () => {
        const payer = $('payer-name').value.trim();
        if (!payer) return alert('Isi nama pengirim dulu ya, biar admin gampang cek.');
        act(o.orderNo, {
            status: 'Verifikasi Pembayaran',
            payment: { method: PAYMENT[key()].label, payer: payer.slice(0, 60), at: Date.now() },
            paymentNote: null
        });
    };
}

function openOrderModal(no) {
    if (no) selected = no;
    orderModal.classList.add('active');
    render();
}
orderLink.addEventListener('click', (e) => { e.preventDefault(); openOrderModal(); });
$('close-order-btn').addEventListener('click', () => orderModal.classList.remove('active'));

// ---------- CHECKOUT ----------
const checkoutBtn = $('checkout-btn');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', async () => {
        if (!user) { alert('Login dulu pakai akun Google ya sebelum checkout.'); login(); return; }
        const buyerNameInput = $('buyer-name');
        const buyerName = buyerNameInput ? buyerNameInput.value.trim() : '';
        if (!buyerName) { alert('Masukkan nama kamu dulu sebelum checkout ya, Cuy!'); if (buyerNameInput) buyerNameInput.focus(); return; }
        if (!isStoreOpen) { alert("Yah maaf nih lagi tutup, Transaksi lagi limit!!"); return; }
        if (cart.length === 0) { alert('Keranjang kamu masih kosong!'); return; }

        const radio = document.querySelector('input[name="delivery-method"]:checked');
        const method = radio ? radio.value : 'Diantar';
        const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

        checkoutBtn.disabled = true;
        checkoutBtn.innerText = 'Mengirim...';
        try {
            let orderNo = null, lastErr = null;
            for (let i = 0; i < 5 && !orderNo; i++) {
                const no = 'BM-' + Math.floor(1000 + Math.random() * 9000);
                try {
                    await set(ref(db, 'orders/' + no), {
                        orderNo: no, uid: user.uid, email: user.email,
                        name: buyerName.slice(0, 60), method,
                        items: cart.map(i => ({ name: i.name, price: i.price, qty: i.qty })),
                        total, status: 'Menunggu Pembayaran',
                        createdAt: Date.now(), updatedAt: Date.now()
                    });
                    orderNo = no;
                } catch (e) { lastErr = e; console.warn('Coba lagi:', e.code, e.message); }
            }
            if (!orderNo) throw lastErr || new Error('gagal membuat pesanan');

            cart = []; saveCart();
            cartModal.classList.remove('active');
            openOrderModal(orderNo);
            alert('Pesanan dibuat! Selesaikan pembayaran supaya pesananmu diproses.');
        } catch (err) {
            console.error(err);
            // DIAGNOSA: tampilkan penyebab asli (hapus blok ini kalau sudah beres)
            const dbOpen = await get(ref(db, 'storeStatus/isOpen')).then(s => JSON.stringify(s.val())).catch(() => 'tidak terbaca');
            alert('Gagal mengirim pesanan.\nKode: ' + (err.code || err.message) +
                '\nisOpen di database: ' + dbOpen +
                '\nLogin anonim: ' + (user && user.isAnonymous ? 'YA (salah akun)' : 'tidak'));
        } finally {
            checkoutBtn.disabled = false;
            checkoutBtn.innerText = 'Checkout';
        }
    });
}

updateCartCount();
