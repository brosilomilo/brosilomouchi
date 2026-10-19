
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

// Variabel global status toko (true = buka, false = tutup)
let isStoreOpen = true;

function updateStatusToko() {
  const statusElement = document.getElementById('status-toko');
  const sekarang = new Date();
  const jam = sekarang.getHours(); 

  if (jam >= 0 && jam < 17) {
    statusElement.innerText = "Now Open!!!";
    isStoreOpen = true; // Toko Buka
  } else {
    statusElement.innerText = "Now Close!";
    statusElement.style.color = "red";
    isStoreOpen = false; // Toko Tutup
  }
}
updateStatusToko();

///Deskripsinya

function updateDeskripsiToko() {
  const statusElement = document.getElementById('deskripsi-status');
  const sekarang = new Date();
  const jam = sekarang.getHours(); // Mengambil jam (0 - 23)

  // Rentang jam 00.00 - 16.00
  // Catatan: jam < 16 mencakup dari jam 00:00 sampai 15:59.59
  if (jam >= 0 && jam < 17) {
    statusElement.innerText = "Kuy Pesan Mochinya";

  } else {
    statusElement.innerText = "Lagi masak mochi!!";
  }
}

updateDeskripsiToko();

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
    { name: 'Mochi Matcha' }
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

// Fitur Checkout langsung kirim pesanan via WhatsApp
const checkoutBtn = document.getElementById('checkout-btn');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        // Cek apakah toko sedang tutup saat mau checkout
        if (!isStoreOpen) {
            alert("Yah maaf nih lagi tutup, P.O buka dari jam 00:00 - 17:00 yaa!");
            return;
        }

        if (cart.length === 0) {
            alert('Keranjang kamu masih kosong!');
            return;
        }

        let message = "Pesan Mochi!:\n\n";
        let total = 0;
        cart.forEach(item => {
            let subtotal = item.price * item.qty;
            total += subtotal;
            message += `- ${item.name} (${item.qty}x) = Rp ${subtotal.toLocaleString('id-ID')}\n`;
        });
        message += `\n*Total nya: Rp ${total.toLocaleString('id-ID')}*\n\nDitunggu ya cuy`;

        let encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/6283193887278?text=${encodedMessage}`, '_blank');
    });
}

updateCartCount();
