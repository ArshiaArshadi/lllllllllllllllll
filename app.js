// Drinko — menu rendering + small UI interactions (frontend only)

const products = [
  { name: "Espresso", desc: "pure strong coffee", price: "5.70$",
    img: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80" },
  { name: "Americano", desc: "espresso + hot water", price: "4.50$",
    img: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80" },
  { name: "Latte", desc: "espresso + lots of milk", price: "4.30$",
    img: "https://images.unsplash.com/photo-1592663527359-cf6642f54cff?auto=format&fit=crop&w=600&q=80" },
  { name: "Macchiato", desc: "espresso + small milk foam", price: "5.50$",
    img: "https://images.unsplash.com/photo-1517959105821-eaf2591984ca?auto=format&fit=crop&w=600&q=80" },
  { name: "Irish Coffee", desc: "coffee + whiskey + cream", price: "5.40$",
    img: "https://images.unsplash.com/photo-1558122104-355edad709f6?auto=format&fit=crop&w=600&q=80" },
  { name: "Flat White", desc: "espresso with thin layer of milk foam", price: "4.20$",
    img: "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=600&q=80" },
  { name: "Lungo", desc: "long espresso, more water", price: "4.80$",
    img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80" },
  { name: "Vienna Coffee", desc: "espresso + whipped cream", price: "5.20$",
    img: "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?auto=format&fit=crop&w=600&q=80" },
];

const grid = document.getElementById("menuGrid");
grid.innerHTML = products
  .map(
    (p) => `
  <article class="card">
    <div class="card-photo"><img src="${p.img}" alt="${p.name}" loading="lazy"></div>
    <h3>${p.name}</h3>
    <p>${p.desc}</p>
    <div class="card-foot">
      <span class="price">${p.price}</span>
      <button class="to-cart" type="button">to cart</button>
    </div>
  </article>`
  )
  .join("");

// category pills — active state only (frontend demo)
const pills = document.querySelectorAll(".pill");
pills.forEach((pill) =>
  pill.addEventListener("click", () => {
    pills.forEach((p) => p.classList.remove("active"));
    pill.classList.add("active");
  })
);

// carousel arrows — scroll the grid when it overflows (small screens)
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
function scrollGrid(dir) {
  grid.scrollBy({ left: dir * grid.clientWidth, behavior: "smooth" });
}
prevBtn.addEventListener("click", () => scrollGrid(-1));
nextBtn.addEventListener("click", () => scrollGrid(1));

// mobile nav
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");
hamburger.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  hamburger.setAttribute("aria-expanded", String(open));
});
navLinks.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => navLinks.classList.remove("open"))
);
