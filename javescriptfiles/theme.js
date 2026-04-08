(function(){
  const s = localStorage.getItem("cv_theme");
  const d = window.matchMedia("(prefers-color-scheme:dark)").matches;
  applyTheme(s || (d ? "dark" : "light"));
})();

function applyTheme(mode){
  document.body.classList.toggle("dark", mode === "dark");
  localStorage.setItem("cv_theme", mode);
}

function toggleTheme(){
  applyTheme(document.body.classList.contains("dark") ? "light" : "dark");
}
