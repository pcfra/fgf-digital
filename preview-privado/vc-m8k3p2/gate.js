(function () {
  const KEY = 'fgf-preview-vc-m8k3p2';
  const PASS = 'valentina-fgf';
  const gate = document.getElementById('previewGate');
  const banner = document.getElementById('previewBanner');
  const form = document.getElementById('previewGateForm');
  const input = document.getElementById('previewPass');
  const error = document.getElementById('previewGateError');

  function unlock() {
    sessionStorage.setItem(KEY, 'ok');
    gate.hidden = true;
    banner.hidden = false;
    document.body.classList.remove('locked');
  }

  if (sessionStorage.getItem(KEY) === 'ok') {
    unlock();
    return;
  }

  document.body.classList.add('locked');
  gate.hidden = false;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value.trim() === PASS) {
      error.hidden = true;
      unlock();
    } else {
      error.hidden = false;
      input.focus();
    }
  });
})();
