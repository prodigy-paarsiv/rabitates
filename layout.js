async function injectPartial(targetId, filePath) {
  const node = document.getElementById(targetId);
  if (!node) return;
  try {
    const res = await fetch(filePath);
    if (!res.ok) return;
    const html = await res.text();
    node.innerHTML = html;
  } catch (e) {
    // Keep page usable even if partial load fails.
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  await injectPartial("site-header", "./header.html");
  await injectPartial("site-footer", "./footer.html");
});
