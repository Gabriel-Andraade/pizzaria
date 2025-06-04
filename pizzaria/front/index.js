const deliveryForm = document.getElementById("delivery-form");
if (deliveryForm) {
  deliveryForm.classList.remove("hidden");
}

const zipInput = document.getElementById("cep");
if (zipInput) {
  zipInput.addEventListener("input", async () => {
    const street = document.getElementById("rua");
    const neighborhood = document.getElementById("bairro");
    const city = document.getElementById("cidade");
    const state = document.getElementById("estado");
    const deliveryResult = document.getElementById("freteResult");

    street.value = "";
    neighborhood.value = "";
    city.value = "";
    state.value = "";
    if (deliveryResult) deliveryResult.textContent = "";

    const zip = zipInput.value.replace(/\D/g, "");
    if (zip.length === 8) {
      try {
        const response = await fetch(`/api/cep?cep=${encodeURIComponent(zip)}`);
        if (!response.ok) throw new Error("Error fetching ZIP code");
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        street.value = data.logradouro || "";
        neighborhood.value = data.bairro || "";
        city.value = data.localidade || "";
        state.value = data.uf || "";

        if (deliveryResult) deliveryResult.textContent = "Calculating...";
        const res = await fetch(`/api/frete?cep=${encodeURIComponent(zip)}`);
        if (!res.ok) throw new Error("Error fetching delivery");
        const deliveryData = await res.json();
        if (deliveryData.error || deliveryData.erro)
          throw new Error(deliveryData.error || deliveryData.erro);

        deliveryValue = deliveryData.value || 0;
        if (deliveryResult) {
          let valor = Number(deliveryData.value);
          let prazo = deliveryData.time || "";
          if (!isNaN(valor)) {
            deliveryResult.textContent = `Delivery: ${formatPrice(
              valor
            )} | Time: ${prazo} min`;
          } else {
            deliveryResult.textContent = "Delivery: -";
          }
          deliveryResult.style.color = "#00a859";
        }
        updateCartUI();
      } catch (error) {
        if (deliveryResult) {
          deliveryResult.textContent =
            error.message || "Error calculating delivery";
          deliveryResult.style.color = "red";
        }
        deliveryValue = 0;
        updateCartUI();
      }
    }
  });
}

let cart = JSON.parse(localStorage.getItem("cart")) || [];

let deliveryValue = 0;

function updateCartUI() {
  const cartItemsElement = document.querySelector(".cart-items");
  const subtotalElement = document.getElementById("subtotal");
  const cartItemsElementNew = document.getElementById("cart-items");
  const cartTotalElement = document.getElementById("cart-total");

  if (cartItemsElement && subtotalElement) {
    cartItemsElement.innerHTML = "";
    let subtotal = 0;
    cart.forEach((item) => {
      subtotal += item.price;
      const li = document.createElement("li");
      li.textContent = `${item.name} (${item.size}) - ${formatPrice(
        item.price
      )}`;
      cartItemsElement.appendChild(li);
    });
    subtotalElement.textContent = formatPrice(subtotal);
  }

  if (cartItemsElementNew && cartTotalElement) {
    cartItemsElementNew.innerHTML = "";
    let total = 0;
    cart.forEach((item, index) => {
      total += item.price;
      const li = document.createElement("li");
      li.classList.add("cart-item");
      li.innerHTML = `
        ${item.name} (${item.size}) - ${formatPrice(item.price)}
        <button class="remove-btn" onclick="removeFromCart(${index})">🗑</button>
      `;
      cartItemsElementNew.appendChild(li);
    });
    let totalWithDelivery = total;
    if (deliveryValue > 0) {
      totalWithDelivery += deliveryValue;
    }
    cartTotalElement.textContent = `$${totalWithDelivery.toFixed(2)}`;
  }
}

function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
}

function addToCart(buttonElement) {
  const card = buttonElement.closest(".pizza-card");
  const nameEl = card.querySelector(".pizza-name");
  let name = nameEl ? nameEl.textContent : "Product";
  let price = 0;

  const sizeSelect = card.querySelector(".pizza-size");
  if (sizeSelect) {
    const sizeText = sizeSelect.options[sizeSelect.selectedIndex].text;
    const match = name.match(/(.+)-\s*\$([\d,.]+)/);
    if (match) {
      name = `${match[1].trim()} (${sizeText})`;
      price = parseFloat(match[2].replace(",", "."));
    }
  } else {
    const match = name.match(/(.+)-\s*\$([\d,.]+)/);
    if (match) {
      name = match[1].trim();
      price = parseFloat(match[2].replace(",", "."));
    }
  }

  cart.push({ name, size: "", price });
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
}

