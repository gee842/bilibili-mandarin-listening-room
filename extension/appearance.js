// Apply the user's page appearance before video-page content paints.
(()=>{
let appearance={dark:true,focus:false};
function apply(){
 const page=document.documentElement;if(!page)return;
 const video=/^\/(?:en\/)?video\/BV[0-9A-Za-z]{10}(?:\/|$)/.test(location.pathname);
 if(video){page.dataset.tingdongTheme=appearance.dark?'dark':'light';page.toggleAttribute('data-tingdong-focus',appearance.focus);}
 else{page.removeAttribute('data-tingdong-theme');page.removeAttribute('data-tingdong-focus');}
}
function accept(saved){appearance={dark:saved?.dark!==false,focus:saved?.focus===true};apply();}
apply();chrome.storage.local.get('appearance').then(x=>accept(x.appearance)).catch(()=>{});
chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&changes.appearance)accept(changes.appearance.newValue);});
setInterval(apply,750);
})();
