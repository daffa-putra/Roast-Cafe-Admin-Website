const menuItems = [
    { id: 1, name: "Espresso", category: "coffee", price: 20000, image: "assets/coffe.jpg" },
    { id: 2, name: "Cappuccino", category: "coffee", price: 25000, image: "assets/coffe.jpg" },
    { id: 3, name: "Latte", category: "coffee", price: 23000, image: "assets/coffe.jpg" },
    { id: 4, name: "Green Tea", category: "non-coffee", price: 18000, image: "assets/coffe.jpg" },
    { id: 5, name: "Lemon Tea", category: "non-coffee", price: 17000, image: "assets/coffe.jpg" }
];

let pesanan = [];
let totalHarga = 0;
let transaksi = JSON.parse(localStorage.getItem("transaksi")) || [];

// Fungsi untuk menampilkan menu berdasarkan kategori
function renderMenu(filter = "all") {
    const container = document.getElementById("menuContainer");
    container.innerHTML = "";

    menuItems
        .filter(item => filter === "all" || item.category === filter) 
        .forEach(item => {
            const menuHTML = `
                <div class="col">
                    <div class="menu-item p-3 border rounded text-center">
                        <img src="${item.image}" alt="${item.name}" class="img-fluid rounded">
                        <h5 class="mt-2">${item.name}</h5>
                        <p>Rp ${item.price}</p>
                        <div class="d-flex justify-content-center">
                            <input type="number" min="1" value="1" id="jumlah-${item.id}" class="form-control text-center w-50">
                        </div>
                        <button class="btn btn-primary btn-sm mt-2" onclick="tambahPesanan(${item.id})">Tambah</button>
                    </div>
                </div>
            `;
            container.innerHTML += menuHTML;
        });
}

// Fungsi untuk filter menu berdasarkan kategori
function filterMenu(category) {
    renderMenu(category);
}

// Menambahkan pesanan ke daftar
function tambahPesanan(id) {
    const item = menuItems.find(menu => menu.id === id);
    const jumlah = parseInt(document.getElementById(`jumlah-${id}`).value) || 1;
    const pesananIndex = pesanan.findIndex(p => p.id === id);

    if (pesananIndex > -1) {
        pesanan[pesananIndex].jumlah += jumlah;
    } else {
        pesanan.push({ ...item, jumlah });
    }
    renderPesanan();
}

// Menampilkan daftar pesanan
function renderPesanan() {
    const container = document.getElementById("pesananContainer");
    container.innerHTML = "";
    totalHarga = 0;

    pesanan.forEach((item, index) => {
        const total = item.jumlah * item.price;
        totalHarga += total;

        const pesananHTML = `
            <div class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <h6>${item.name}</h6>
                    <small>${item.jumlah} x Rp ${item.price}</small>
                </div>
                <div>
                    <span class="jumlah">Rp ${total}</span><br>
                    <button class="btn btn-danger btn-sm" onclick="hapusPesanan(${index})">Hapus</button>
                </div>
            </div>
        `;
        container.innerHTML += pesananHTML;
    });

    document.getElementById("totalKeseluruhan").textContent = `Rp ${totalHarga}`;

    if (pesanan.length > 0) {
        document.getElementById("checkoutButton").classList.remove("d-none");
    } else {
        document.getElementById("checkoutButton").classList.add("d-none");
        document.getElementById("checkoutForm").classList.add("d-none");
    }
}

// Menghapus pesanan dari daftar
function hapusPesanan(index) {
    const konfirmasi = confirm("Apakah Anda yakin ingin menghapus pesanan ini?");
    if (konfirmasi) {
        pesanan.splice(index, 1);
        renderPesanan();
    }
}

// Fungsi untuk menampilkan form checkout saat tombol checkout ditekan
function tampilkanFormCheckout() {
    document.getElementById("checkoutForm").classList.remove("d-none");
}

// Fungsi untuk memproses checkout
function pesan() {
    const nama = document.getElementById("nama").value.trim();
    const telepon = document.getElementById("telepon").value.trim();
    const jumlahUang = parseInt(document.getElementById("jumlahUang").value) || 0;

    // Validasi apakah ada pesanan
    if (pesanan.length === 0) {
        alert("Anda belum memesan apa pun!");
        return;
    }

    // Validasi input data pelanggan
    if (!nama || !telepon || jumlahUang <= 0) {
        alert("Mohon isi semua data dengan benar!");
        return;
    }

    // Validasi apakah uang cukup
    if (jumlahUang < totalHarga) {
        alert("Uang tidak cukup!");
        return;
    }

    // Konfirmasi sebelum melakukan transaksi
    const konfirmasi = confirm("Apakah pesanan Anda sudah benar?");
    if (!konfirmasi) {
        return;
    }

    const kembalian = jumlahUang - totalHarga;

    let struk = `=== STRUK PEMBELIAN ===\nNama: ${nama}\nNo. Telepon: ${telepon}\n`;
    pesanan.forEach(item => {
        struk += `${item.name} (${item.jumlah} x Rp ${item.price}) = Rp ${item.jumlah * item.price}\n`;
    });
    struk += `\nTotal: Rp ${totalHarga}\nDibayar: Rp ${jumlahUang}\nKembalian: Rp ${kembalian}\n======================`;

    alert(struk);

    // Simpan transaksi
    transaksi.push({
        id: Date.now(),
        nama,
        telepon,
        totalHarga,
        status: "Proses",
        pesanan: pesanan.map(item => ({ name: item.name, jumlah: item.jumlah }))
    });

    localStorage.setItem("transaksi", JSON.stringify(transaksi));

    // Reset pesanan dan form checkout
    pesanan = [];
    document.getElementById("checkoutForm").classList.add("d-none");
    document.getElementById("pesananContainer").innerHTML = "";
    document.getElementById("totalKeseluruhan").textContent = "Rp 0";
    document.getElementById("nama").value = "";
    document.getElementById("telepon").value = "";
    document.getElementById("jumlahUang").value = "";
    document.getElementById("checkoutButton").classList.add("d-none");

    alert("Pesanan berhasil diproses!");
}


// Menampilkan transaksi pada halaman transaksi
function renderTransaksi() {
    const transaksiContainer = document.getElementById("transaksiContainer");
    transaksiContainer.innerHTML = "";

    let transaksi = JSON.parse(localStorage.getItem("transaksi")) || [];

    if (transaksi.length === 0) {
        transaksiContainer.innerHTML = "<tr><td colspan='6' class='text-center'>Belum ada transaksi</td></tr>";
        return;
    }

    transaksi.forEach((t, index) => {
        transaksiContainer.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${t.nama}</td>
                <td>${t.telepon}</td>
                <td>Rp ${t.totalHarga}</td>
                <td class="${t.status === 'Selesai' ? 'text-success' : 'text-warning'} fw-bold">${t.status}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="selesaikanTransaksi(${index})">Selesai</button>
                </td>
            </tr>
        `;
    });
}

// Mengubah status transaksi menjadi "Selesai"
function selesaikanTransaksi(index) {
    transaksi[index].status = "Selesai";
    localStorage.setItem("transaksi", JSON.stringify(transaksi));
    renderTransaksi();
}

document.addEventListener("DOMContentLoaded", function() {
    renderTransaksi();
});

if (document.getElementById("transaksiContainer")) {
    renderTransaksi();
}

renderMenu();
