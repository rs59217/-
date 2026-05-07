const BRAND = { name: "H ESSENTIALS", whatsapp: "584122687310" };

const productsData = [
  { id:1, name:"Essential Jacket", price:180, category:"ropa", frames:24, path:"img/camisa/", sizes:["XS","S","M","L","XL"] },
  { id:2, name:"Urban Sneakers", price:220, category:"calzado", frames:36, path:"img/shoes/", sizes:["38","39","40","41","42","43"] },
  { id:3, name:"Minimal Watch", price:95, category:"accesorios", frames:24, path:"img/watch/", sizes:["Única"] },
  { id:4, name:" Watch", price:95, category:"accesorios", frames:24, path:"img/watch/", sizes:["Única"] }
];

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let activeCategory = "all";
let activePrice = "all";
let currentProduct = null;
let selectedSize = null;
let frame = 1;
let dragging = false;
let startX = 0;

const productsBox = document.getElementById("products");
const viewer = document.getElementById("viewer");

/* ================= RENDER PRODUCTS ================= */
function renderProducts(){
  productsBox.innerHTML = "";

  productsData.filter(p=>{
    if(activeCategory!=="all" && p.category!==activeCategory) return false;
    if(activePrice==="low" && p.price>=100) return false;
    if(activePrice==="mid" && (p.price<100 || p.price>200)) return false;
    if(activePrice==="high" && p.price<=200) return false;
    return true;
  }).forEach(p=>{
    productsBox.innerHTML += `
      <div class="card" onclick="openProduct(${p.id})">
        <img src="${p.path}01.png">
        <h3>${p.name}</h3>
        <div class="price">$${p.price}</div>
      </div>
    `;
  });
}
renderProducts();

/* ================= FILTROS ================= */
function setCategory(cat, btn){
  activeCategory = cat;
  document.querySelectorAll(".filter-btn").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  renderProducts();
}
function setPrice(p){ activePrice = p; renderProducts(); }

/* ================= PRODUCT VIEW ================= */
function openProduct(id){
  currentProduct = productsData.find(p=>p.id===id);
  selectedSize = null;
  frame = 1;

  document.getElementById("pvName").innerText = currentProduct.name;
  document.getElementById("pvPrice").innerText = currentProduct.price;

  const sizeBox = document.getElementById("sizeOptions");
  sizeBox.innerHTML = "";
  currentProduct.sizes.forEach(size=>{
    const btn = document.createElement("button");
    btn.className = "size-btn";
    btn.innerText = size;
    btn.onclick = ()=>{
      document.querySelectorAll(".size-btn").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      selectedSize = size;
    };
    sizeBox.appendChild(btn);
  });

  updateFrame();
  document.getElementById("productView").style.display="flex";
}

function closeProduct(){
  document.getElementById("productView").style.display="none";
}

/* ================= 360 ================= */
function updateFrame(){
  document.getElementById("viewerImg").src =
    `${currentProduct.path}${String(frame).padStart(2,"0")}.png`;
}

viewer.addEventListener("mousedown",e=>{dragging=true;startX=e.clientX});
viewer.addEventListener("mouseup",()=>dragging=false);
viewer.addEventListener("mouseleave",()=>dragging=false);
viewer.addEventListener("mousemove",e=>{if(dragging) rotate(e.clientX)});

viewer.addEventListener("touchstart",e=>{startX=e.touches[0].clientX});
viewer.addEventListener("touchmove",e=>rotate(e.touches[0].clientX));

function rotate(x){
  const diff = x-startX;
  if(Math.abs(diff)>8){
    frame += diff>0?1:-1;
    if(frame>currentProduct.frames) frame=1;
    if(frame<1) frame=currentProduct.frames;
    updateFrame();
    startX=x;
  }
}

/* ================= CART ================= */
function addCurrentProduct(){
  if(!selectedSize){ alert("Selecciona una talla"); return; }

  cart.push({ name: currentProduct.name, size:selectedSize, price:currentProduct.price });
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCart();
  closeProduct();
}

