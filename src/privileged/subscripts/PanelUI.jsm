/* globals XUL_NS */

function PanelUI(doc) {
  this.site = null;
  this.doc = doc;

  let box = doc.createElementNS(XUL_NS, "vbox");

  let elt;

  elt = doc.createElementNS(XUL_NS, "description");
  elt.textContent = this.getString("fxmonitor.popupHeader");
  elt.classList.add("headerText");
  box.appendChild(elt);

  elt = doc.createElementNS(XUL_NS, "description");
  elt.classList.add("popupText");
  box.appendChild(elt);

  this.box = box;
}

PanelUI.prototype = {
  get FirefoxMonitorUtils() {
    // Set on every window by FirefoxMonitor.jsm for PanelUI to use.
    // Because sharing is caring.
    return this.doc.defaultView.FirefoxMonitorUtils;
  },

  getString(aKey) {
    return this.FirefoxMonitorUtils.getString(aKey);
  },

  getFormattedString(aKey, args) {
    return this.FirefoxMonitorUtils.getFormattedString(aKey, args);
  },

  get brandString() {
    if (this._brandString) {
      return this._brandString;
    }
    return this._brandString = this.getString("fxmonitor.brandName");
  },

  get primaryAction() {
    if (this._primaryAction) {
      return this._primaryAction;
    }
    return this._primaryAction = {
      label: this.getFormattedString("fxmonitor.checkButton.label", [this.brandString]),
      accessKey: this.getString("fxmonitor.checkButton.accessKey"),
      callback: () => {
        this.doc.defaultView.openTrustedLinkIn(
          `https://monitor.firefox.com/?breach=${this.site.Name}`, "tab", { });

        Services.telemetry.scalarAdd("fxmonitor.check_btn_clicked", 1);
      },
    };
  },

  get secondaryActions() {
    if (this._secondaryActions) {
      return this._secondaryActions;
    }
    return this._secondaryActions = [
      {
        label: this.getString("fxmonitor.dismissButton.label"),
        accessKey: this.getString("fxmonitor.dismissButton.accessKey"),
        callback: () => {
          Services.telemetry.scalarAdd("fxmonitor.dismiss_btn_clicked", 1);
        },
      }, {
        label: this.getFormattedString("fxmonitor.neverShowButton.label", [this.brandString]),
        accessKey: this.getString("fxmonitor.neverShowButton.accessKey"),
        callback: () => {
          this.FirefoxMonitorUtils.disable();
          Services.telemetry.scalarAdd("fxmonitor.never_show_btn_clicked", 1);
        },
      },
    ];
  },

  refresh(site) {
    this.site = site;

    let elt = this.box.querySelector(".popupText");
    elt.textContent = this.getFormattedString(
      "fxmonitor.popupText", [site.PwnCount, site.Name, site.Year, this.brandString]);
  },
};
