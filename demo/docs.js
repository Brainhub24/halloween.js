(() => {
  'use strict';

  const button = document.querySelector('[data-copy-md]');
  const status = document.querySelector('[data-copy-md-status]');
  const label = button?.querySelector('[data-copy-md-text]');
  if (!button || !status || !label) return;

  button.addEventListener('click', async () => {
    try {
      const response = await fetch(button.dataset.copyMd);
      if (!response.ok) throw new Error(String(response.status));
      await navigator.clipboard.writeText(await response.text());
      status.textContent = 'Page copied as Markdown';
      label.textContent = 'Copied';
      setTimeout(() => {
        label.textContent = button.dataset.label;
      }, 1500);
    } catch {
      status.textContent = "Couldn't copy, use View as Markdown instead.";
    }
  });
})();
