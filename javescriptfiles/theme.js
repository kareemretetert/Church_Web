// تحميل الثيم أول ما الصفحة تفتح
(function(){
  const saved = localStorage.getItem("theme");
  if(saved){
    document.body.classList.toggle("dark", saved === "dark");
  }
})();

// تغيير الثيم
function toggleTheme(){
  const isDark = document.body.classList.toggle("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
}
