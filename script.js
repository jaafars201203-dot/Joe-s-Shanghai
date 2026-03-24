document.querySelectorAll('.accordion-btn').forEach(button => {
    button.addEventListener('click', () => {
        const content = button.nextElementSibling;
        const icon = button.querySelector('.icon');

        if (content.style.maxHeight) {
            content.style.maxHeight = null;
            icon.textContent = "+";
        } else {
            document.querySelectorAll('.accordion-content').forEach(c => c.style.maxHeight = null);
            document.querySelectorAll('.icon').forEach(i => i.textContent = "+");
            content.style.maxHeight = content.scrollHeight + "px";
            icon.textContent = "-";
        }
    });
});

let cart = {}; // Speichert { "Gerichtname": { price: 15.95, quantity: 2 } }

// 2. INITIALISIERUNG DER MENÜ-BUTTONS (- 0 +)
document.querySelectorAll('.quantity-controls').forEach(control => {
    const minusBtn = control.querySelector('.minus');
    const plusBtn = control.querySelector('.plus');
    
    const card = control.closest('.menu-card');
    const name = card.querySelector('h3').innerText;
    const price = parseFloat(card.querySelector('.price').innerText.replace('$', ''));

    // Benutze 'click' aber stelle sicher, dass es auf iOS nicht blockiert wird
    plusBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        updateQuantity(name, 1, price);
    }, { passive: false });

    minusBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        updateQuantity(name, -1, price);
    }, { passive: false });
});


// 3. DIE ZENTRALE FUNKTION (Ändert Mengen überall)
function updateQuantity(name, change, price) {
    if (!cart[name]) {
        cart[name] = { price: price, quantity: 0 };
    }

    cart[name].quantity += change;

    if (cart[name].quantity <= 0) {
        delete cart[name];
        syncMenuDisplay(name, 0); // Setzt Anzeige im Menü auf 0
    } else {
        syncMenuDisplay(name, cart[name].quantity);
    }
    
    updateCartBar();

    if (document.getElementById('cart-modal').style.display === 'block') {
        renderModal();
    }
}

// 4. HILFSFUNKTION: Anzeige im Menü synchronisieren
function syncMenuDisplay(name, qty) {
    document.querySelectorAll('.menu-card').forEach(card => {
        if (card.querySelector('h3').innerText === name) {
            const qtyDisplay = card.querySelector('.qty-number');
            if (qtyDisplay) qtyDisplay.innerText = qty;
        }
    });
}

// 5. ROTEN BALKEN AKTUALISIEREN
// Diesen Block stattdessen einfügen:
function updateCartBar() {
    const bar = document.getElementById('cart-bar');
    const countSpan = document.getElementById('cart-count');
    
    let totalItems = 0;
    for (let name in cart) {
        totalItems += cart[name].quantity;
    }

    if(countSpan) countSpan.innerText = totalItems;
    
    if(bar) {
        if (totalItems > 0) {
            bar.style.display = 'flex';
            
            // Animation auslösen:
            bar.classList.remove('cart-bounce');
            void bar.offsetWidth; // Kurzer technischer Trick, um die Animation neu zu starten
            bar.classList.add('cart-bounce');
        } else {
            bar.style.display = 'none';
        }
    }
}


// 6. WARENKORB-INHALT ZEICHNEN (MODAL)
function renderModal() {
    const list = document.getElementById('cart-items-list');
    const totalSum = document.getElementById('total-sum');
    
    if (!list) return; // Sicherheits-Check
    
    list.innerHTML = '';
    let grandTotal = 0;

    const items = Object.keys(cart);
    
    // Wenn der Warenkorb leer ist, Modal schließen
    if (items.length === 0) {
        document.getElementById('cart-modal').style.display = 'none';
        return;
    }

    items.forEach(name => {
        const item = cart[name];
        const rowTotal = item.price * item.quantity;
        grandTotal += rowTotal;

        const row = document.createElement('div');
        row.className = "modal-item-row";
        
        // Wir nutzen hier Klassen für die Buttons, statt onclick direkt im HTML
        row.innerHTML = `
            <span style="flex:2; font-weight:600; font-size: 0.9rem;">${name}</span>
            <div style="display:flex; align-items:center; gap:12px; flex:1; justify-content:center;">
                <button class="modal-qty-btn minus-btn" data-name="${name}">-</button>
                <span style="font-weight:bold; min-width:20px; text-align:center;">${item.quantity}</span>
                <button class="modal-qty-btn plus-btn" data-name="${name}">+</button>
            </div>
            <span style="flex:1; text-align:right; font-weight:bold; font-size: 0.9rem;">$${rowTotal.toFixed(2)}</span>
        `;
        list.appendChild(row);
    });

    // WICHTIG FÜR IPHONE: Event Listener manuell hinzufügen
    list.querySelectorAll('.modal-qty-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const name = btn.getAttribute('data-name');
            const isPlus = btn.classList.contains('plus-btn');
            const change = isPlus ? 1 : -1;
            
            // Die Hauptfunktion aufrufen
            updateQuantity(name, change, cart[name].price);
        });
    });

    if(totalSum) totalSum.innerText = `$${grandTotal.toFixed(2)}`;
}

// 7. EVENT LISTENER FÜR BUTTONS
const viewBtn = document.getElementById('view-order-btn');
if(viewBtn) {
    viewBtn.onclick = () => {
        renderModal();
        document.getElementById('cart-modal').style.display = 'block';
    };
}

const closeBtn = document.querySelector('.close-modal');
if(closeBtn) {
    closeBtn.onclick = () => {
        document.getElementById('cart-modal').style.display = 'none';
    };
}

// 8. FINAL CHECKOUT
// Füge das hier neu ein:
window.finalCheckout = function() {
    // Holt sich den Text aus dem neuen Textfeld
    const instructions = document.getElementById('order-instructions') ? document.getElementById('order-instructions').value : "";
    
    let message = "Almost there! You are being redirected to our secure external payment page.";
    
    // Wenn der Nutzer etwas reingeschrieben hat, zeigen wir es in der Bestätigung an
    if (instructions.trim() !== "") {
        message += "\n\nYour note for the chef: \"" + instructions + "\"";
    }
    
    alert(message + "\n\nThank you for choosing Joe's Shanghai!");
    window.location.href = "https://order.toasttab.com/online/joes-shanghai";
};

