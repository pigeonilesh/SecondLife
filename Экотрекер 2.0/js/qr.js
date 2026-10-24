let html5QrCode = null;

document.addEventListener('DOMContentLoaded', () => {
  const qrMainBtn = document.querySelector('.qr-scan-btn');
  const qrBalanceBtn = document.querySelector('.btn-action');
  const closeBtn = document.getElementById('close-qr-btn');
  const modal = document.getElementById('qr-modal');

  if (qrMainBtn) qrMainBtn.addEventListener('click', openScanner);
  if (qrBalanceBtn) qrBalanceBtn.addEventListener('click', openScanner);
  if (closeBtn) closeBtn.addEventListener('click', stopScanner);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) stopScanner();
    });
  }
});

function openScanner() {
  const modal = document.getElementById('qr-modal');
  if (!modal) return;
  modal.classList.add('active');

  if (typeof Html5Qrcode === 'undefined') { alert('Не удалось загрузить сканер QR. Проверьте подключение к интернету.'); modal.classList.remove('active'); return; }
  if (html5QrCode && html5QrCode.isScanning) return;
  html5QrCode = new Html5Qrcode("qr-reader");
  const config = { fps: 10, qrbox: { width: 220, height: 220 } };

  html5QrCode.start(
    { facingMode: "environment" },
    config,
    onScanSuccess,
    onScanFailure
  ).catch(err => {
    console.error("Ошибка камеры:", err);
    alert('Камера не запустилась. Для доступа к камере откройте сайт через HTTPS или localhost и разрешите доступ к камере.');
    stopScanner();
  });
}

function onScanSuccess(decodedText) {
  // Не начисляем баллы за произвольный QR-код. Допустим только зарегистрированный
  // демонстрационный идентификатор; production-проверка должна выполняться сервером.
  const token = String(decodedText || '').trim();
  if (token !== 'QR_CONTAINER_KTITS_01') {
    alert('QR-код не распознан как зарегистрированный контейнер. Баллы не начислены.');
    return;
  }
  stopScanner();
  
  // Вызов метода ядра для зачисления баллов
  const pointsEarned = 50;
  const wasteKgEarned = 0.5;
  const currentUserKey = EcoCore.getData().currentUserKey;

  EcoCore.addPoints(currentUserKey, pointsEarned, wasteKgEarned, "Пластик");

  alert(`🎉 Мусор успешно сдан!\n\nТокен контейнера: ${decodedText}\nВам начислено: +${pointsEarned} баллов (+0.5 кг).`);
}

function onScanFailure(error) {}

function stopScanner() {
  const modal = document.getElementById('qr-modal');
  if (html5QrCode && html5QrCode.isScanning) {
    html5QrCode.stop().then(() => {
      html5QrCode.clear();
      if (modal) modal.classList.remove('active');
    }).catch(err => {
      if (modal) modal.classList.remove('active');
    });
  } else {
    if (modal) modal.classList.remove('active');
  }
}