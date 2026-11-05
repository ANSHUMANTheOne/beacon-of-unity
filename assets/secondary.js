(() => {
 const $=s=>document.querySelector(s);
 const theme=$('#theme-dial');if(theme){theme.setAttribute('role','button');theme.setAttribute('tabindex','0');theme.setAttribute('aria-label','Toggle day and night theme');theme.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();theme.click();}});}
 document.querySelectorAll('input,select,textarea').forEach(el=>{if(!el.id)return;const label=el.previousElementSibling;if(label?.tagName==='LABEL')label.htmlFor=el.id;else if(!el.getAttribute('aria-label'))el.setAttribute('aria-label',el.placeholder||el.id.replace(/([A-Z])/g,' $1'));});
 if(document.body.classList.contains('unity-login')){
  $('#email')?.setAttribute('autocomplete','email');$('#pass')?.setAttribute('autocomplete','current-password');$('#fullName')?.setAttribute('autocomplete','name');$('#statusMsg')?.setAttribute('role','status');
  const title=$('#loginForm .card-title');if(title)title.textContent='Welcome to your community.';
  const sub=$('#loginForm .card-sub');if(sub)sub.textContent='Sign in or create your Beacon of Unity account.';
  const action=$('#emailLoginBtn span');if(action)action.textContent='Continue with email →';
  const note=document.createElement('p');note.className='account-footnote';note.innerHTML='New here? Continuing with a new email creates an account. You will complete verification before joining. <a href="privacy.html">Privacy</a> · <a href="terms.html">Terms</a>';$('#loginForm').append(note);
 }
 if(document.body.classList.contains('unity-admin')){
  const labels=['Full name','Resident email','ID document','Actions'];const labelRows=()=>document.querySelectorAll('#tableBody tr').forEach(row=>[...row.children].forEach((td,i)=>td.setAttribute('data-label',labels[i]||'')));new MutationObserver(labelRows).observe($('#tableBody'),{childList:true,subtree:true});labelRows();
 }
})();
