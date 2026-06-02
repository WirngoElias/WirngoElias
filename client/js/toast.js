// Simple toast utility
(function(){
  function createContainer(){
    let c = document.querySelector('.toast-container');
    if(!c){
      c = document.createElement('div');
      c.className = 'toast-container';
      document.body.appendChild(c);
    }
    return c;
  }

  window.showToast = function(message, type = 'info', duration = 4000){
    try{
      const container = createContainer();
      const toast = document.createElement('div');
      toast.className = 'toast ' + type;

      // allow short HTML fragments
      toast.innerHTML = String(message);

      container.appendChild(toast);

      // trigger animation
      requestAnimationFrame(()=> toast.classList.add('show'));

      // remove after duration
      setTimeout(()=>{
        toast.classList.remove('show');
        setTimeout(()=> toast.remove(), 300);
      }, duration);
    }catch(e){
      // fallback
      console.error('Toast error', e);
    }
  };
})();
