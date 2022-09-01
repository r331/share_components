class ShareOption {
  constructor(
    title,
    hasToggle,
    editor,
    isOn,
    logo,
    canDelete,
    hasToggleTag,
    requiresSavedInsight = true,
  ) {
    this._id = Math.random(); // TODO: use a proper id
    this._title = title; // the title to show on the sidebar
    this._hasToggle = hasToggle; // true if this option has a on/off toggle
    this._editor = editor; // the editor to open when this option is selected
    this._isOn = isOn; // true if the toggle is currently on
    this._logo = logo; // the logo to show
    this._canDelete = canDelete; // true if this option is deletable
    this._requiresSavedInsight = requiresSavedInsight; // false if this option also works with non-saved queries
    this._hasToggleTag = hasToggleTag;
  }

  id() {
    return this._id;
  }

  title() {
    return this._title;
  }

  hasToggle() {
    return this._hasToggle;
  }

  isOn() {
    return this._isOn;
  }

  editor() {
    return this._editor;
  }

  logo() {
    return this._logo;
  }

  canDelete() {
    return this._canDelete;
  }

  //
  // true if this option should be disabled for non-saved insights
  //
  requiresSavedInsight() {
    return this._requiresSavedInsight;
  }

  hasToggleTag() {
    return this._hasToggleTag;
  }
}

export default ShareOption;
