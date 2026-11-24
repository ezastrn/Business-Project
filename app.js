(() => {
  const STORAGE_KEY = 'requeue_tema40_state_v1';

  const PRESET_PREREQS = {
    'Dokumen / Bukti Pembelian Belum Lengkap': [
      'Menunjukkan struk / invoice pembelian asli',
      'Menyerahkan fotokopi / foto KTP pemilik',
      'Menunjukkan kartu garansi resmi',
    ],
    'Menunggu Verifikasi / Persetujuan Supervisor': [
      'Persetujuan supervisor pada formulir klaim',
      'Verifikasi nomor seri pada sistem pusat',
      'Konfirmasi kebijakan penggantian unit',
    ],
    'Menunggu Pengecekan Stok / Teknisi': [
      'Konfirmasi ketersediaan suku cadang dari gudang',
      'Hasil diagnosa awal dari teknisi',
      'Estimasi waktu pengerjaan disetujui pelanggan',
    ],
    'Kendala Administrasi / Pembayaran': [
      'Konfirmasi bukti transfer / pembayaran biaya servis',
      'Tanda tangan formulir serah terima perangkat',
      'Verifikasi data akun pelanggan',
    ],
    'Pelanggan Meminta Waktu Sebentar': [
      'Pelanggan kembali melapor ke meja informasi',
      'Konfirmasi keputusan akhir dari pelanggan',
    ],
  };

  function nowTime() {
    const d = new Date();
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }

  function createInitialState() {
    return {
      ticketCounter: 108,
      activeStep: 1,
      serving: {
        id: 'cust-101',
        ticket: 'A-101',
        name: 'Dimas Pratama',
        service: 'Klaim Garansi Produk',
        notes: 'Keluhan layar berkedip pada laptop seri ProBook.',
        requeued: false,
        previousReason: null,
        createdAt: '09:15',
      },
      activeQueue: [
        {
          id: 'cust-102',
          ticket: 'A-102',
          name: 'Nadia Kusuma',
          service: 'Servis & Diagnosa Perangkat',
          notes: 'Baterai cepat habis, ingin cek kesehatan baterai.',
          requeued: false,
          previousReason: null,
          createdAt: '09:20',
        },
        {
          id: 'cust-103',
          ticket: 'A-103',
          name: 'Hendra Wijaya',
          service: 'Konsultasi Layanan Bisnis',
          notes: 'Menanyakan paket maintenance perangkat kantor.',
          requeued: false,
          previousReason: null,
          createdAt: '09:24',
        },
      ],
      deferred: [
        {
          id: 'cust-104',
          ticket: 'A-104',
          name: 'Siti Rahmawati',
          service: 'Klaim Garansi Produk',
          reason: 'Dokumen / Bukti Pembelian Belum Lengkap',
          notes: 'Pelanggan sedang mengambil nota pembelian digital dari email kantor.',
          deferredAt: '09:05',
          markedReady: false,
          prerequisites: [
            { id: 'p-1', label: 'Menunjukkan struk / invoice pembelian asli', done: true },
            { id: 'p-2', label: 'Menunjukkan kartu garansi resmi', done: false },
          ],
        },
        {
          id: 'cust-105',
          ticket: 'A-105',
          name: 'Rizky Ramadhan',
          service: 'Pengajuan Penggantian Unit',
          reason: 'Menunggu Verifikasi / Persetujuan Supervisor',
          notes: 'Unit mengalami cacat pabrik kurang dari 7 hari sejak pembelian.',
          deferredAt: '08:50',
          markedReady: true,
          prerequisites: [
            { id: 'p-3', label: 'Verifikasi nomor seri pada sistem pusat', done: true },
            { id: 'p-4', label: 'Persetujuan supervisor pada formulir klaim', done: true },
          ],
        },
        {
          id: 'cust-106',
          ticket: 'A-106',
          name: 'Clara Salsabila',
          service: 'Servis & Diagnosa Perangkat',
          reason: 'Menunggu Pengecekan Stok / Teknisi',
          notes: 'Membutuhkan konfirmasi stok adaptor original sebelum dikerjakan.',
          deferredAt: '09:10',
          markedReady: false,
          prerequisites: [
            { id: 'p-5', label: 'Konfirmasi ketersediaan suku cadang dari gudang', done: false },
            { id: 'p-6', label: 'Estimasi waktu pengerjaan disetujui pelanggan', done: false },
          ],
        },
      ],
      logs: [
        {
          time: '09:15',
          type: 'info',
          message: 'A-101 (Dimas Pratama) mulai dilayani di Loket Aktif.',
        },
        {
          time: '09:10',
          type: 'defer',
          message: 'A-106 (Clara Salsabila) ditunda — Alasan: Menunggu Pengecekan Stok / Teknisi (2 prasyarat).',
        },
        {
          time: '09:05',
          type: 'defer',
          message: 'A-104 (Siti Rahmawati) ditunda — Alasan: Dokumen / Bukti Pembelian Belum Lengkap (2 prasyarat).',
        },
        {
          time: '09:02',
          type: 'ready',
          message: 'A-105 (Rizky Ramadhan) seluruh prasyarat terpenuhi & ditandai Siap Masuk Antrean.',
        },
      ],
    };
  }

  let state = loadState();
  let currentFilter = 'all';
  let searchQuery = '';
  let draftPrereqs = [];
  let pendingRequeueId = null;

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.activeQueue) && Array.isArray(parsed.deferred)) {
          return parsed;
        }
      }
    } catch (_) {
      // Fallback to initial state
    }
    return createInitialState();
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) {
      // Ignore storage quota errors
    }
  }

  function addLog(message, type = 'info') {
    state.logs.unshift({
      time: nowTime(),
      type,
      message,
    });
    if (state.logs.length > 60) state.logs.pop();
  }

  function setWorkflowStep(stepNum) {
    state.activeStep = stepNum;
    document.querySelectorAll('.wf-step').forEach((el) => {
      el.classList.toggle('active', Number(el.dataset.step) === stepNum);
    });
  }

  function showToast(message, variant = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${variant}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = 'all 0.2s ease';
      setTimeout(() => toast.remove(), 220);
    }, 3600);
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function allPrereqsMet(item) {
    return item.prerequisites.length > 0 && item.prerequisites.every((p) => p.done);
  }

  function ticketExists(ticketCode, excludeId = null) {
    const norm = ticketCode.trim().toUpperCase();
    if (state.serving && state.serving.id !== excludeId && state.serving.ticket.toUpperCase() === norm) {
      return true;
    }
    if (state.activeQueue.some((c) => c.id !== excludeId && c.ticket.toUpperCase() === norm)) {
      return true;
    }
    if (state.deferred.some((c) => c.id !== excludeId && c.ticket.toUpperCase() === norm)) {
      return true;
    }
    return false;
  }

  // ---------- RENDER FUNCTIONS ----------

  function renderAll() {
    saveState();
    setWorkflowStep(state.activeStep || 1);
    renderKPIs();
    renderServing();
    renderActiveQueue();
    renderDeferred();
    renderLogs();
  }

  function renderKPIs() {
    const requeuedCount = state.activeQueue.filter((c) => c.requeued).length;
    const readyCount = state.deferred.filter((d) => allPrereqsMet(d) && d.markedReady).length;
    const waitingCount = state.deferred.length - readyCount;

    document.getElementById('kpiServing').textContent = state.serving ? '1' : '0';
    document.getElementById('kpiServingName').textContent = state.serving
      ? `${state.serving.ticket} • ${state.serving.name}`
      : 'Loket sedang kosong';

    document.getElementById('kpiQueue').textContent = String(state.activeQueue.length);
    document.getElementById('kpiRequeuedInfo').textContent = `${requeuedCount} panggilan ulang aktif`;

    document.getElementById('kpiPending').textContent = String(state.deferred.length);
    document.getElementById('kpiWaitingPrereq').textContent = `${waitingCount} menunggu prasyarat`;

    document.getElementById('kpiReady').textContent = String(readyCount);

    document.getElementById('activeQueueCount').textContent = String(state.activeQueue.length);
    document.getElementById('countAllDeferred').textContent = String(state.deferred.length);
    document.getElementById('countWaitingDeferred').textContent = String(waitingCount);
    document.getElementById('countReadyDeferred').textContent = String(readyCount);
    document.getElementById('logCountBadge').textContent = String(state.logs.length);
  }

  function renderServing() {
    const container = document.getElementById('servingContainer');
    const statusBadge = document.getElementById('counterStatusBadge');

    if (!state.serving) {
      statusBadge.textContent = 'Kosong';
      statusBadge.classList.add('idle');
      container.innerHTML = `
        <div class="empty-state">
          <p>Belum ada pelanggan yang sedang dilayani di loket.</p>
          ${
            state.activeQueue.length > 0
              ? `<button type="button" class="btn btn-primary btn-sm" id="btnCallNextFromEmpty">Panggil Antrean Berikutnya (${escapeHtml(state.activeQueue[0].ticket)})</button>`
              : `<span class="rule-hint">Tambahkan pelanggan atau masukkan pelanggan tertunda yang sudah siap.</span>`
          }
        </div>
      `;
      const callBtn = document.getElementById('btnCallNextFromEmpty');
      if (callBtn) {
        callBtn.addEventListener('click', () => callCustomer(state.activeQueue[0].id));
      }
      return;
    }

    statusBadge.textContent = 'Melayani';
    statusBadge.classList.remove('idle');

    const c = state.serving;
    container.innerHTML = `
      <div class="serving-card">
        <div class="serving-top">
          <span class="ticket-pill ${c.requeued ? 'requeue' : ''}">${escapeHtml(c.ticket)}</span>
          ${
            c.requeued
              ? `<span class="requeue-tag">↻ Panggilan Ulang</span>`
              : `<span class="deferred-time">Masuk ${escapeHtml(c.createdAt)}</span>`
          }
        </div>
        <div class="serving-name">${escapeHtml(c.name)}</div>
        <div class="serving-service">${escapeHtml(c.service)}</div>
        ${
          c.previousReason
            ? `<div class="serving-note"><strong>Riwayat Penundaan Terjaga:</strong> Sebelumnya tertunda karena <em>${escapeHtml(c.previousReason)}</em> — semua prasyarat sudah terverifikasi.</div>`
            : c.notes
            ? `<div class="serving-note">${escapeHtml(c.notes)}</div>`
            : ''
        }
        <div class="serving-actions">
          <button type="button" class="btn btn-amber" id="btnDeferServing">
            ⏸ Tunda Layanan
          </button>
          <button type="button" class="btn btn-success" id="btnFinishServing">
            ✓ Selesai Layani
          </button>
        </div>
      </div>
    `;

    document.getElementById('btnDeferServing').addEventListener('click', () => {
      openDeferModal(c);
    });
    document.getElementById('btnFinishServing').addEventListener('click', finishServing);
  }

  function renderActiveQueue() {
    const list = document.getElementById('activeQueueList');
    if (state.activeQueue.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <p>Antrean aktif sedang kosong.</p>
          <span class="rule-hint">Klik "Tambah Pelanggan" atau masukkan kembali pelanggan tertunda yang sudah siap.</span>
        </div>
      `;
      return;
    }

    list.innerHTML = state.activeQueue
      .map(
        (c, idx) => `
        <div class="queue-item ${c.requeued ? 'is-requeued' : ''}">
          <div class="queue-item-left">
            <div class="queue-item-top">
              <span class="queue-ticket">#${idx + 1} • ${escapeHtml(c.ticket)}</span>
              <span class="queue-name">${escapeHtml(c.name)}</span>
              ${c.requeued ? `<span class="requeue-tag">↻ Panggilan Ulang</span>` : ''}
            </div>
            <div class="queue-meta">${escapeHtml(c.service)} • Masuk ${escapeHtml(c.createdAt)}</div>
            ${
              c.previousReason
                ? `<div class="queue-history-note">✓ Prasyarat terpenuhi (${escapeHtml(c.previousReason)})</div>`
                : ''
            }
          </div>
          <button type="button" class="btn btn-primary btn-sm" data-call-id="${escapeHtml(c.id)}">
            ${c.requeued ? 'Panggil Ulang' : 'Panggil'}
          </button>
        </div>
      `
      )
      .join('');

    list.querySelectorAll('[data-call-id]').forEach((btn) => {
      btn.addEventListener('click', () => callCustomer(btn.dataset.callId));
    });
  }

  function renderDeferred() {
    const container = document.getElementById('deferredList');

    const filtered = state.deferred.filter((item) => {
      const isReady = allPrereqsMet(item) && item.markedReady;
      if (currentFilter === 'waiting' && isReady) return false;
      if (currentFilter === 'ready' && !isReady) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const hay = `${item.ticket} ${item.name} ${item.service} ${item.reason} ${item.notes || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>Tidak ada pelanggan tertunda pada filter ini.</p>
          <span class="rule-hint">Gunakan tombol "Tunda Layanan" dari loket atau "Catat Penundaan Baru" untuk mencatat permintaan tertunda.</span>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered
      .map((item) => {
        const doneCount = item.prerequisites.filter((p) => p.done).length;
        const totalCount = item.prerequisites.length;
        const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
        const prereqsComplete = allPrereqsMet(item);
        const isReady = prereqsComplete && item.markedReady;

        let badgeHtml = `<span class="status-badge waiting">Menunggu Prasyarat (${doneCount}/${totalCount})</span>`;
        if (isReady) {
          badgeHtml = `<span class="status-badge ready">✓ Siap Masuk Antrean</span>`;
        } else if (prereqsComplete) {
          badgeHtml = `<span class="status-badge prereq-done">Prasyarat Lengkap — Perlu Tandai Siap</span>`;
        }

        const prereqItemsHtml = item.prerequisites
          .map(
            (p) => `
            <label class="prereq-item ${p.done ? 'done' : ''}">
              <input type="checkbox" data-toggle-prereq="${escapeHtml(item.id)}" data-prereq-id="${escapeHtml(p.id)}" ${p.done ? 'checked' : ''} />
              <span>${escapeHtml(p.label)}</span>
            </label>
          `
          )
          .join('');

        let actionButtonsHtml = '';
        if (!prereqsComplete) {
          actionButtonsHtml = `
            <button type="button" class="btn btn-locked btn-sm" data-blocked-ready="${escapeHtml(item.id)}">
              🔒 Tandai Siap
            </button>
            <button type="button" class="btn btn-locked btn-sm" data-blocked-requeue="${escapeHtml(item.id)}">
              🔒 Masukkan ke Antrean
            </button>
          `;
        } else if (!item.markedReady) {
          actionButtonsHtml = `
            <button type="button" class="btn btn-primary btn-sm" data-mark-ready="${escapeHtml(item.id)}">
              ✓ Tandai Siap
            </button>
            <button type="button" class="btn btn-locked btn-sm" data-blocked-requeue="${escapeHtml(item.id)}">
              🔒 Masukkan ke Antrean
            </button>
          `;
        } else {
          actionButtonsHtml = `
            <button type="button" class="btn btn-ghost btn-sm" data-unmark-ready="${escapeHtml(item.id)}">
              Batal Siap
            </button>
            <button type="button" class="btn btn-success btn-sm" data-open-requeue="${escapeHtml(item.id)}">
              ↻ Masukkan Kembali ke Antrean
            </button>
          `;
        }

        const ruleHint = isReady
          ? `<span class="rule-hint ready-text">✓ Semua prasyarat terpenuhi & sudah ditandai siap.</span>`
          : prereqsComplete
          ? `<span class="rule-hint">Klik "Tandai Siap" (Tahap 4) sebelum memasukkan kembali ke antrean.</span>`
          : `<span class="rule-hint">Sisa ${totalCount - doneCount} prasyarat belum terpenuhi.</span>`;

        return `
          <article class="deferred-card ${isReady ? 'status-ready' : ''}" data-card-id="${escapeHtml(item.id)}">
            <div class="deferred-card-header">
              <div class="deferred-title-group">
                <span class="queue-ticket">${escapeHtml(item.ticket)}</span>
                <span class="deferred-name">${escapeHtml(item.name)}</span>
                ${badgeHtml}
              </div>
              <span class="deferred-time">Ditunda pukul ${escapeHtml(item.deferredAt)}</span>
            </div>

            <div class="deferred-reason-box">
              <div><strong>Layanan:</strong> ${escapeHtml(item.service)}</div>
              <div><strong>Alasan Penundaan:</strong> ${escapeHtml(item.reason)}</div>
              ${item.notes ? `<div class="deferred-notes">Catatan: ${escapeHtml(item.notes)}</div>` : ''}
            </div>

            <div class="prereq-section">
              <div class="prereq-header">
                <span>Checklist Prasyarat Wajib</span>
                <span>${doneCount}/${totalCount} (${pct}%)</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill ${prereqsComplete ? 'complete' : ''}" style="width: ${pct}%"></div>
              </div>
              <div class="prereq-checklist">
                ${prereqItemsHtml}
              </div>
            </div>

            <div class="deferred-footer">
              ${ruleHint}
              <div class="deferred-actions">
                ${actionButtonsHtml}
              </div>
            </div>
          </article>
        `;
      })
      .join('');

    // Wire events on deferred cards
    container.querySelectorAll('[data-toggle-prereq]').forEach((cb) => {
      cb.addEventListener('change', () => {
        togglePrerequisite(cb.dataset.togglePrereq, cb.dataset.prereqId, cb.checked);
      });
    });

    container.querySelectorAll('[data-mark-ready]').forEach((btn) => {
      btn.addEventListener('click', () => markAsReady(btn.dataset.markReady, true));
    });

    container.querySelectorAll('[data-unmark-ready]').forEach((btn) => {
      btn.addEventListener('click', () => markAsReady(btn.dataset.unmarkReady, false));
    });

    container.querySelectorAll('[data-blocked-ready]').forEach((btn) => {
      btn.addEventListener('click', () => handleBlockedAction(btn.dataset.blockedReady, 'ready'));
    });

    container.querySelectorAll('[data-blocked-requeue]').forEach((btn) => {
      btn.addEventListener('click', () => handleBlockedAction(btn.dataset.blockedRequeue, 'requeue'));
    });

    container.querySelectorAll('[data-open-requeue]').forEach((btn) => {
      btn.addEventListener('click', () => openRequeueModal(btn.dataset.openRequeue));
    });
  }

  function renderLogs() {
    const list = document.getElementById('activityLogList');
    if (state.logs.length === 0) {
      list.innerHTML = `<div class="empty-state"><p>Belum ada aktivitas tercatat.</p></div>`;
      return;
    }

    list.innerHTML = state.logs
      .map(
        (log) => `
        <div class="log-item type-${escapeHtml(log.type)}">
          <div class="log-time">${escapeHtml(log.time)}</div>
          <div>${escapeHtml(log.message)}</div>
        </div>
      `
      )
      .join('');
  }

  // ---------- CORE BUSINESS ACTIONS ----------

  function callCustomer(customerId) {
    if (state.serving) {
      showToast(
        `Loket masih melayani ${state.serving.ticket} (${state.serving.name}). Selesaikan atau tunda terlebih dahulu.`,
        'warning'
      );
      return;
    }

    const idx = state.activeQueue.findIndex((c) => c.id === customerId);
    if (idx === -1) return;

    const [customer] = state.activeQueue.splice(idx, 1);
    state.serving = customer;
    addLog(
      `${customer.ticket} (${customer.name}) ${customer.requeued ? 'dipanggil ulang' : 'dipanggil'} ke Loket Aktif.`,
      customer.requeued ? 'requeue' : 'info'
    );
    showToast(
      `${customer.requeued ? 'Panggilan ulang' : 'Memanggil'} ${customer.ticket} — ${customer.name}`,
      'success'
    );
    renderAll();
  }

  function finishServing() {
    if (!state.serving) return;
    const finished = state.serving;
    state.serving = null;
    addLog(`${finished.ticket} (${finished.name}) selesai dilayani.`, 'ready');
    showToast(`Layanan ${finished.ticket} (${finished.name}) selesai!`, 'success');
    renderAll();
  }

  function togglePrerequisite(deferredId, prereqId, isChecked) {
    const item = state.deferred.find((d) => d.id === deferredId);
    if (!item) return;
    const prereq = item.prerequisites.find((p) => p.id === prereqId);
    if (!prereq) return;

    prereq.done = isChecked;
    setWorkflowStep(3);

    // Aturan bisnis: jika prasyarat dicabut, status "Siap" otomatis dibatalkan
    if (!isChecked && item.markedReady) {
      item.markedReady = false;
      addLog(
        `Status Siap untuk ${item.ticket} (${item.name}) dibatalkan otomatis karena prasyarat "${prereq.label}" belum terpenuhi.`,
        'defer'
      );
      showToast(`Status Siap ${item.ticket} dicabut karena prasyarat belum lengkap.`, 'warning');
    } else if (isChecked) {
      addLog(`Prasyarat "${prereq.label}" untuk ${item.ticket} (${item.name}) ditandai terpenuhi.`, 'info');
      if (allPrereqsMet(item)) {
        setWorkflowStep(4);
        showToast(`Semua prasyarat ${item.ticket} terpenuhi! Klik "Tandai Siap" untuk lanjut.`, 'success');
      }
    }
    renderAll();
  }

  function markAsReady(deferredId, readyValue) {
    const item = state.deferred.find((d) => d.id === deferredId);
    if (!item) return;

    if (readyValue && !allPrereqsMet(item)) {
      handleBlockedAction(deferredId, 'ready');
      return;
    }

    item.markedReady = readyValue;
    if (readyValue) {
      setWorkflowStep(4);
      addLog(`${item.ticket} (${item.name}) ditandai SIAP untuk dimasukkan kembali ke antrean.`, 'ready');
      showToast(`${item.ticket} ditandai Siap! Kini dapat dimasukkan kembali ke antrean.`, 'success');
    } else {
      setWorkflowStep(3);
      addLog(`Status Siap untuk ${item.ticket} (${item.name}) dibatalkan oleh petugas.`, 'info');
    }
    renderAll();
  }

  function handleBlockedAction(deferredId, actionType) {
    const item = state.deferred.find((d) => d.id === deferredId);
    if (!item) return;

    const missing = item.prerequisites.filter((p) => !p.done).map((p) => p.label);

    if (missing.length > 0) {
      const msg = `Ditolak oleh aturan sistem: ${item.ticket} belum bisa ${
        actionType === 'ready' ? 'ditandai siap' : 'masuk kembali ke antrean'
      } karena ${missing.length} prasyarat belum terpenuhi (${missing[0]}).`;
      addLog(msg, 'blocked');
      showToast(msg, 'error');
      renderLogs();
      return;
    }

    if (actionType === 'requeue' && !item.markedReady) {
      const msg = `Ditolak: Klik "Tandai Siap" terlebih dahulu untuk ${item.ticket} sebelum memasukkan kembali ke antrean.`;
      addLog(msg, 'blocked');
      showToast(msg, 'warning');
      renderLogs();
    }
  }

  function openRequeueModal(deferredId) {
    const item = state.deferred.find((d) => d.id === deferredId);
    if (!item) return;

    // Double guard aturan bisnis
    if (!allPrereqsMet(item) || !item.markedReady) {
      handleBlockedAction(deferredId, 'requeue');
      return;
    }

    pendingRequeueId = deferredId;
    document.getElementById('requeueSummary').innerHTML = `
      <strong>${escapeHtml(item.ticket)} — ${escapeHtml(item.name)}</strong><br/>
      Layanan: ${escapeHtml(item.service)}<br/>
      Prasyarat terpenuhi: ${item.prerequisites.length}/${item.prerequisites.length} (100%)
    `;
    document.getElementById('requeueModal').classList.remove('hidden');
  }

  function confirmRequeue() {
    if (!pendingRequeueId) return;
    const idx = state.deferred.findIndex((d) => d.id === pendingRequeueId);
    if (idx === -1) return;

    const item = state.deferred[idx];
    if (!allPrereqsMet(item) || !item.markedReady) {
      handleBlockedAction(pendingRequeueId, 'requeue');
      closeModal('requeueModal');
      return;
    }

    const posRadio = document.querySelector('input[name="requeuePosition"]:checked');
    const position = posRadio ? posRadio.value : 'priority';

    state.deferred.splice(idx, 1);

    const requeuedCustomer = {
      id: item.id,
      ticket: item.ticket,
      name: item.name,
      service: item.service,
      notes: item.notes,
      requeued: true,
      previousReason: item.reason,
      createdAt: nowTime(),
    };

    if (position === 'priority') {
      state.activeQueue.unshift(requeuedCustomer);
    } else {
      state.activeQueue.push(requeuedCustomer);
    }

    setWorkflowStep(5);
    addLog(
      `${item.ticket} (${item.name}) dimasukkan kembali ke Antrean Aktif (${
        position === 'priority' ? 'Prioritas Panggilan Ulang' : 'Antrean Reguler'
      }).`,
      'requeue'
    );
    showToast(
      `${item.ticket} (${item.name}) berhasil masuk kembali ke antrean aktif!`,
      'success'
    );

    pendingRequeueId = null;
    closeModal('requeueModal');
    renderAll();
  }

  // ---------- MODAL: CATAT PENUNDAAN ----------

  function openDeferModal(fromCustomer = null) {
    const form = document.getElementById('deferForm');
    form.reset();
    hideError('deferErrorBox');
    draftPrereqs = [];

    const idInput = document.getElementById('deferCustomerId');
    const ticketInput = document.getElementById('deferTicket');
    const nameInput = document.getElementById('deferName');
    const serviceInput = document.getElementById('deferService');
    const notesInput = document.getElementById('deferNotes');

    if (fromCustomer) {
      idInput.value = fromCustomer.id;
      ticketInput.value = fromCustomer.ticket;
      ticketInput.readOnly = true;
      nameInput.value = fromCustomer.name;
      nameInput.readOnly = true;
      serviceInput.value = fromCustomer.service;
      notesInput.value = fromCustomer.notes || '';
    } else {
      idInput.value = '';
      ticketInput.value = `A-${state.ticketCounter}`;
      ticketInput.readOnly = false;
      nameInput.readOnly = false;
    }

    renderPresetChips('');
    renderDraftPrereqs();
    setWorkflowStep(1);
    document.getElementById('deferModal').classList.remove('hidden');
  }

  function renderPresetChips(reason) {
    const container = document.getElementById('presetPrereqs');
    const presets = PRESET_PREREQS[reason] || [
      'Menunjukkan dokumen identitas / bukti pembelian',
      'Konfirmasi verifikasi dari petugas terkait',
      'Pelanggan kembali melapor ke loket',
    ];

    container.innerHTML = presets
      .map(
        (label) =>
          `<button type="button" class="chip" data-preset="${escapeHtml(label)}">+ ${escapeHtml(label)}</button>`
      )
      .join('');

    container.querySelectorAll('[data-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        addDraftPrereq(btn.dataset.preset);
      });
    });
  }

  function addDraftPrereq(label) {
    const clean = label.trim();
    if (!clean) return;
    if (draftPrereqs.some((p) => p.toLowerCase() === clean.toLowerCase())) {
      showToast('Prasyarat tersebut sudah ada di daftar.', 'warning');
      return;
    }
    draftPrereqs.push(clean);
    setWorkflowStep(3);
    renderDraftPrereqs();
  }

  function renderDraftPrereqs() {
    const list = document.getElementById('selectedPrereqList');
    if (draftPrereqs.length === 0) {
      list.innerHTML = `<li class="field-hint">Belum ada prasyarat dipilih. Pilih chip di atas atau tambahkan manual.</li>`;
      return;
    }
    list.innerHTML = draftPrereqs
      .map(
        (label, idx) => `
        <li class="selected-prereq-item">
          <span>${idx + 1}. ${escapeHtml(label)}</span>
          <button type="button" data-remove-prereq="${idx}" aria-label="Hapus prasyarat">Hapus</button>
        </li>
      `
      )
      .join('');

    list.querySelectorAll('[data-remove-prereq]').forEach((btn) => {
      btn.addEventListener('click', () => {
        draftPrereqs.splice(Number(btn.dataset.removePrereq), 1);
        renderDraftPrereqs();
      });
    });
  }

  function handleDeferSubmit(e) {
    e.preventDefault();
    hideError('deferErrorBox');

    const existingId = document.getElementById('deferCustomerId').value.trim();
    const ticket = document.getElementById('deferTicket').value.trim().toUpperCase();
    const name = document.getElementById('deferName').value.trim();
    const service = document.getElementById('deferService').value.trim();
    const reason = document.getElementById('deferReason').value.trim();
    const notes = document.getElementById('deferNotes').value.trim();

    const errors = [];
    if (!ticket) errors.push('Nomor antrean wajib diisi.');
    if (!name) errors.push('Nama pelanggan wajib diisi.');
    if (!service) errors.push('Jenis layanan wajib dipilih.');
    if (!reason) errors.push('Alasan penundaan wajib dipilih.');
    if (draftPrereqs.length === 0) {
      errors.push('Minimal satu prasyarat wajib ditentukan sebelum menyimpan penundaan.');
    }
    if (ticket && ticketExists(ticket, existingId || null)) {
      errors.push(`Nomor antrean ${ticket} sudah aktif di sistem. Gunakan nomor lain.`);
    }

    if (errors.length > 0) {
      showError('deferErrorBox', errors.join(' '));
      return;
    }

    // Jika berasal dari loket aktif, kosongkan loket
    if (existingId && state.serving && state.serving.id === existingId) {
      state.serving = null;
    } else if (!existingId) {
      state.ticketCounter += 1;
    }

    const newDeferred = {
      id: existingId || `cust-${Date.now()}`,
      ticket,
      name,
      service,
      reason,
      notes,
      deferredAt: nowTime(),
      markedReady: false,
      prerequisites: draftPrereqs.map((label, i) => ({
        id: `p-${Date.now()}-${i}`,
        label,
        done: false,
      })),
    };

    state.deferred.unshift(newDeferred);
    setWorkflowStep(3);
    addLog(
      `${ticket} (${name}) dicatat tertunda — Alasan: ${reason} (${newDeferred.prerequisites.length} prasyarat wajib).`,
      'defer'
    );
    showToast(`${ticket} (${name}) berhasil dicatat ke Papan Pelanggan Tertunda.`, 'warning');

    closeModal('deferModal');
    renderAll();
  }

  // ---------- MODAL: TAMBAH PELANGGAN BARU ----------

  function handleAddCustomerSubmit(e) {
    e.preventDefault();
    hideError('addErrorBox');

    const name = document.getElementById('addName').value.trim();
    const service = document.getElementById('addService').value.trim();
    const notes = document.getElementById('addNotes').value.trim();

    const errors = [];
    if (!name) errors.push('Nama pelanggan wajib diisi.');
    if (!service) errors.push('Jenis layanan wajib dipilih.');

    if (errors.length > 0) {
      showError('addErrorBox', errors.join(' '));
      return;
    }

    const ticket = `A-${state.ticketCounter}`;
    state.ticketCounter += 1;

    state.activeQueue.push({
      id: `cust-${Date.now()}`,
      ticket,
      name,
      service,
      notes,
      requeued: false,
      previousReason: null,
      createdAt: nowTime(),
    });

    addLog(`Pelanggan baru ${ticket} (${name}) ditambahkan ke Antrean Aktif.`, 'info');
    showToast(`${ticket} (${name}) masuk ke Antrean Aktif.`, 'success');

    document.getElementById('addCustomerForm').reset();
    closeModal('addCustomerModal');
    renderAll();
  }

  // ---------- HELPERS ----------

  function showError(boxId, message) {
    const box = document.getElementById(boxId);
    box.textContent = message;
    box.classList.remove('hidden');
  }

  function hideError(boxId) {
    const box = document.getElementById(boxId);
    box.textContent = '';
    box.classList.add('hidden');
  }

  function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
  }

  // ---------- INITIALIZE EVENTS ----------

  function init() {
    document.getElementById('btnOpenAddCustomer').addEventListener('click', () => {
      hideError('addErrorBox');
      document.getElementById('addCustomerForm').reset();
      document.getElementById('addCustomerModal').classList.remove('hidden');
    });

    document.getElementById('btnDirectDefer').addEventListener('click', () => {
      openDeferModal(null);
    });

    document.getElementById('btnResetDemo').addEventListener('click', () => {
      state = createInitialState();
      currentFilter = 'all';
      searchQuery = '';
      document.getElementById('searchDeferred').value = '';
      document.querySelectorAll('.filter-tab').forEach((t) => {
        t.classList.toggle('active', t.dataset.filter === 'all');
      });
      showToast('Data contoh berhasil dikembalikan ke kondisi awal.', 'info');
      renderAll();
    });

    document.getElementById('btnToggleLog').addEventListener('click', () => {
      document.getElementById('logDrawer').classList.remove('hidden');
    });

    document.getElementById('btnCloseLog').addEventListener('click', () => {
      document.getElementById('logDrawer').classList.add('hidden');
    });

    document.getElementById('logDrawer').addEventListener('click', (e) => {
      if (e.target.id === 'logDrawer') {
        document.getElementById('logDrawer').classList.add('hidden');
      }
    });

    document.querySelectorAll('[data-close-modal]').forEach((btn) => {
      btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
    });

    document.querySelectorAll('.modal-overlay').forEach((overlay) => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.add('hidden');
      });
    });

    document.getElementById('deferReason').addEventListener('change', (e) => {
      setWorkflowStep(2);
      renderPresetChips(e.target.value);
    });

    document.getElementById('btnAddCustomPrereq').addEventListener('click', () => {
      const input = document.getElementById('customPrereqInput');
      if (input.value.trim()) {
        addDraftPrereq(input.value);
        input.value = '';
        input.focus();
      }
    });

    document.getElementById('customPrereqInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('btnAddCustomPrereq').click();
      }
    });

    document.getElementById('deferForm').addEventListener('submit', handleDeferSubmit);
    document.getElementById('addCustomerForm').addEventListener('submit', handleAddCustomerSubmit);
    document.getElementById('btnConfirmRequeue').addEventListener('click', confirmRequeue);

    document.querySelectorAll('.filter-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        currentFilter = tab.dataset.filter;
        document.querySelectorAll('.filter-tab').forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        renderDeferred();
      });
    });

    document.getElementById('searchDeferred').addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderDeferred();
    });

    renderAll();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
