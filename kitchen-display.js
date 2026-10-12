window.kitchenPage = function kitchenPage() {
  const stages = [
    { status: 'New', action: 'Preparing', actionLabel: 'Start preparing' },
    { status: 'Preparing', action: 'Ready', actionLabel: 'Mark ready' },
    { status: 'Ready', action: 'Completed', actionLabel: 'Complete order' }
  ];
  const activeOrders = state.store.orders.filter(order => ['New', 'Preparing', 'Ready'].includes(order.status) && routedOrderLines(order, 'food').length).reverse();
  const ticket = order => {
    const lines = routedOrderLines(order, 'food').map(line => `<li><span>${esc(line.name)}</span><strong>×${Number(line.qty)}</strong></li>`).join('');
    const minutes = order.createdAt ? Math.max(0, Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)) : null;
    const age = minutes === null ? esc(order.time) : `${minutes} min ago`;
    const ageClass = minutes !== null && minutes >= 15 ? ' kitchen-overdue' : '';
    const next = stages.find(stage => stage.status === order.status);
    return `<article class="kitchen-ticket"><div class="kitchen-ticket-head"><div><span class="order-id">${esc(order.id)}</span><small>${esc(order.table)}</small></div><span class="kitchen-age${ageClass}">${age}</span></div><ul class="kitchen-lines">${lines}</ul><div class="kitchen-ticket-foot"><span>${esc(order.staff)}</span><strong>FOOD ONLY</strong></div><div class="kitchen-ticket-actions"><button class="button secondary kitchen-print" data-print-kitchen="${esc(order.id)}">Print food</button><button class="button kitchen-action" data-kitchen-order="${esc(order.id)}" data-kitchen-next="${next.action}">${next.actionLabel}</button></div></article>`;
  };
  return `${pageHeader('Kitchen <em>display.</em>', 'Food-only queue · move kitchen tickets through preparation and handoff.', '<span class="kitchen-live"><i></i> LIVE QUEUE</span>')}<section class="kitchen-board">${stages.map(stage => {
    const orders = activeOrders.filter(order => order.status === stage.status);
    return `<div class="kitchen-column"><div class="kitchen-column-head"><h2>${stage.status}</h2><span>${orders.length}</span></div><div class="kitchen-tickets">${orders.length ? orders.map(ticket).join('') : '<div class="kitchen-empty">No tickets in this stage</div>'}</div></div>`;
  }).join('')}</section>`;
};

document.addEventListener('click', event => {
  const drinksButton = event.target.closest('[data-print-drinks]');
  if (drinksButton) {
    const order = state.store.orders.find(item => item.id === drinksButton.dataset.printDrinks);
    if (!order) {
      showToast('This A&B ticket no longer exists.');
      return;
    }
    printOrderTicket(order, 'drinks');
    return;
  }
  const printButton = event.target.closest('[data-print-kitchen]');
  if (printButton) {
    const order = state.store.orders.find(item => item.id === printButton.dataset.printKitchen);
    if (!order) {
      showToast('This kitchen ticket no longer exists.');
      return;
    }
    printOrderTicket(order, 'food');
    return;
  }
  const button = event.target.closest('[data-kitchen-order]');
  if (!button) return;
  const order = state.store.orders.find(item => item.id === button.dataset.kitchenOrder);
  if (!order) {
    showToast('This kitchen ticket no longer exists.');
    return;
  }
  order.status = button.dataset.kitchenNext;
  saveStore();
  renderPage();
});

window.addEventListener('storage', event => {
  if (event.key !== STORE) return;
  state.store = readStore();
  if (state.user) renderPage();
});

if (state.user) renderApp();