function updateCart(){
  document.getElementById("cartCount").innerText = cart.length;

  const mobile = document.getElementById("mobileCartCount");
  if(mobile){
    mobile.innerText = cart.length;
  }
}

function toggleCart(){
  document.getElementById("cartDrawer").classList.toggle("open");
  renderCart();
}

function renderCart(){
  const box = document.getElementById("cartItems");
  box.innerHTML = "";
  let total = 0;

  if(cart.length===0){
    box.innerHTML="<p style='color:#aaa'>El carrito está vacío</p>";
    document.getElementById("total").innerText=0;
    return;
  }

  cart.forEach((item,i)=>{
    total+=item.price;
    box.innerHTML+=`
      <div class="cart-item">
        <div>
          <strong>${item.name}</strong><br>
          Talla: ${item.size}<br>
          $${item.price}
        </div>
        <button class="remove-item" onclick="removeItem(${i})">✕</button>
      </div>
    `;
  });

  document.getElementById("total").innerText = total;
}

function removeItem(i){
  cart.splice(i,1);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCart();
  renderCart();
}

function clearCart(){
  cart=[];
  localStorage.removeItem("cart");
  updateCart();
  renderCart();
}

/* ================= WHATSAPP ================= */
function sendWhatsApp(){
  let message = "";
  let total = 0;

  const orderCode = generateOrderCode();

  if(cart.length === 0){
    message = `Hola 👋 Estoy interesado en los productos de ${BRAND.name}%0A%0A` +
              `Código de referencia: ${orderCode}`;
  }else{
    message =
      `*Pedido en ${BRAND.name}*%0A` +
      `*Código de pedido:* ${orderCode}%0A%0A`;

    cart.forEach(item => {
      total += item.price;
      message +=
        `• *${item.name}*%0A` +
        `  Talla: ${item.size}%0A` +
        `  Precio: $${item.price}%0A%0A`;
    });

    message +=
      `--------------------%0A` +
      `*TOTAL: $${total}*`;
  }

  const url = `https://wa.me/${BRAND.whatsapp}?text=${message}`;
  window.open(url, "_blank");

  /* Opcional: limpiar carrito después de enviar */
  // clearCart();
}


function toggleSearch(){
  alert("Buscador de productos próximamente ✅");
}

function sendWhatsAppDirect(){
  const message = `Hola 👋 Estoy interesado en sus productos de ${BRAND.name}`;
  window.open(`https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(message)}`, "_blank");
}

function toggleSearch(){
  const overlay = document.getElementById("searchOverlay");
  const input = document.getElementById("searchInput");

  if(overlay.style.display === "flex"){
    overlay.style.display = "none";
    input.value = "";
    document.getElementById("searchResults").innerHTML = "";
  }else{
    overlay.style.display = "flex";
    setTimeout(()=>input.focus(),100);
  }
}

function searchProducts(query){
  const resultsBox = document.getElementById("searchResults");
  resultsBox.innerHTML = "";

  if(query.trim() === "") return;

  const results = productsData.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  if(results.length === 0){
    resultsBox.innerHTML = "<p style='color:#555'>Sin resultados</p>";
    return;
  }

  results.forEach(p=>{
    const div = document.createElement("div");
    div.className = "search-item";
    div.innerHTML = `
      <strong>${p.name}</strong><br>
      $${p.price}
    `;
    div.onclick = ()=>{
      toggleSearch();
      openProduct(p.id);
    };
    resultsBox.appendChild(div);
  });
}

function generateOrderCode(){
  const today = new Date();
  const datePart =
    today.getFullYear().toString() +
    String(today.getMonth() + 1).padStart(2, "0") +
    String(today.getDate()).padStart(2, "0");

  let orderCount = parseInt(localStorage.getItem("orderCount")) || 0;
  orderCount += 1;
  localStorage.setItem("orderCount", orderCount);

  const countPart = String(orderCount).padStart(4, "0");

  return `HE-${datePart}-${countPart}`;
}