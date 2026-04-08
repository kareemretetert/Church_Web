(function(){
  const saved = localStorage.getItem("cv_theme");
  const system = window.matchMedia("(prefers-color-scheme: dark)").matches;

  applyTheme(saved || (system ? "dark" : "light"));
})();

function applyTheme(mode){
  document.body.classList.toggle("dark", mode === "dark");
  localStorage.setItem("cv_theme", mode);
}

function toggleTheme(){
  const isDark = document.body.classList.contains("dark");
  applyTheme(isDark ? "light" : "dark");
}
function goBack(){
window.history.back();
}
