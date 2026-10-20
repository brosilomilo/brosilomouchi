
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
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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
            alert("Yah maaf nih lagi tutup, tunggu buka ya!!");
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

// Fitur Checkout langsung kirim pesanan via WhatsApp
const checkoutBtn = document.getElementById('checkout-btn');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        // Ambil nilai nama dari input
        const buyerNameInput = document.getElementById('buyer-name');
        const buyerName = buyerNameInput ? buyerNameInput.value.trim() : "";

        // Validasi jika nama kosong
        if (!buyerName) {
            alert('Masukkan nama kamu dulu sebelum checkout ya, Cuy!');
            if (buyerNameInput) buyerNameInput.focus();
            return;
        }
        // Cek apakah toko sedang tutup saat mau checkout
        if (!isStoreOpen) {
            alert("Yah maaf nih lagi tutup, tunggu buka ya!!");
            return;
        }

        if (cart.length === 0) {
            alert('Keranjang kamu masih kosong!');
            return;
        }

        // Ambil pilihan metode pengambilan (Diantar / Dijemput)
        const deliveryMethodRadio = document.querySelector('input[name="delivery-method"]:checked');
        const deliveryMethod = deliveryMethodRadio ? deliveryMethodRadio.value : "Diantar";

        let message = "Pesan Mochi!:\n\n";
        message += `Nama Pemesan            : *${buyerName}*\n`;
        message += `Metode Pengambilan  : *${deliveryMethod}*\n\n*Detail Pesanan:*\n`;
        let total = 0;
        cart.forEach(item => {
            let subtotal = item.price * item.qty;
            total += subtotal;
            message += `- ${item.name} (${item.qty}x) = Rp ${subtotal.toLocaleString('id-ID')}\n`;
        });
        message += `\n*Total nya: Rp ${total.toLocaleString('id-ID')}*\n\n`;

        let encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/6283193887278?text=${encodedMessage}`, '_blank');
    });
}

updateCartCount();
