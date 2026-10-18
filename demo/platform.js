(() => {
  'use strict';

  const button = document.getElementById('copy-snippet');
  const snippet = document.getElementById('snippet');
  const status = document.getElementById('copy-status');
  if (!button || !snippet || !status) return;

  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(snippet.textContent);
      status.textContent = 'Snippet copied';
      button.textContent = 'Copied';
      setTimeout(() => {
        button.textContent = button.dataset.label;
      }, 1500);
    } catch {
      status.textContent = "Couldn't copy the snippet, copy it manually.";
    }
  });
})();
