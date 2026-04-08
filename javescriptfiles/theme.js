// تحميل الثيم من كل الصفحات
(function(){
  const saved = localStorage.getItem("site_theme");
  if(saved === "dark"){
    document.body.classList.add("dark");
  }
})();

function toggleTheme(){
  document.body.classList.toggle("dark");

  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("site_theme", isDark ? "dark" : "light");
}
