// Fungsi untuk decode token JWT
function decodeToken(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error("Invalid token", error);
        return null;
    }
}

// Ambil token dari sessionStorage
const token = sessionStorage.getItem("token");

if (!token) {
    window.location.href = "../pages/login.html"; // Redirect ke login jika tidak ada token
} else {
    const decoded = decodeToken(token);
    if (decoded) {
        console.log("Decoded Token:", decoded);
        document.getElementById("fullName").innerText = decoded.fullName || "User";
    } else {
        console.error("Failed to decode token.");
        document.getElementById("fullName").innerText = "User";
    }
}

// Fungsi logout
function handleLogout() {
    const confirmLogout = confirm("Are you sure you want to logout?");
    if (confirmLogout) {
        sessionStorage.clear();
        window.location.href = "../pages/login.html";
    }
}

// Tampilkan modal saat tombol akun ditekan
document.getElementById("accountBtn").addEventListener("click", function () {
    const userData = decodeToken(token);
    if (userData) {
        document.getElementById("editUsername").value = userData.username || "";
        document.getElementById("editFullName").value = userData.fullName || "";
        document.getElementById("editPassword").value = ""; // Password tidak ditampilkan
    }
    new bootstrap.Modal(document.getElementById("accountModal")).show();
});

// Toggle password visibility
const passwordInput = document.getElementById("editPassword");
const togglePassword = document.getElementById("togglePassword");

togglePassword.addEventListener('click', () => {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        togglePassword.textContent = 'Hide';
    } else {
        passwordInput.type = 'password';
        togglePassword.textContent = 'Show';
    }
});

// Handle form submission (Update user data)
document.getElementById("accountForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const updatedData = {
        username: document.getElementById("editUsername").value,
        fullName: document.getElementById("editFullName").value,
        password: document.getElementById("editPassword").value
    };

    fetch("http://localhost:5000/user/edit", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                alert("Account updated successfully!");
                document.getElementById("fullName").innerText = data.data.fullName;
                bootstrap.Modal.getInstance(document.getElementById("accountModal")).hide();
            } else {
                alert("Error updating account: " + data.message);
            }
        })
        .catch(error => console.error("Error:", error));
});

// Fungsi untuk menghapus akun
function deleteAccount() {
    const confirmDelete = confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (confirmDelete) {
        const userData = decodeToken(token); // Decode token untuk mendapatkan id pengguna
        const userId = userData.id; // Ambil id pengguna dari token

        fetch(`http://localhost:5000/user/delete/${userId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                alert("Account deleted successfully.");
                sessionStorage.clear(); // Hapus semua data dari sessionStorage
                window.location.href = "../pages/login.html"; // Redirect ke halaman login
            } else {
                alert("Failed to delete account: " + data.message);
            }
        })
        .catch(error => console.error("Error deleting account:", error));
    }
}

// Tambahkan event listener untuk tombol hapus akun
document.getElementById("deleteAccountBtn").addEventListener("click", deleteAccount);

// Fungsi untuk mengambil dan menampilkan catatan
function fetchNotes() {
    fetch("http://localhost:5000/note/all", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                displayNotes(data.data);
            } else {
                alert("Failed to fetch notes.");
            }
        })
        .catch(error => console.error("Error fetching notes:", error));
}

// Fungsi untuk menampilkan catatan
function displayNotes(notes) {
    const container = document.getElementById("notes-container");
    container.innerHTML = "";

    notes.forEach(note => {
        const title = note.noteTitle;
        const content = note.noteContent;

        // Escape karakter baris baru
        const escapedContent = content.replace(/\n/g, "\\n");

        const noteCard = `
            <div class="col">
                <div class="card shadow-sm rounded-lg note-card">
                    <div class="card-header fw-bold">${title}</div>
                    <div class="card-body">
                        <p class="card-text text-muted note-content">${content}</p>
                        <div class="d-flex justify-content-center button-container">
                            <button class="btn btn-danger" onclick="deleteNote(${note.id})">DELETE</button>
                            <button class="btn btn-primary" onclick="openEditModal(${note.id}, '${note.noteTitle.replace(/'/g, "\\'")}', '${escapedContent.replace(/'/g, "\\'")}')">OPEN</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += noteCard;
    });
}

// Fungsi untuk membuka modal tambah catatan
function openCreateModal() {
    document.getElementById("modalTitle").innerText = "New Note";
    document.getElementById("noteId").value = "";
    document.getElementById("noteTitle").value = "";
    document.getElementById("noteContent").value = "";
    new bootstrap.Modal(document.getElementById("noteModal")).show();
}

// Fungsi untuk membuka modal edit catatan
function openEditModal(id, title, content) {
    document.getElementById("modalTitle").innerText = "Edit Note";
    document.getElementById("noteId").value = id;
    document.getElementById("noteTitle").value = title;
    document.getElementById("noteContent").value = content;
    new bootstrap.Modal(document.getElementById("noteModal")).show();
}

// Fungsi untuk menyimpan catatan
function saveNote() {
    const noteId = document.getElementById("noteId").value;
    const noteTitle = document.getElementById("noteTitle").value;
    const noteContent = document.getElementById("noteContent").value;

    const method = noteId ? "PUT" : "POST";
    const url = noteId
        ? `http://localhost:5000/note/edit/${noteId}`
        : "http://localhost:5000/note/new";

    fetch(url, {
        method: method,
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ noteTitle, noteContent })
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                alert("Note saved successfully!");
                fetchNotes();
                bootstrap.Modal.getInstance(document.getElementById("noteModal")).hide();
            } else {
                alert("Failed to save note: " + data.message);
            }
        })
        .catch(error => {
            console.error("Error saving note:", error);
            alert("An error occurred while saving the note.");
        });
}

// Fungsi untuk menghapus catatan
function deleteNote(noteId) {
    if (!confirm("Are you sure you want to delete this note?")) return;

    fetch(`http://localhost:5000/note/delete/${noteId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                fetchNotes();
            } else {
                alert("Failed to delete note.");
            }
        })
        .catch(error => console.error("Error deleting note:", error));
}

// Jalankan fetchNotes saat halaman dimuat
document.addEventListener("DOMContentLoaded", fetchNotes);