document.querySelectorAll(".pizza-card").forEach((card) => {
  const pizzaNameElement = card.querySelector(".pizza-name");
  const match = pizzaNameElement.textContent.match(/\$([\d,.]+)/);
  if (match) {
    const basePrice = parseFloat(match[1].replace(",", "."));
    card.setAttribute("data-base-price", basePrice);
  }
});

function updatePrice(selectElement) {
  const card = selectElement.closest(".pizza-card");
  const basePrice = parseFloat(card.getAttribute("data-base-price"));
  const multiplier = parseFloat(
    selectElement.selectedOptions[0].dataset.multiplier
  );
  const newPrice = (basePrice * multiplier).toFixed(2);

  const pizzaNameElement = card.querySelector(".pizza-name");
  const pizzaName = pizzaNameElement.textContent.split(" - ")[0];
  pizzaNameElement.textContent = `${pizzaName} - $${newPrice}`;
}

const sliceCountSelect = document.getElementById("slice-count-select");
function clearCart() {
  cart = [];
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
}
function ensureClearCartButton() {
  let cartContainer = document.querySelector(".cart-container");

  if (!cartContainer) {
    cartContainer = document.createElement("div");
    cartContainer.className = "cart-container";
    document.body.appendChild(cartContainer);
  }
}
if (sliceCountSelect) {
  sliceCountSelect.addEventListener("change", renderSlices);
  renderSlices();
}
updateCartUI();
ensureClearCartButton();
document.querySelectorAll(".menu-tabs .tab").forEach((tab) => {
  tab.addEventListener("click", function () {
    document
      .querySelectorAll(".menu-tabs .tab")
      .forEach((t) => t.classList.remove("active"));
    this.classList.add("active");
    document.querySelectorAll(".menu-section.category").forEach((sec) => {
      sec.classList.add("hidden");
      sec.style.display = "none";
    });
    const target = this.getAttribute("data-target");
    const section = document.getElementById(target);
    section.classList.remove("hidden");
    section.style.display = "";
  });
});

document.querySelectorAll(".promo-card .promo-btn")[0].onclick = () => {
  document.getElementById("modalOverlay").classList.remove("hidden");
  document.getElementById("customPizzaCard").classList.remove("hidden");
  setTimeout(() => {
    document.getElementById("customPizzaCard").classList.add("show");
  }, 10);
};

document.querySelectorAll(".promo-card .promo-btn")[1].onclick = () => {
  document.getElementById("modalOverlay").classList.remove("hidden");
  document.getElementById("halfPizzaCard").classList.remove("hidden");
  setTimeout(() => {
    document.getElementById("halfPizzaCard").classList.add("show");
  }, 10);
};

