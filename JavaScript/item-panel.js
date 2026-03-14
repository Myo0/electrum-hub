const itemPanel = document.getElementById('item-panel');
const itemPanelClose = document.getElementById('item-panel-close');

itemPanelClose.addEventListener('click', () => {
  itemPanel.classList.remove('open');
  document.querySelectorAll('.item-row').forEach(r => r.classList.remove('active'));
});

function openItemPanel(item) {
  // Left-side mutual exclusivity
  document.getElementById('move-panel').classList.remove('open', 'open-right');
  document.querySelectorAll('.move-row').forEach(r => r.classList.remove('active'));
  document.getElementById('ability-panel').classList.remove('open');
  document.querySelectorAll('.ability-row').forEach(r => r.classList.remove('active'));
  document.getElementById('location-panel').classList.remove('open');
  document.querySelectorAll('.location-row').forEach(r => r.classList.remove('active'));
  document.getElementById('type-panel').classList.remove('open');
  document.querySelectorAll('.type-row').forEach(r => r.classList.remove('active'));

  document.getElementById('item-panel-name').textContent = item.name;
  document.getElementById('item-panel-icon').src = item.icon;
  document.getElementById('item-panel-icon').alt = item.name;
  document.getElementById('item-panel-effect').textContent = item.effect;

  itemPanel.classList.add('open');
}

window.openItemPanel = openItemPanel;
