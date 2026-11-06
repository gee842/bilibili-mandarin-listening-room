// Set appearance before the stylesheet paints. Storage is optional in private browsing.
(()=>{
let appearance={dark:true,focus:false};
try{const saved=JSON.parse(localStorage.getItem('tingdong-appearance'));if(saved)appearance={dark:saved.dark!==false,focus:saved.focus===true};}catch{}
function apply(){const page=document.documentElement;page.dataset.theme=appearance.dark?'dark':'light';page.toggleAttribute('data-focus',appearance.focus);document.querySelector('meta[name=theme-color]')?.setAttribute('content',appearance.dark?'#131817':'#f5f2e9');}
apply();
addEventListener('DOMContentLoaded',()=>{
 const theme=document.getElementById('themeMode'),focus=document.getElementById('focusMode');
 function update(){apply();theme.setAttribute('aria-pressed',String(appearance.dark));theme.title=appearance.dark?'Switch to light mode':'Switch to dark mode';focus.setAttribute('aria-pressed',String(appearance.focus));try{localStorage.setItem('tingdong-appearance',JSON.stringify(appearance));}catch{}}
 theme.onclick=()=>{appearance.dark=!appearance.dark;update();};focus.onclick=()=>{appearance.focus=!appearance.focus;update();};update();
});
})();
