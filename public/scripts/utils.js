(() => {
  const locale = "pt-BR";

  const toDate = (value) => {
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
    }
    if (typeof value === "number") {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date;
    }
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    return null;
  };

  const formatDate = (value, opts = {}) => {
    const date = toDate(value);
    if (!date) return "--";
    try {
      return date.toLocaleDateString(locale, { timeZone: "UTC", ...opts });
    } catch (err) {
      return "--";
    }
  };

  const formatTime = (value, opts = {}) => {
    if (typeof value === "string" && /^\d{2}:\d{2}(:\d{2})?$/.test(value)) {
      return value.substring(0, 5);
    }
    const date = toDate(value);
    if (!date) return "--";
    return date.toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
      ...opts,
    });
  };

  const formatDateTime = (value, opts = {}) => {
    const date = toDate(value);
    if (!date) return "--";
    return date.toLocaleString(locale, {
      hour: "2-digit",
      minute: "2-digit",
      ...opts,
    });
  };

  const formatPhone = (value = "") => {
    const digits = value.replace(/\D/g, "");
    if (digits.length === 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    if (digits.length === 11) {
      return digits.replace(/(\d{2})(\d)(\d{4})(\d{4})/, "($1) $2 $3-$4");
    }
    return value;
  };

  const slugify = (value = "") => value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .trim();

  const renderRows = (tbody, rows, emptyColSpan = 1, emptyMessage = "Sem registros.") => {
    if (!tbody) return;
    tbody.innerHTML = rows.length
      ? rows.join("")
      : `<tr><td colspan="${emptyColSpan}" class="muted" style="text-align:center">${emptyMessage}</td></tr>`;
  };

  const debounce = (fn, delay = 200) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(null, args), delay);
    };
  };

  window.Utils = {
    formatDate,
    formatTime,
    formatDateTime,
    formatPhone,
    slugify,
    renderRows,
    debounce,
  };
})();