document.addEventListener("DOMContentLoaded", () => {
  const cartDiv = document.getElementById("cart");
  if (!cartDiv) return;

  let isDragging = false;
  let offset = { x: 0, y: 0 };

  cartDiv.addEventListener("mousedown", (e) => {
    isDragging = true;
    offset.x = e.clientX - cartDiv.offsetLeft;
    offset.y = e.clientY - cartDiv.offsetTop;
    cartDiv.classList.add("dragging");
    cartDiv.style.position = "absolute";
    cartDiv.style.zIndex = "10000";
    cartDiv.style.cursor = "move";

    document.body.style.userSelect = "none";
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      cartDiv.classList.remove("dragging");
      cartDiv.style.cursor = "";
      document.body.style.userSelect = "";
    }
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    cartDiv.style.left = `${e.clientX - offset.x}px`;
    cartDiv.style.top = `${e.clientY - offset.y}px`;
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const openPaymentBtn = document.getElementById("openPaymentBtn");
  const paymentCard = document.getElementById("payment-card");

  function getAddressSummary() {
    const street = document.getElementById("rua")?.value || "";
    const neighborhood = document.getElementById("bairro")?.value || "";
    const city = document.getElementById("cidade")?.value || "";
    const state = document.getElementById("estado")?.value || "";
    if (street || neighborhood || city || state) {
      return `${street}, ${neighborhood}, ${city} - ${state}`;
    }
    return "Address not provided";
  }

  if (openPaymentBtn && paymentCard) {
    openPaymentBtn.onclick = () => {
      const pizzaList = document.getElementById("lista-pizzas");
      const subtotalEl = document.getElementById("subtotal");
      const deliveryEl = document.getElementById("frete");
      const totalFinalEl = document.getElementById("total-final");
      const addressOrder = document.getElementById("endereco-pedido");

      pizzaList.innerHTML = "";
      let subtotal = 0;

      cart.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = `${item.name} - ${formatPrice(item.price)}`;
        pizzaList.appendChild(li);
        subtotal += item.price;
      });

      subtotalEl.textContent = formatPrice(subtotal);
      deliveryEl.textContent = formatPrice(deliveryValue || 0);
      totalFinalEl.textContent = formatPrice(subtotal + (deliveryValue || 0));

      addressOrder.textContent = `Address: ${getAddressSummary()}`;

      paymentCard.classList.remove("hidden");
    };
  }

  const closePaymentCardBtn = document.getElementById("closePaymentCard");
  if (closePaymentCardBtn) {
    closePaymentCardBtn.onclick = () => {
      document.getElementById("payment-card").classList.add("hidden");
    };
  }

  const payBtn = document.getElementById("pagar-btn");
  if (payBtn) {
    payBtn.onclick = async () => {
      if (!getAddressSummary().includes(",")) {
        alert("Please fill in the complete address before finishing.");
        return;
      }
      payBtn.textContent = "Processing...";
      payBtn.disabled = true;

      const metodo = document.getElementById("metodo")?.value || "pix";
      if (metodo === "pix") {
        const total = parseFloat(
          (document.getElementById("total-final")?.textContent || "0").replace(
            /[^\d.]/g,
            ""
          )
        );
        const chavePix = "11994245270";
        const nome = "Mamacita's Pizza";
        const cidade = "Cotia";
        const payload = window.gerarPayloadPix(total, chavePix, nome, cidade);
        const qrUrl = await window.gerarQrCodeBase64(payload);

        const pixModal = document.getElementById("pixModal");
        pixModal.style.display = "flex";
        document.getElementById(
          "pixQrCode"
        ).innerHTML = `<img src="${qrUrl}" alt="Pix QR Code" style="width:220px;height:220px;" />`;
        document.getElementById("pixPayload").textContent = payload;

        payBtn.textContent = "Place Order";
        payBtn.disabled = false;
      } else {
        setTimeout(() => {
          window.location.href = "obrigado.html";
        }, 1200);
      }
    };
  }
});

(function ensurePixModal() {
  let pixModal = document.getElementById("pixModal");
  if (!pixModal) {
    pixModal = document.createElement("div");
    pixModal.id = "pixModal";
    pixModal.style.display = "none";
    pixModal.style.position = "fixed";
    pixModal.style.top = "0";
    pixModal.style.left = "0";
    pixModal.style.width = "100vw";
    pixModal.style.height = "100vh";
    pixModal.style.background = "rgba(0,0,0,0.7)";
    pixModal.style.zIndex = "9999";
    pixModal.style.justifyContent = "center";
    pixModal.style.alignItems = "center";
    pixModal.style.display = "none";
    pixModal.innerHTML = `
      <div style="background:#fff;padding:2rem;border-radius:8px;max-width:90vw;max-height:90vh;text-align:center;position:relative;">
        <button id="closePixModal" style="position:absolute;top:8px;right:8px;font-size:1.2rem;">✕</button>
        <h2>Pix Payment</h2>
        <div id="pixQrCode"></div>
        <p id="pixPayload" style="word-break:break-all;font-size:0.95rem;margin-top:1rem;"></p>
        <button id="pixPaidBtn" style="margin-top:1rem;" class="btn">I have paid</button>
      </div>
    `;
    document.body.appendChild(pixModal);
    pixModal.querySelector("#closePixModal").onclick = () => {
      pixModal.style.display = "none";
    };
    pixModal.querySelector("#pixPaidBtn").onclick = () => {
      pixModal.style.display = "none";
      window.location.href = "obrigado.html";
    };
  }
})();

function closeAllCards() {
  document.getElementById("modalOverlay").classList.add("hidden");
  const cards = document.querySelectorAll(".pizza-modal");
  cards.forEach((card) => {
    card.classList.remove("show");
    setTimeout(() => {
      card.classList.add("hidden");
    }, 400);
  });
}

const paymentForm = document.getElementById("paymentForm");
if (paymentForm) {
  paymentForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const msg = document.getElementById("paymentMsg");
    msg.textContent = "Processing payment...";
    msg.style.color = "#3f51b5";
    setTimeout(() => {
      msg.textContent = "Payment approved! 🎉";
      msg.style.color = "#00a859";
      setTimeout(() => {
        closeAllCards();
        msg.textContent = "";
        paymentForm.reset();
      }, 1500);
    }, 1200);
  });
}

function formatPrice(value) {
  return `$${value.toFixed(2)}`;
}
