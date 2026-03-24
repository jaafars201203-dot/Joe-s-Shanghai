// 1. Warenkorb-Speicher
let cart = {}; 

// 2. Accordion-Logik (Kategorien öffnen/schließen)
document.querySelectorAll('.accordion-btn').forEach(button => {
    button.addEventListener('click', () => {
        const content = button.nextElementSibling;
        const icon = button.querySelector('.icon');

        if (content.style.maxHeight) {
            content.style.maxHeight = null;
            if(icon) icon.textContent = "+";
        } else {
            // Andere schließen
            document.querySelectorAll('.accordion-content').forEach(c => c.style.maxHeight = null);
            document.querySelectorAll('.icon').forEach(i => i.textContent = "+");
            // Dieses öffnen
            content.style.maxHeight = content.scrollHeight + "px";
            if(icon) icon.textContent = "-";
        }
    });
});

// 3. Mengen-Steuerung Initialisierung
// Wir suchen alle Plus/Minus Buttons direkt in den Karten
document.querySelectorAll('.menu-card').forEach(card => {
    const minusBtn = card.querySelector('.minus');
    const plusBtn = card.querySelector('.plus');
    const name = card.querySelector('h3').innerText;
    const price = parseFloat(card.querySelector('.price').innerText.replace('$', ''));

    if(plusBtn) {
        plusBtn.addEventListener('click', (e) => {
            e.preventDefault();
            updateQuantity(name, 1, price);
        });
    }

    if(minusBtn) {
        minusBtn.addEventListener('click', (e) => {
            e.preventDefault();
            updateQuantity(name, -1, price);
        });
    }
});

// 4. Die zentrale Rechen-Funktion
function updateQuantity(name, change, price) {
    if (!cart[name]) {
        cart[name] = { price: price, quantity: 0 };
    }

    cart[name].quantity += change;

    if (cart[name].quantity <= 0) {
        delete cart[name];
        updateDisplay(name, 0);
    } else {
        updateDisplay(name, cart[name].quantity);
    }
    
    updateCartBar();
    
    // Falls das Modal offen ist, direkt neu zeichnen
    if (document.getElementById('cart-modal').style.display === 'block') {
        renderModal();
    }
}

// 5. Anzeige im Menü aktualisieren (NUR für das eine Gericht!)
function updateDisplay(name, qty) {
    document.querySelectorAll('.menu-card').forEach(card => {
        if (card.querySelector('h3').innerText === name) {
            const qtyNum = card.querySelector('.qty-number');
            if(qtyNum) qtyNum.innerText = qty;
        }
    });
}

// 6. Roter Balken unten
function updateCartBar() {
    const bar = document.getElementById('cart-bar');
    const countSpan = document.getElementById('cart-count');
    let totalItems = 0;

    for (let id in cart) {
        totalItems += cart[id].quantity;
    }

    if(countSpan) countSpan.innerText = totalItems;
    if(bar) {
        bar.style.display = totalItems > 0 ? 'flex' : 'none';
        // Animation
        bar.classList.remove('cart-bounce');
        void bar.offsetWidth; 
        bar.classList.add('cart-bounce');
    }
}

// 7. Modal (Warenkorb) anzeigen
function renderModal() {
    const list = document.getElementById('cart-items-list');
    const totalSum = document.getElementById('total-sum');
    list.innerHTML = '';
    let grandTotal = 0;

    const items = Object.keys(cart);
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
        row.innerHTML = `
            <span style="flex:2; font-weight:600;">${name}</span>
            <div style="display:flex; align-items:center; gap:10px; flex:1; justify-content:center;">
                <button class="m-btn" data-name="${name}" data-ch="-1">-</button>
                <span style="font-weight:bold;">${item.quantity}</span>
                <button class="m-btn" data-name="${name}" data-ch="1">+</button>
            </div>
            <span style="flex:1; text-align:right; font-weight:bold;">$${rowTotal.toFixed(2)}</span>
        `;
        list.appendChild(row);
    });

    // Klicks im Modal
    list.querySelectorAll('.m-btn').forEach(b => {
        b.addEventListener('click', () => {
            const n = b.getAttribute('data-name');
            const c = parseInt(b.getAttribute('data-ch'));
            updateQuantity(n, c, cart[n].price);
        });
    });

    if(totalSum) totalSum.innerText = `$${grandTotal.toFixed(2)}`;
}

// 8. Buttons binden
document.getElementById('view-order-btn').onclick = () => {
    renderModal();
    document.getElementById('cart-modal').style.display = 'block';
};

document.querySelector('.close-modal').onclick = () => {
    document.getElementById('cart-modal').style.display = 'none';
};

// 9. Checkout Funktion
window.finalCheckout = function() {
    const inst = document.getElementById('order-instructions')?.value || "";
    let msg = "Redirecting to payment...";
    if (inst.trim() !== "") msg += "\n\nNote: " + inst;
    alert(msg);
    window.location.href = "https://order.toasttab.com/online/joes-shanghai";
};
