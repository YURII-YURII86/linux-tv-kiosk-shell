window.KIOSK_SHELL_CONFIG = {
  title: "Linux TV Kiosk Shell",
  eyebrow: "LOCAL DASHBOARD",
  columns: 4,
  tickerPath: "ticker",
  cards: [
    { id: "clock", kicker: "TIME", title: "Clock", valuePath: "time.value", metaPath: "time.meta", statePath: "time.state", details: [{ label: "Timezone", path: "time.zone" }, { label: "Updated", path: "updated" }] },
    { id: "system", kicker: "SYSTEM", title: "System", valuePath: "system.load", unit: "%", metaPath: "system.meta", statePath: "system.state" },
    { id: "network", kicker: "NETWORK", title: "Network", valuePath: "network.status", metaPath: "network.meta", statePath: "network.state" },
    { id: "services", kicker: "SERVICES", title: "Services", valuePath: "services.ok", metaPath: "services.meta", statePath: "services.state" },
    { id: "storage", kicker: "STORAGE", title: "Storage", valuePath: "storage.used", unit: "%", metaPath: "storage.meta", statePath: "storage.state" },
    { id: "tasks", kicker: "TASKS", title: "Tasks", valuePath: "tasks.open", metaPath: "tasks.meta", statePath: "tasks.state" },
    { id: "remote", kicker: "REMOTE", title: "Remote", valuePath: "remote.action", metaPath: "remote.meta", statePath: "remote.state" },
    { id: "brief", kicker: "BRIEF", title: "Daily brief", valuePath: "brief.headline", metaPath: "brief.meta", statePath: "brief.state" }
  ]
};
