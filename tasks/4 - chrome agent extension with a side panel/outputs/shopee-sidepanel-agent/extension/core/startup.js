export function installPanelStartup(chromeApi = globalThis.chrome, onError = () => {}) {
  const initialize = () => {
    try {
      const pending = chromeApi?.sidePanel?.setPanelBehavior?.({ openPanelOnActionClick: true });
      Promise.resolve(pending).catch((error) => onError(error));
    } catch (error) {
      onError(error);
    }
  };
  chromeApi?.runtime?.onStartup?.addListener?.(initialize);
  chromeApi?.runtime?.onInstalled?.addListener?.(initialize);
  chromeApi?.action?.onClicked?.addListener?.((tab) => {
    try {
      const pending = chromeApi?.sidePanel?.open?.({ windowId: tab?.windowId });
      Promise.resolve(pending).catch((error) => onError(error));
    } catch (error) {
      onError(error);
    }
  });
  initialize();
  return { initialize };
}
